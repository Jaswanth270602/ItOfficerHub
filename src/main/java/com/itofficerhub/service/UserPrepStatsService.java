package com.itofficerhub.service;

import com.itofficerhub.dto.UserPrepStatsDto;
import com.itofficerhub.dto.UserPrepStatsDto.ChallengeDayDto;
import com.itofficerhub.entity.MockCategory;
import com.itofficerhub.entity.MockTest;
import com.itofficerhub.entity.TestAttempt;
import com.itofficerhub.exception.ApiException;
import com.itofficerhub.repository.RevisionBookmarkRepository;
import com.itofficerhub.repository.TestAttemptRepository;
import com.itofficerhub.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
public class UserPrepStatsService {

	private final TestAttemptRepository attemptRepository;
	private final MockCatalogService mockCatalogService;
	private final RevisionBookmarkRepository bookmarkRepository;
	private final TopicAnalyticsService topicAnalyticsService;
	private final PrepPointsService prepPointsService;

	public UserPrepStatsService(TestAttemptRepository attemptRepository, MockCatalogService mockCatalogService,
			RevisionBookmarkRepository bookmarkRepository, TopicAnalyticsService topicAnalyticsService,
			PrepPointsService prepPointsService) {
		this.attemptRepository = attemptRepository;
		this.mockCatalogService = mockCatalogService;
		this.bookmarkRepository = bookmarkRepository;
		this.topicAnalyticsService = topicAnalyticsService;
		this.prepPointsService = prepPointsService;
	}

	@Transactional(readOnly = true)
	public UserPrepStatsDto statsForCurrentUser() {
		return statsForUser(currentUserId());
	}

	@Transactional(readOnly = true)
	public UserPrepStatsDto statsForUser(long userId) {
		List<TestAttempt> attempts = attemptRepository.findSubmittedByUserWithMock(userId);
		long totalAttempts = attempts.size();
		Set<Long> mockIds = new HashSet<>();
		double bestNet = 0;
		for (TestAttempt a : attempts) {
			mockIds.add(a.getMockTest().getId());
			if (a.getNetScore() > bestNet) {
				bestNet = a.getNetScore();
			}
		}
		int streak = computeStreak(attempts);
		var topicBreakdown = topicAnalyticsService.lifetimeBreakdownForUser(userId);
		long revisionCount = bookmarkRepository.countByUserId(userId);
		List<ChallengeDayDto> challenge = buildChallengePlan(userId);
		return new UserPrepStatsDto(
				totalAttempts,
				mockIds.size(),
				streak,
				Math.round(bestNet * 100) / 100.0,
				revisionCount,
				prepPointsService.getTotalPoints(userId),
				topicBreakdown,
				challenge);
	}

	private int computeStreak(List<TestAttempt> attempts) {
		if (attempts.isEmpty()) return 0;
		Set<LocalDate> days = new HashSet<>();
		ZoneId zone = ZoneId.systemDefault();
		for (TestAttempt a : attempts) {
			if (a.getSubmittedAt() != null) {
				days.add(a.getSubmittedAt().atZone(zone).toLocalDate());
			}
		}
		LocalDate cursor = LocalDate.now(zone);
		if (!days.contains(cursor)) {
			cursor = cursor.minusDays(1);
		}
		int streak = 0;
		while (days.contains(cursor)) {
			streak++;
			cursor = cursor.minusDays(1);
		}
		return streak;
	}

	private List<ChallengeDayDto> buildChallengePlan(long userId) {
		List<MockTest> challengeMocks = mockCatalogService.visibleMocks(java.time.Instant.now()).stream()
				.filter(m -> m.getMockCategory() == MockCategory.CHALLENGE && m.getSeriesDay() != null)
				.sorted(Comparator.comparingInt(MockTest::getSeriesDay))
				.toList();
		if (challengeMocks.isEmpty()) {
			return List.of();
		}
		Set<Long> attemptedMockIds = new HashSet<>();
		for (TestAttempt a : attemptRepository.findSubmittedByUserWithMock(userId)) {
			attemptedMockIds.add(a.getMockTest().getId());
		}
		List<ChallengeDayDto> plan = new ArrayList<>();
		for (MockTest m : challengeMocks) {
			plan.add(new ChallengeDayDto(
					m.getSeriesDay(),
					m.getId(),
					m.getTitle(),
					m.isPublished(),
					attemptedMockIds.contains(m.getId())));
		}
		return plan;
	}

	private long currentUserId() {
		var auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.getPrincipal() instanceof UserPrincipal p) {
			return p.getId();
		}
		throw new ApiException(HttpStatus.UNAUTHORIZED, "Login required");
	}
}
