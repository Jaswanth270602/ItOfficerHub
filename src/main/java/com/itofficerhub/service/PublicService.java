package com.itofficerhub.service;

import com.itofficerhub.config.CacheNames;
import com.itofficerhub.dto.MockTestSummaryDto;
import com.itofficerhub.dto.PublicStatsDto;
import com.itofficerhub.entity.Role;
import com.itofficerhub.repository.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PublicService {

	private final MockTestRepository mockTestRepository;
	private final UserRepository userRepository;
	private final TestAttemptRepository attemptRepository;
	private final MockTopicService mockTopicService;
	private final PublicService self;

	public PublicService(MockTestRepository mockTestRepository, UserRepository userRepository,
			TestAttemptRepository attemptRepository, MockTopicService mockTopicService,
			@Lazy PublicService self) {
		this.mockTestRepository = mockTestRepository;
		this.userRepository = userRepository;
		this.attemptRepository = attemptRepository;
		this.mockTopicService = mockTopicService;
		this.self = self;
	}

	@Cacheable(cacheNames = CacheNames.PUBLIC_STATS)
	public PublicStatsDto getStats() {
		long mocks = mockTestRepository.countByPublishedTrue();
		long users = userRepository.countByRole(Role.USER);
		long totalAttempts = attemptRepository.countBySubmittedTrue();
		Double avg = attemptRepository.averageNetScorePercent();
		double avgPct = avg != null ? Math.round(avg * 10) / 10.0 : 0;
		return new PublicStatsDto(mocks, users, totalAttempts, avgPct);
	}

	@Cacheable(cacheNames = CacheNames.PUBLISHED_MOCKS)
	public List<MockTestSummaryDto> listPublishedMocks() {
		var mocks = mockTestRepository.findPublishedOrderByReleaseDesc();
		var topicMap = mockTopicService.topicsByMockId(mocks.stream().map(m -> m.getId()).toList());
		return mocks.stream()
				.map(m -> {
					var topics = topicMap.getOrDefault(m.getId(), List.of());
					return toSummary(m, topics);
				})
				.toList();
	}

	@Cacheable(cacheNames = CacheNames.MOCK_ATTEMPT_COUNT, key = "#mockId")
	public long cachedAttemptCount(long mockId) {
		return attemptRepository.countByMockTestIdAndSubmittedTrue(mockId);
	}

	public List<com.itofficerhub.dto.TopicCatalogItemDto> topicCatalog() {
		return com.itofficerhub.util.TopicDisplay.catalog();
	}

	private MockTestSummaryDto toSummary(com.itofficerhub.entity.MockTest m, List<String> topics) {
		return new MockTestSummaryDto(
				m.getId(),
				m.getTitle(),
				m.getDescription(),
				m.getDifficulty().name(),
				m.getQuestionCount(),
				m.getTimeLimitMinutes(),
				self.cachedAttemptCount(m.getId()),
				m.isAllowRetake(),
				m.getPublishedAt() != null ? m.getPublishedAt() : m.getCreatedAt(),
				topics,
				mockTopicService.isCumulative(topics),
				m.getMockCategory().name(),
				m.getExamTarget().name(),
				m.getSeriesDay());
	}
}
