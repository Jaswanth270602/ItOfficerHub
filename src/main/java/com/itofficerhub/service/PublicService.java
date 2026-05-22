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
	private final PublicService self;

	public PublicService(MockTestRepository mockTestRepository, UserRepository userRepository,
			TestAttemptRepository attemptRepository, @Lazy PublicService self) {
		this.mockTestRepository = mockTestRepository;
		this.userRepository = userRepository;
		this.attemptRepository = attemptRepository;
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
		return mockTestRepository.findByPublishedTrueOrderByCreatedAtDesc().stream()
				.map(m -> new MockTestSummaryDto(
						m.getId(),
						m.getTitle(),
						m.getDescription(),
						m.getDifficulty().name(),
						m.getQuestionCount(),
						m.getTimeLimitMinutes(),
						self.cachedAttemptCount(m.getId()),
						m.isAllowRetake()))
				.toList();
	}

	@Cacheable(cacheNames = CacheNames.MOCK_ATTEMPT_COUNT, key = "#mockId")
	public long cachedAttemptCount(long mockId) {
		return attemptRepository.countByMockTestIdAndSubmittedTrue(mockId);
	}

	public List<String> listTopics() {
		return java.util.Arrays.stream(com.itofficerhub.entity.Topic.values())
				.map(Enum::name)
				.toList();
	}
}
