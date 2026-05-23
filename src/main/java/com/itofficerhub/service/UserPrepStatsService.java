package com.itofficerhub.service;

import com.itofficerhub.dto.DailyActivityDto;
import com.itofficerhub.dto.UserPrepStatsDto;
import com.itofficerhub.dto.UserPrepStatsDto.ChallengeDayDto;
import com.itofficerhub.entity.MockCategory;
import com.itofficerhub.entity.MockTest;
import com.itofficerhub.entity.TestAttempt;
import com.itofficerhub.exception.ApiException;
import com.itofficerhub.repository.RevisionBookmarkRepository;
import com.itofficerhub.repository.TestAttemptRepository;
import com.itofficerhub.security.UserPrincipal;
import com.itofficerhub.util.AppTime;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
public class UserPrepStatsService {

	private static final int DUTY_LOG_DAYS = 365;

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
		var duty = buildPrepDutyLog(attempts);
		return new UserPrepStatsDto(
				totalAttempts,
				mockIds.size(),
				streak,
				Math.round(bestNet * 100) / 100.0,
				revisionCount,
				prepPointsService.getTotalPoints(userId),
				topicBreakdown,
				challenge,
				duty.log(),
				duty.activeDays(),
				duty.longestStreak(),
				duty.consistencyPercent());
	}

	private record DutyMeta(List<DailyActivityDto> log, int activeDays, int longestStreak, int consistencyPercent) {}

	private DutyMeta buildPrepDutyLog(List<TestAttempt> attempts) {
		LocalDate today = AppTime.today();
		LocalDate start = today.minusDays(DUTY_LOG_DAYS - 1L);
		Map<LocalDate, List<TestAttempt>> byDay = new TreeMap<>();
		for (TestAttempt a : attempts) {
			if (a.getSubmittedAt() == null) continue;
			LocalDate d = a.getSubmittedAt().atZone(AppTime.ZONE).toLocalDate();
			if (d.isBefore(start) || d.isAfter(today)) continue;
			byDay.computeIfAbsent(d, k -> new ArrayList<>()).add(a);
		}
		List<DailyActivityDto> log = new ArrayList<>();
		for (var e : byDay.entrySet()) {
			double best = e.getValue().stream().mapToDouble(TestAttempt::getNetScore).max().orElse(0);
			log.add(new DailyActivityDto(e.getKey().toString(), e.getValue().size(), Math.round(best * 100) / 100.0));
		}
		int activeDays = log.size();
		int consistency = Math.round((activeDays * 100f) / DUTY_LOG_DAYS);
		int longest = computeLongestStreakInRange(byDay.keySet(), start, today);
		return new DutyMeta(log, activeDays, longest, consistency);
	}

	private int computeLongestStreakInRange(Set<LocalDate> days, LocalDate start, LocalDate end) {
		int best = 0;
		int run = 0;
		for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
			if (days.contains(d)) {
				run++;
				best = Math.max(best, run);
			} else {
				run = 0;
			}
		}
		return best;
	}

	private int computeStreak(List<TestAttempt> attempts) {
		if (attempts.isEmpty()) return 0;
		Set<LocalDate> days = new HashSet<>();
		for (TestAttempt a : attempts) {
			if (a.getSubmittedAt() != null) {
				days.add(a.getSubmittedAt().atZone(AppTime.ZONE).toLocalDate());
			}
		}
		LocalDate cursor = AppTime.today();
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
		List<MockTest> challengeMocks = mockCatalogService.visibleMocks(Instant.now()).stream()
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
