package com.itofficerhub.service;

import com.itofficerhub.dto.*;
import com.itofficerhub.entity.*;
import com.itofficerhub.exception.ApiException;
import com.itofficerhub.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class AdminService {

	private final MockTestRepository mockTestRepository;
	private final QuestionRepository questionRepository;
	private final UserRepository userRepository;
	private final TestAttemptRepository attemptRepository;
	private final AppCacheService appCacheService;
	private final MockCodeService mockCodeService;

	public AdminService(MockTestRepository mockTestRepository, QuestionRepository questionRepository,
			UserRepository userRepository, TestAttemptRepository attemptRepository, AppCacheService appCacheService,
			MockCodeService mockCodeService) {
		this.mockTestRepository = mockTestRepository;
		this.questionRepository = questionRepository;
		this.userRepository = userRepository;
		this.attemptRepository = attemptRepository;
		this.appCacheService = appCacheService;
		this.mockCodeService = mockCodeService;
	}

	public AdminDashboardDto dashboard() {
		return new AdminDashboardDto(
				mockTestRepository.count(),
				questionRepository.count(),
				userRepository.countByRole(Role.USER),
				attemptRepository.countBySubmittedTrue());
	}

	public List<MockTestAdminDto> listMocks() {
		return mockTestRepository.findAll().stream().map(this::toAdminDto).toList();
	}

	public MockCodePreviewDto previewNextCode(String examTargetRaw) {
		ExamTarget target = parseExamTarget(examTargetRaw);
		String prefix = mockCodeService.prefixFor(target);
		String next = mockCodeService.previewNextCode(target);
		return new MockCodePreviewDto(target.name(), prefix, next);
	}

	public MockTestAdminDto getMock(Long id) {
		return toAdminDto(findMock(id));
	}

	@Transactional
	public MockTestAdminDto createMock(MockTestRequest request) {
		MockTest m = new MockTest();
		applyMockRequest(m, request);
		if (request.examTarget() != null) {
			m.setExamTarget(parseExamTarget(request.examTarget()));
		}
		if (request.mockCategory() != null) {
			m.setMockCategory(parseCategory(request.mockCategory()));
		}
		mockCodeService.assignCode(m);
		return toAdminDto(mockTestRepository.save(m));
	}

	@Transactional
	public MockTestAdminDto updateMock(Long id, MockTestRequest request) {
		MockTest m = findMock(id);
		applyMockRequest(m, request);
		MockTestAdminDto dto = toAdminDto(mockTestRepository.save(m));
		if (request.published() != null) {
			appCacheService.evictPublicCatalog();
		}
		return dto;
	}

	@Transactional
	public void deleteMock(Long id) {
		questionRepository.deleteByMockTestId(id);
		mockTestRepository.deleteById(id);
	}

	@Transactional
	public MockTestAdminDto togglePublish(Long id) {
		MockTest m = findMock(id);
		long qCount = questionRepository.countByMockTestId(id);
		if (!m.isPublished() && qCount < m.getQuestionCount()) {
			throw new ApiException(HttpStatus.BAD_REQUEST,
					"Need at least " + m.getQuestionCount() + " questions before publishing");
		}
		if (m.isPublished()) {
			m.setPublished(false);
		} else {
			m.setPublished(true);
			m.setPublishedAt(java.time.Instant.now());
		}
		MockTestAdminDto dto = toAdminDto(mockTestRepository.save(m));
		appCacheService.evictPublicCatalog();
		return dto;
	}

	@Transactional(readOnly = true)
	public List<QuestionAdminDto> listQuestions(Long mockId) {
		return questionRepository.findByMockTestIdOrderByOrderIndexAsc(mockId).stream()
				.map(this::toQuestionDto).toList();
	}

	@Transactional
	public QuestionAdminDto createQuestion(QuestionRequest request) {
		MockTest mock = findMock(request.mockTestId());
		Question q = new Question();
		q.setMockTest(mock);
		applyQuestionRequest(q, request);
		if (q.getOrderIndex() == 0) {
			q.setOrderIndex((int) questionRepository.countByMockTestId(mock.getId()) + 1);
		}
		return toQuestionDto(questionRepository.save(q));
	}

	@Transactional
	public QuestionAdminDto updateQuestion(Long id, QuestionRequest request) {
		Question q = questionRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found"));
		applyQuestionRequest(q, request);
		return toQuestionDto(questionRepository.save(q));
	}

	@Transactional
	public void deleteQuestion(Long id) {
		questionRepository.deleteById(id);
	}

	@Transactional
	public MockTestAdminDto importMock(ImportMockRequest request) {
		MockTest mock = new MockTest();
		mock.setTitle(request.title().trim());
		mock.setDescription(request.description());
		mock.setDifficulty(Difficulty.valueOf(request.difficulty().trim().toUpperCase()));
		int count = request.questions().size();
		int qCount = request.questionCount() != null && request.questionCount() > 0
				? request.questionCount()
				: (count > 0 ? count : 20);
		mock.setQuestionCount(qCount);
		mock.setTimeLimitMinutes(request.timeLimitMinutes() != null ? request.timeLimitMinutes() : 15);
		mock.setPublished(false);
		mock.setAllowRetake(true);
		mock.setMockCategory(parseCategory(request.mockCategory()));
		mock.setExamTarget(parseExamTarget(request.examTarget()));
		mock.setSeriesDay(request.seriesDay());
		mockCodeService.assignCode(mock);
		mock = mockTestRepository.save(mock);

		int index = 1;
		for (ImportQuestionDto q : request.questions()) {
			Question question = new Question();
			question.setMockTest(mock);
			question.setQuestionText(q.questionText());
			question.setOptionA(q.optionA());
			question.setOptionB(q.optionB());
			question.setOptionC(q.optionC());
			question.setOptionD(q.optionD());
			question.setCorrectOption(OptionLabel.valueOf(q.correctOption().trim().toUpperCase()));
			question.setExplanation(q.explanation());
			if (q.solutionImageUrl() != null && !q.solutionImageUrl().isBlank()) {
				question.setSolutionImageUrl(q.solutionImageUrl().trim());
			}
			if (q.topic() != null && !q.topic().isBlank()) {
				question.setTopic(Topic.valueOf(q.topic().trim().toUpperCase()));
			}
			question.setOrderIndex(q.orderIndex() != null ? q.orderIndex() : index);
			questionRepository.save(question);
			index++;
		}
		return toAdminDto(mock);
	}

	private MockCategory parseCategory(String raw) {
		if (raw == null || raw.isBlank()) return MockCategory.FULL;
		try {
			return MockCategory.valueOf(raw.trim().toUpperCase());
		} catch (IllegalArgumentException e) {
			return MockCategory.FULL;
		}
	}

	private ExamTarget parseExamTarget(String raw) {
		if (raw == null || raw.isBlank()) return ExamTarget.IBPS_SO_IT;
		try {
			return ExamTarget.valueOf(raw.trim().toUpperCase());
		} catch (IllegalArgumentException e) {
			return ExamTarget.IBPS_SO_IT;
		}
	}

	private MockTest findMock(Long id) {
		return mockTestRepository.findById(id)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Mock not found"));
	}

	private void applyMockRequest(MockTest m, MockTestRequest r) {
		if (r.title() != null) m.setTitle(r.title());
		if (r.description() != null) m.setDescription(r.description());
		if (r.difficulty() != null) m.setDifficulty(Difficulty.valueOf(r.difficulty().toUpperCase()));
		if (r.questionCount() != null) m.setQuestionCount(r.questionCount());
		if (r.timeLimitMinutes() != null) m.setTimeLimitMinutes(r.timeLimitMinutes());
		if (r.published() != null) m.setPublished(r.published());
		if (r.allowRetake() != null) m.setAllowRetake(r.allowRetake());
	}

	private void applyQuestionRequest(Question q, QuestionRequest r) {
		q.setQuestionText(r.questionText());
		q.setOptionA(r.optionA());
		q.setOptionB(r.optionB());
		q.setOptionC(r.optionC());
		q.setOptionD(r.optionD());
		q.setCorrectOption(OptionLabel.valueOf(r.correctOption().toUpperCase()));
		q.setExplanation(r.explanation());
		if (r.topic() != null && !r.topic().isBlank()) {
			q.setTopic(Topic.valueOf(r.topic().toUpperCase()));
		}
		if (r.orderIndex() != null) q.setOrderIndex(r.orderIndex());
	}

	private MockTestAdminDto toAdminDto(MockTest m) {
		return new MockTestAdminDto(m.getId(), m.getTitle(), m.getDescription(), m.getDifficulty().name(),
				m.getQuestionCount(), m.getTimeLimitMinutes(), m.isPublished(), m.isAllowRetake(),
				attemptRepository.countByMockTestIdAndSubmittedTrue(m.getId()), m.getPublishedAt(),
				m.getMockCode(), m.getExamTarget().name(), m.getMockCategory().name());
	}

	private QuestionAdminDto toQuestionDto(Question q) {
		return new QuestionAdminDto(q.getId(), q.getMockTest().getId(), q.getOrderIndex(), q.getQuestionText(),
				q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD(),
				q.getCorrectOption().name(), q.getExplanation(),
				q.getTopic() != null ? q.getTopic().name() : null);
	}
}
