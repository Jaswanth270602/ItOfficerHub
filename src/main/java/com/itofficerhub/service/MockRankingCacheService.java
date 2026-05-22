package com.itofficerhub.service;

import com.itofficerhub.config.CacheNames;
import com.itofficerhub.dto.LeaderboardEntryDto;
import com.itofficerhub.entity.TestAttempt;
import com.itofficerhub.repository.TestAttemptRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MockRankingCacheService {

	private final TestAttemptRepository attemptRepository;
	private final UserDisplayService userDisplayService;
	private final MockRankingCacheService self;

	public MockRankingCacheService(TestAttemptRepository attemptRepository, UserDisplayService userDisplayService,
			@Lazy MockRankingCacheService self) {
		this.attemptRepository = attemptRepository;
		this.userDisplayService = userDisplayService;
		this.self = self;
	}

	@Cacheable(cacheNames = CacheNames.MOCK_RANKING, key = "#mockId")
	public List<TestAttempt> bestAttemptsPerUser(long mockId) {
		List<TestAttempt> all = attemptRepository.findSubmittedByMockWithUser(mockId);
		Map<Long, TestAttempt> best = new HashMap<>();
		for (TestAttempt a : all) {
			ensureNetScore(a);
			Long uid = a.getUser().getId();
			TestAttempt existing = best.get(uid);
			if (existing == null || isBetter(a, existing)) {
				best.put(uid, a);
			}
		}
		return best.values().stream()
				.sorted(Comparator.comparingDouble(TestAttempt::getNetScore).reversed()
						.thenComparingInt(TestAttempt::getTimeTakenSeconds)
						.thenComparing(a -> a.getSubmittedAt() != null ? a.getSubmittedAt() : a.getStartedAt()))
				.toList();
	}

	@Cacheable(cacheNames = CacheNames.MOCK_LEADERBOARD, key = "#mockId + ':' + #viewerUserId + ':' + #limit")
	public List<LeaderboardEntryDto> topLeaderboard(long mockId, long viewerUserId, int limit) {
		List<TestAttempt> ranked = self.bestAttemptsPerUser(mockId);
		List<LeaderboardEntryDto> entries = new ArrayList<>();
		int prevRank = 1;
		for (int i = 0; i < ranked.size() && i < limit; i++) {
			TestAttempt a = ranked.get(i);
			if (i > 0 && a.getNetScore() < ranked.get(i - 1).getNetScore()) {
				prevRank = i + 1;
			}
			entries.add(new LeaderboardEntryDto(
					prevRank,
					userDisplayService.displayName(a.getUser()),
					Math.round(a.getNetScore() * 100) / 100.0,
					a.getCorrectCount(),
					a.getTimeTakenSeconds(),
					a.getUser().getId().equals(viewerUserId)));
		}
		return entries;
	}

	private void ensureNetScore(TestAttempt a) {
		if (a.getCorrectCount() == 0 && a.getWrongCount() == 0 && a.getScore() > 0) {
			ExamScoring.Breakdown b = ExamScoring.compute(a.getTotalQuestions(), a.getScore(), 0);
			a.setNetScore(b.netScore());
		}
	}

	private boolean isBetter(TestAttempt a, TestAttempt b) {
		if (a.getNetScore() > b.getNetScore()) return true;
		if (a.getNetScore() < b.getNetScore()) return false;
		return a.getTimeTakenSeconds() < b.getTimeTakenSeconds();
	}
}
