package com.itofficerhub.service;

import com.itofficerhub.dto.ProfileOfDayDto;
import com.itofficerhub.entity.DailySpotlight;
import com.itofficerhub.entity.MockTest;
import com.itofficerhub.entity.TestAttempt;
import com.itofficerhub.entity.User;
import com.itofficerhub.repository.DailySpotlightRepository;
import com.itofficerhub.repository.TestAttemptRepository;
import com.itofficerhub.util.AppTime;
import com.itofficerhub.util.MockVisibility;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Aspirant of the day: top scorer on today's featured mock among attempts submitted today (IST).
 * Re-synced whenever a better (or newly top-ranked) attempt is submitted, until expiry.
 */
@Service
public class DailySpotlightService {

	private static final Duration SPOTLIGHT_TTL = Duration.ofHours(24);

	private final MockCatalogService mockCatalogService;
	private final DailySpotlightRepository spotlightRepository;
	private final TestAttemptRepository attemptRepository;
	private final UserDisplayService userDisplayService;
	private final MockRankingCacheService rankingCache;

	public DailySpotlightService(MockCatalogService mockCatalogService, DailySpotlightRepository spotlightRepository,
			TestAttemptRepository attemptRepository, UserDisplayService userDisplayService,
			MockRankingCacheService rankingCache) {
		this.mockCatalogService = mockCatalogService;
		this.spotlightRepository = spotlightRepository;
		this.attemptRepository = attemptRepository;
		this.userDisplayService = userDisplayService;
		this.rankingCache = rankingCache;
	}

	/** Own read-write transaction — must not join dashboard @Transactional(readOnly). */
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void refreshAfterSubmit(long mockTestId) {
		Instant now = Instant.now();
		mockCatalogService.featuredMock(now).ifPresent(m -> {
			if (m.getId() != mockTestId) {
				return;
			}
			if (!MockVisibility.goLiveDate(m).equals(AppTime.today())) {
				return;
			}
			cleanup(m.getId());
			syncAward(m);
		});
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Optional<ProfileOfDayDto> currentProfile() {
		return mockCatalogService.featuredMock(Instant.now()).flatMap(mock -> {
			cleanup(mock.getId());
			Instant now = Instant.now();
			syncAward(mock);
			return spotlightRepository.findActiveForMock(mock.getId(), now).map(s -> toDto(s, mock));
		});
	}

	private void cleanup(long featuredMockId) {
		Instant now = Instant.now();
		spotlightRepository.deleteExpired(now);
		spotlightRepository.deleteForOtherMocks(featuredMockId);
	}

	/** When admin publishes or schedules mocks, drop spotlight tied to old featured exams. */
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void onCatalogChange() {
		Instant now = Instant.now();
		spotlightRepository.deleteExpired(now);
		mockCatalogService.featuredMock(now).ifPresent(m -> cleanup(m.getId()));
	}

	/**
	 * Keep spotlight aligned with today's #1 on the featured mock (best score per user, then faster time).
	 * Creates the row if missing; updates user/score when ranking changes.
	 */
	private void syncAward(MockTest mock) {
		List<TestAttempt> rankedToday = rankingCache.bestAttemptsPerUserToday(mock.getId());
		if (rankedToday.isEmpty()) {
			return;
		}
		TestAttempt top = rankedToday.get(0);
		if (!AppTime.isToday(top.getSubmittedAt())) {
			return;
		}
		Instant now = Instant.now();
		Optional<DailySpotlight> activeOpt = spotlightRepository.findActiveForMock(mock.getId(), now);
		if (activeOpt.isEmpty()) {
			DailySpotlight s = new DailySpotlight();
			s.setUser(top.getUser());
			s.setMockTest(mock);
			s.setNetScore(top.getNetScore());
			s.setRankPosition(1);
			s.setAwardedAt(now);
			s.setExpiresAt(now.plus(SPOTLIGHT_TTL));
			spotlightRepository.save(s);
			return;
		}
		DailySpotlight s = activeOpt.get();
		boolean sameUser = s.getUser().getId().equals(top.getUser().getId());
		boolean sameScore = Double.compare(s.getNetScore(), top.getNetScore()) == 0;
		if (sameUser && sameScore) {
			return;
		}
		s.setUser(top.getUser());
		s.setNetScore(top.getNetScore());
		s.setRankPosition(1);
		spotlightRepository.save(s);
	}

	private ProfileOfDayDto toDto(DailySpotlight s, MockTest mock) {
		User u = s.getUser();
		long userId = u.getId();
		int totalMocks = attemptRepository.findByUserIdAndSubmittedTrueOrderBySubmittedAtDesc(userId).size();
		String emoji = u.getAvatarEmoji() != null ? u.getAvatarEmoji() : "🏆";
		return new ProfileOfDayDto(
				userId,
				userDisplayService.displayName(u),
				emoji,
				"Top scorer · today's mock (submitted today)",
				s.getNetScore(),
				s.getRankPosition(),
				mock.getId(),
				mock.getTitle(),
				totalMocks,
				s.getNetScore(),
				s.getExpiresAt());
	}
}
