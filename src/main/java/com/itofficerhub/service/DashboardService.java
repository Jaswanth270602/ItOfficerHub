package com.itofficerhub.service;

import com.itofficerhub.dto.*;
import com.itofficerhub.entity.MockTest;
import com.itofficerhub.entity.TestAttempt;
import com.itofficerhub.entity.User;
import com.itofficerhub.config.CacheNames;
import com.itofficerhub.security.UserPrincipal;
import com.itofficerhub.util.MockVisibility;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class DashboardService {

	private static final DateTimeFormatter GO_LIVE_LABEL =
			DateTimeFormatter.ofPattern("EEE, d MMM yyyy").withZone(com.itofficerhub.util.AppTime.ZONE);

	private final MockCatalogService mockCatalogService;
	private final PublicService publicService;
	private final MockRankingCacheService rankingCache;
	private final UserDisplayService userDisplayService;
	private final DailySpotlightService dailySpotlightService;

	public DashboardService(MockCatalogService mockCatalogService,
			PublicService publicService, MockRankingCacheService rankingCache,
			UserDisplayService userDisplayService, DailySpotlightService dailySpotlightService) {
		this.mockCatalogService = mockCatalogService;
		this.publicService = publicService;
		this.rankingCache = rankingCache;
		this.userDisplayService = userDisplayService;
		this.dailySpotlightService = dailySpotlightService;
	}

	@Cacheable(cacheNames = CacheNames.DASHBOARD_OVERVIEW)
	@Transactional(readOnly = true)
	public DashboardOverviewDto getOverview() {
		Instant now = Instant.now();
		MockOfDayDto mockOfDay = buildMockOfDay(now);
		UpcomingMockDto upcoming = buildUpcoming(now);
		List<HallOfFameEntryDto> hall = buildHallOfFame(10, now);
		long viewerId = viewerUserId();
		List<LeaderboardEntryDto> todayBoard = mockOfDay != null
				? rankingCache.topLeaderboardToday(mockOfDay.id(), viewerId, 10)
				: List.of();
		ProfileOfDayDto profile = mockOfDay != null
				? dailySpotlightService.currentProfile().orElse(null)
				: null;
		PublicStatsDto stats = publicService.getStats();
		return new DashboardOverviewDto(
				mockOfDay,
				upcoming,
				profile,
				hall,
				todayBoard,
				stats,
				ExamScoring.MARKS_PER_CORRECT,
				ExamScoring.NEGATIVE_PER_WRONG);
	}

	private long viewerUserId() {
		var auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.getPrincipal() instanceof UserPrincipal p) {
			return p.getId();
		}
		return 0L;
	}

	private MockOfDayDto buildMockOfDay(Instant now) {
		return mockCatalogService.featuredMock(now)
				.map(m -> new MockOfDayDto(
						m.getId(),
						m.getTitle(),
						m.getDescription(),
						m.getDifficulty().name(),
						m.getQuestionCount(),
						m.getTimeLimitMinutes(),
						publicService.cachedAttemptCount(m.getId()),
						m.isAllowRetake(),
						m.getCutoffMarks(),
						MockVisibility.effectiveGoLiveAt(m),
						m.isShowExamDate(),
						ExamScoring.MARKS_PER_CORRECT,
						ExamScoring.NEGATIVE_PER_WRONG))
				.orElse(null);
	}

	private UpcomingMockDto buildUpcoming(Instant now) {
		if (mockCatalogService.featuredMock(now).isPresent()) {
			return null;
		}
		return mockCatalogService.nextScheduled(now)
				.map(m -> new UpcomingMockDto(
						m.getId(),
						m.getTitle(),
						m.getMockCode(),
						MockVisibility.effectiveGoLiveAt(m),
						GO_LIVE_LABEL.format(MockVisibility.effectiveGoLiveAt(m))))
				.orElse(null);
	}

	private List<HallOfFameEntryDto> buildHallOfFame(int limit, Instant now) {
		List<MockTest> visible = mockCatalogService.visibleMocks(now);
		if (visible.isEmpty()) {
			return List.of();
		}

		Map<Long, Aggregate> totals = new HashMap<>();
		for (MockTest mock : visible) {
			for (TestAttempt a : rankingCache.bestAttemptsPerUser(mock.getId())) {
				User u = a.getUser();
				totals.compute(u.getId(), (id, agg) -> {
					if (agg == null) {
						agg = new Aggregate(u);
					}
					agg.add(a);
					return agg;
				});
			}
		}

		List<Aggregate> sorted = totals.values().stream()
				.sorted(Comparator.comparingDouble(Aggregate::score).reversed()
						.thenComparingInt(Aggregate::totalCorrect).reversed()
						.thenComparingInt(Aggregate::totalTime).reversed())
				.toList();

		List<HallOfFameEntryDto> out = new ArrayList<>();
		int displayRank = 1;
		for (int i = 0; i < sorted.size() && i < limit; i++) {
			Aggregate a = sorted.get(i);
			if (i > 0 && a.score() < sorted.get(i - 1).score()) {
				displayRank = i + 1;
			}
			String emoji = a.user().getAvatarEmoji() != null ? a.user().getAvatarEmoji() : "🎯";
			out.add(new HallOfFameEntryDto(
					displayRank,
					a.user().getId(),
					userDisplayService.displayName(a.user()),
					emoji,
					Math.round(a.score() * 100) / 100.0,
					a.mocksContributed(),
					a.totalCorrect(),
					a.totalTime()));
		}
		return out;
	}

	private static final class Aggregate {
		private final User user;
		private double score;
		private int mocksContributed;
		private int totalCorrect;
		private int totalTime;

		Aggregate(User user) {
			this.user = user;
		}

		void add(TestAttempt a) {
			score += a.getNetScore();
			mocksContributed++;
			totalCorrect += a.getCorrectCount();
			totalTime += a.getTimeTakenSeconds();
		}

		User user() { return user; }
		double score() { return score; }
		int mocksContributed() { return mocksContributed; }
		int totalCorrect() { return totalCorrect; }
		int totalTime() { return totalTime; }
	}
}
