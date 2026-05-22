package com.itofficerhub.service;

import com.itofficerhub.dto.LeaderboardEntryDto;
import com.itofficerhub.entity.TestAttempt;
import com.itofficerhub.entity.User;
import com.itofficerhub.repository.TestAttemptRepository;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class UniqueRankingService {

	private final TestAttemptRepository attemptRepository;
	private final UserDisplayService userDisplayService;

	public UniqueRankingService(TestAttemptRepository attemptRepository, UserDisplayService userDisplayService) {
		this.attemptRepository = attemptRepository;
		this.userDisplayService = userDisplayService;
	}

	public record UniqueRankResult(long rank, double percentile, long uniqueStudents, long totalAttempts) {}

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

	public UniqueRankResult computeForAttempt(TestAttempt attempt) {
		long mockId = attempt.getMockTest().getId();
		long totalAttempts = attemptRepository.countByMockTestIdAndSubmittedTrue(mockId);
		List<TestAttempt> ranked = bestAttemptsPerUser(mockId);
		long uniqueStudents = ranked.size();
		long userId = attempt.getUser().getId();

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
		List<TestAttempt> ranked = bestAttemptsPerUser(mockId);
		List<LeaderboardEntryDto> entries = new ArrayList<>();
		int r = 1;
		int prevRank = 1;
		for (int i = 0; i < ranked.size() && r <= limit; i++) {
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
					a.getUser().getId().equals(currentUser.getId())));
			r++;
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
