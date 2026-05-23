package com.itofficerhub.service;

import com.itofficerhub.dto.ProfileOfDayDto;
import com.itofficerhub.entity.DailySpotlight;
import com.itofficerhub.entity.MockTest;
import com.itofficerhub.entity.TestAttempt;
import com.itofficerhub.entity.User;
import com.itofficerhub.repository.DailySpotlightRepository;
import com.itofficerhub.repository.TestAttemptRepository;
import com.itofficerhub.util.AppTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Aspirant of the day: top scorer on today's featured mock among attempts submitted today (IST).
 * Locked for 24 hours once awarded.
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

	@Transactional
	public void refreshAfterSubmit(long mockTestId) {
		mockCatalogService.findByIdIfVisible(mockTestId, Instant.now()).ifPresent(m -> {
			cleanup(m.getId());
			if (spotlightRepository.findActiveForMock(m.getId(), Instant.now()).isPresent()) {
				return;
			}
			tryAward(m);
		});
	}

	@Transactional
	public Optional<ProfileOfDayDto> currentProfile() {
		return mockCatalogService.featuredMock(Instant.now()).flatMap(mock -> {
			cleanup(mock.getId());
			Instant now = Instant.now();
			Optional<DailySpotlight> active = spotlightRepository.findActiveForMock(mock.getId(), now);
			if (active.isEmpty()) {
				tryAward(mock);
				active = spotlightRepository.findActiveForMock(mock.getId(), now);
			}
			return active.map(s -> toDto(s, mock));
		});
	}

	private void cleanup(long featuredMockId) {
		Instant now = Instant.now();
		spotlightRepository.deleteExpired(now);
		spotlightRepository.deleteForOtherMocks(featuredMockId);
	}

	private void tryAward(MockTest mock) {
		List<TestAttempt> rankedToday = rankingCache.bestAttemptsPerUserToday(mock.getId());
		if (rankedToday.isEmpty()) {
			return;
		}
		TestAttempt top = rankedToday.get(0);
		if (!AppTime.isToday(top.getSubmittedAt())) {
			return;
		}
		Instant now = Instant.now();
		DailySpotlight s = new DailySpotlight();
		s.setUser(top.getUser());
		s.setMockTest(mock);
		s.setNetScore(top.getNetScore());
		s.setRankPosition(1);
		s.setAwardedAt(now);
		s.setExpiresAt(now.plus(SPOTLIGHT_TTL));
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
