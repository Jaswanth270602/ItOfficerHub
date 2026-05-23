package com.itofficerhub.service;

import com.itofficerhub.config.CacheNames;
import com.itofficerhub.dto.AttemptHistoryItemDto;
import com.itofficerhub.dto.MockWithUserStatusDto;
import com.itofficerhub.entity.TestAttempt;
import com.itofficerhub.repository.MockTestRepository;
import com.itofficerhub.repository.TestAttemptRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserAttemptCacheService {

	private final TestAttemptRepository attemptRepository;
	private final MockTestRepository mockTestRepository;
	private final PublicService publicService;
	private final MockTopicService mockTopicService;

	public UserAttemptCacheService(TestAttemptRepository attemptRepository, MockTestRepository mockTestRepository,
			@Lazy PublicService publicService, MockTopicService mockTopicService) {
		this.attemptRepository = attemptRepository;
		this.mockTestRepository = mockTestRepository;
		this.publicService = publicService;
		this.mockTopicService = mockTopicService;
	}

	@Cacheable(cacheNames = CacheNames.USER_HISTORY, key = "#userId")
	public List<AttemptHistoryItemDto> historyForUser(long userId) {
		List<TestAttempt> attempts = attemptRepository.findSubmittedByUserWithMock(userId);
		Map<Long, Integer> countByMock = new HashMap<>();
		List<AttemptHistoryItemDto> items = new ArrayList<>();
		for (TestAttempt a : attempts) {
			int index = countByMock.merge(a.getMockTest().getId(), 1, Integer::sum);
			items.add(toHistoryItem(a, index));
		}
		return items;
	}

	@Cacheable(cacheNames = CacheNames.USER_MOCK_STATUS, key = "#userId")
	public List<MockWithUserStatusDto> mockStatusForUser(long userId) {
		Map<Long, List<TestAttempt>> byMock = new HashMap<>();
		for (TestAttempt a : attemptRepository.findSubmittedByUserWithMock(userId)) {
			byMock.computeIfAbsent(a.getMockTest().getId(), k -> new ArrayList<>()).add(a);
		}
		Long featuredId = mockTestRepository.findFeaturedMock()
				.map(m -> m.getId())
				.orElse(null);
		var mocks = mockTestRepository.findPublishedOrderByReleaseDesc();
		var topicMap = mockTopicService.topicsByMockId(mocks.stream().map(m -> m.getId()).toList());
		return mocks.stream()
				.map(m -> {
					List<TestAttempt> mine = byMock.getOrDefault(m.getId(), List.of());
					boolean attempted = !mine.isEmpty();
					double best = mine.stream().mapToDouble(TestAttempt::getNetScore).max().orElse(0);
					TestAttempt latest = mine.isEmpty() ? null : mine.get(0);
					boolean cleared = latest != null && latest.getNetScore() >= m.getCutoffMarks();
					var topics = topicMap.getOrDefault(m.getId(), List.of());
					return new MockWithUserStatusDto(
							m.getId(),
							m.getTitle(),
							m.getDescription(),
							m.getDifficulty().name(),
							m.getQuestionCount(),
							m.getTimeLimitMinutes(),
							publicService.cachedAttemptCount(m.getId()),
							m.isAllowRetake(),
							m.isShowExamDate(),
							m.getPublishedAt() != null ? m.getPublishedAt() : m.getCreatedAt(),
							featuredId != null && featuredId.equals(m.getId()),
							attempted,
							mine.size(),
							attempted ? best : null,
							latest != null ? latest.getId() : null,
							cleared,
							topics,
							mockTopicService.isCumulative(topics),
							m.getMockCategory().name(),
							m.getExamTarget().name(),
							m.getSeriesDay(),
							m.getMockCode());
				})
				.toList();
	}

	private AttemptHistoryItemDto toHistoryItem(TestAttempt attempt, int attemptIndexForMock) {
		ensureScoring(attempt);
		double maxMarks = attempt.getTotalQuestions() * ExamScoring.MARKS_PER_CORRECT;
		double pct = maxMarks > 0 ? (attempt.getNetScore() / maxMarks) * 100.0 : 0;
		long rank = attempt.getRankAtSubmit() != null ? attempt.getRankAtSubmit() : 0;
		double percentile = attempt.getPercentileAtSubmit() != null ? attempt.getPercentileAtSubmit() : 0;
		long unique = attempt.getUniqueStudentsAtSubmit() != null ? attempt.getUniqueStudentsAtSubmit() : 0;
		double cutoff = attempt.getMockTest().getCutoffMarks();
		return new AttemptHistoryItemDto(
				attempt.getId(),
				attempt.getMockTest().getId(),
				attempt.getMockTest().getTitle(),
				round2(attempt.getNetScore()),
				maxMarks,
				attempt.getCorrectCount(),
				attempt.getWrongCount(),
				round1(pct),
				rank,
				round1(percentile),
				unique,
				attempt.getNetScore() >= cutoff,
				cutoff,
				attempt.getSubmittedAt(),
				attempt.getMockTest().isAllowRetake(),
				attemptIndexForMock);
	}

	private void ensureScoring(TestAttempt attempt) {
		if (attempt.getCorrectCount() == 0 && attempt.getWrongCount() == 0 && attempt.getScore() > 0) {
			ExamScoring.Breakdown b = ExamScoring.compute(attempt.getTotalQuestions(), attempt.getScore(), 0);
			attempt.setNetScore(b.netScore());
		}
	}

	private double round1(double v) { return Math.round(v * 10) / 10.0; }
	private double round2(double v) { return Math.round(v * 100) / 100.0; }
}
