package com.itofficerhub.service;

import com.itofficerhub.dto.MockTestSummaryDto;
import com.itofficerhub.dto.PublicStatsDto;
import com.itofficerhub.entity.Role;
import com.itofficerhub.entity.TestAttempt;
import com.itofficerhub.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PublicService {

	private final MockTestRepository mockTestRepository;
	private final UserRepository userRepository;
	private final TestAttemptRepository attemptRepository;
	private final QuestionRepository questionRepository;

	public PublicService(MockTestRepository mockTestRepository, UserRepository userRepository,
			TestAttemptRepository attemptRepository, QuestionRepository questionRepository) {
		this.mockTestRepository = mockTestRepository;
		this.userRepository = userRepository;
		this.attemptRepository = attemptRepository;
		this.questionRepository = questionRepository;
	}

	public PublicStatsDto getStats() {
		long mocks = mockTestRepository.countByPublishedTrue();
		long users = userRepository.countByRole(Role.USER);
		List<TestAttempt> attempts = attemptRepository.findAll().stream()
				.filter(TestAttempt::isSubmitted)
				.toList();
		long totalAttempts = attemptRepository.countBySubmittedTrue();
		double avg = 0;
		if (!attempts.isEmpty()) {
			avg = attempts.stream()
					.mapToDouble(a -> {
						double max = a.getTotalQuestions() * ExamScoring.MARKS_PER_CORRECT;
						return max > 0 ? (a.getNetScore() / max) * 100.0 : 0;
					})
					.average()
					.orElse(0);
		}
		return new PublicStatsDto(mocks, users, totalAttempts, Math.round(avg * 10) / 10.0);
	}

	public List<MockTestSummaryDto> listPublishedMocks() {
		return mockTestRepository.findByPublishedTrueOrderByCreatedAtDesc().stream()
				.map(m -> new MockTestSummaryDto(
						m.getId(),
						m.getTitle(),
						m.getDescription(),
						m.getDifficulty().name(),
						m.getQuestionCount(),
						m.getTimeLimitMinutes(),
						attemptRepository.countByMockTestIdAndSubmittedTrue(m.getId()),
						m.isAllowRetake()))
				.toList();
	}

	public List<String> listTopics() {
		return java.util.Arrays.stream(com.itofficerhub.entity.Topic.values())
				.map(Enum::name)
				.toList();
	}
}
