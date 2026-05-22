package com.itofficerhub.service;

import com.itofficerhub.dto.LeaderboardEntryDto;
import com.itofficerhub.entity.TestAttempt;
import com.itofficerhub.entity.User;
import com.itofficerhub.repository.TestAttemptRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UniqueRankingService {

	private final TestAttemptRepository attemptRepository;
	private final MockRankingCacheService rankingCache;

	public UniqueRankingService(TestAttemptRepository attemptRepository, MockRankingCacheService rankingCache) {
		this.attemptRepository = attemptRepository;
		this.rankingCache = rankingCache;
	}

	public record UniqueRankResult(long rank, double percentile, long uniqueStudents, long totalAttempts) {}

	public List<TestAttempt> bestAttemptsPerUser(long mockId) {
		return rankingCache.bestAttemptsPerUser(mockId);
	}

	public UniqueRankResult computeForAttempt(TestAttempt attempt) {
		long mockId = attempt.getMockTest().getId();
		long totalAttempts = attemptRepository.countByMockTestIdAndSubmittedTrue(mockId);
		List<TestAttempt> ranked = new java.util.ArrayList<>(rankingCache.bestAttemptsPerUser(mockId));
		long userId = attempt.getUser().getId();
		if (attempt.isSubmitted() && ranked.stream().noneMatch(a -> a.getUser().getId().equals(userId))) {
			ranked.add(attempt);
			ranked.sort(java.util.Comparator.comparingDouble(TestAttempt::getNetScore).reversed()
					.thenComparingInt(TestAttempt::getTimeTakenSeconds)
					.thenComparing(a -> a.getSubmittedAt() != null ? a.getSubmittedAt() : a.getStartedAt()));
		}
		long uniqueStudents = ranked.size();

		long rank = 1;
		int displayRank = 1;
		double userNet = attempt.getNetScore();
		for (int i = 0; i < ranked.size(); i++) {
			if (i > 0 && ranked.get(i).getNetScore() < ranked.get(i - 1).getNetScore()) {
				displayRank = i + 1;
			}
			if (ranked.get(i).getUser().getId().equals(userId)) {
				rank = displayRank;
				userNet = ranked.get(i).getNetScore();
				break;
			}
		}

		long below = 0;
		long equal = 0;
		for (TestAttempt a : ranked) {
			if (a.getNetScore() < userNet) below++;
			else if (Double.compare(a.getNetScore(), userNet) == 0) equal++;
		}
		double percentile = uniqueStudents <= 1 ? 100.0 : ((below + equal * 0.5) / uniqueStudents) * 100.0;
		return new UniqueRankResult(rank, percentile, uniqueStudents, totalAttempts);
	}

	public List<LeaderboardEntryDto> topLeaderboard(long mockId, User currentUser, int limit) {
		return rankingCache.topLeaderboard(mockId, currentUser.getId(), limit);
	}
}
