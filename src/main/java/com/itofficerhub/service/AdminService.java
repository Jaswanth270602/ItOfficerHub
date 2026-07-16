package com.itofficerhub.service;

import com.itofficerhub.dto.*;
import com.itofficerhub.entity.*;
import com.itofficerhub.exception.ApiException;
import com.itofficerhub.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.itofficerhub.util.AppTime;
import com.itofficerhub.util.ExplanationComposer;
import com.itofficerhub.util.MockVisibility;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class AdminService {

	private final MockTestRepository mockTestRepository;
	private final QuestionRepository questionRepository;
	private final UserRepository userRepository;
	private final TestAttemptRepository attemptRepository;
	private final RevisionBookmarkRepository revisionBookmarkRepository;
	private final DailySpotlightRepository dailySpotlightRepository;
	private final DailySpotlightService dailySpotlightService;
	private final AppCacheService appCacheService;
	private final MockCodeService mockCodeService;
	private final PasswordEncoder passwordEncoder;

	public AdminService(MockTestRepository mockTestRepository, QuestionRepository questionRepository,
			UserRepository userRepository, TestAttemptRepository attemptRepository,
			RevisionBookmarkRepository revisionBookmarkRepository,
			DailySpotlightRepository dailySpotlightRepository,
			DailySpotlightService dailySpotlightService,
			AppCacheService appCacheService, MockCodeService mockCodeService,
			PasswordEncoder passwordEncoder) {
		this.mockTestRepository = mockTestRepository;
		this.questionRepository = questionRepository;
		this.userRepository = userRepository;
		this.attemptRepository = attemptRepository;
		this.revisionBookmarkRepository = revisionBookmarkRepository;
		this.dailySpotlightRepository = dailySpotlightRepository;
		this.dailySpotlightService = dailySpotlightService;
		this.appCacheService = appCacheService;
		this.mockCodeService = mockCodeService;
		this.passwordEncoder = passwordEncoder;
	}

	public AdminDashboardDto dashboard() {
		return new AdminDashboardDto(
				mockTestRepository.count(),
				questionRepository.count(),
				userRepository.countByRole(Role.USER),
				attemptRepository.countBySubmittedTrue());
	}

	public List<MockTestAdminDto> listMocks() {
		return mockTestRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toAdminDto).toList();
	}

	@Transactional(readOnly = true)
	public List<UserAdminDto> listUsers(String roleFilter) {
		List<User> users;
		if (roleFilter == null || roleFilter.isBlank() || "ALL".equalsIgnoreCase(roleFilter)) {
			users = userRepository.findAllByOrderByCreatedAtDesc();
		} else {
			Role role = parseRole(roleFilter);
			users = userRepository.findByRoleOrderByCreatedAtDesc(role);
		}
		return users.stream().map(this::toUserAdminDto).toList();
	}

	@Transactional
	public void resetUserPassword(Long userId, AdminResetPasswordRequest request) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
		user.setPassword(passwordEncoder.encode(request.newPassword()));
		userRepository.save(user);
	}

	private Role parseRole(String raw) {
		try {
			return Role.valueOf(raw.trim().toUpperCase(Locale.ROOT));
		} catch (IllegalArgumentException e) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid role filter");
		}
	}

	private UserAdminDto toUserAdminDto(User u) {
		return new UserAdminDto(
				u.getId(),
				u.getEmail(),
				u.getPhone(),
				u.getName(),
				u.getRole().name(),
				u.getCreatedAt(),
				u.getPrepPoints());
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
		if (request.examTarget() != null) {
			m.setExamTarget(parseExamTarget(request.examTarget()));
		}
		if (request.mockCategory() != null) {
			m.setMockCategory(parseCategory(request.mockCategory()));
		}
		MockTestAdminDto dto = toAdminDto(mockTestRepository.save(m));
		evictCatalogCaches();
		return dto;
	}

	@Transactional
	public void deleteMock(Long id) {
		findMock(id);
		revisionBookmarkRepository.deleteByMockTestId(id);
		attemptRepository.deleteByMockTestId(id);
		dailySpotlightRepository.deleteByMockTestId(id);
		questionRepository.deleteByMockTestId(id);
		mockTestRepository.deleteById(id);
		evictCatalogCaches();
	}

	@Transactional
	public MockTestAdminDto toggleShowExamDate(Long id) {
		MockTest m = findMock(id);
		m.setShowExamDate(!m.isShowExamDate());
		MockTestAdminDto dto = toAdminDto(mockTestRepository.save(m));
		appCacheService.evictPublicCatalog();
		return dto;
	}

	@Transactional
	public MockTestAdminDto togglePublish(Long id) {
		MockTest m = findMock(id);
		Instant now = Instant.now();
		if (m.isPublished() && MockVisibility.isVisible(m, now)) {
			m.setPublished(false);
			m.setPublishedAt(null);
			m.setGoLiveAt(null);
		} else {
			ensureReadyForRelease(m, id);
			m.setPublished(true);
			m.setGoLiveAt(now);
			m.setPublishedAt(now);
		}
		MockTestAdminDto dto = toAdminDto(mockTestRepository.save(m));
		evictCatalogCaches();
		return dto;
	}

	@Transactional
	public MockTestAdminDto scheduleMock(Long id, ScheduleMockRequest request) {
		MockTest m = findMock(id);
		ensureReadyForRelease(m, id);
		LocalDate date = LocalDate.parse(request.liveOn().trim());
		if (date.isBefore(AppTime.today())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Schedule date cannot be in the past (IST)");
		}
		Instant goLive = date.atStartOfDay(AppTime.ZONE).toInstant();
		m.setPublished(true);
		m.setGoLiveAt(goLive);
		Instant now = Instant.now();
		if (MockVisibility.isVisible(m, now)) {
			m.setPublishedAt(now);
		} else {
			m.setPublishedAt(null);
		}
		MockTestAdminDto dto = toAdminDto(mockTestRepository.save(m));
		evictCatalogCaches();
		return dto;
	}

	@Transactional
	public MockTestAdminDto cancelSchedule(Long id) {
		MockTest m = findMock(id);
		if (!MockVisibility.isScheduledFuture(m, Instant.now())) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Mock is not scheduled for a future date");
		}
		m.setPublished(false);
		m.setGoLiveAt(null);
		m.setPublishedAt(null);
		MockTestAdminDto dto = toAdminDto(mockTestRepository.save(m));
		evictCatalogCaches();
		return dto;
	}

	private void evictCatalogCaches() {
		appCacheService.evictPublicCatalog();
		appCacheService.evictDashboardOverview();
		dailySpotlightService.onCatalogChange();
	}

	private void ensureReadyForRelease(MockTest m, long id) {
		long qCount = questionRepository.countByMockTestId(id);
		if (qCount < m.getQuestionCount()) {
			throw new ApiException(HttpStatus.BAD_REQUEST,
					"Need at least " + m.getQuestionCount() + " questions before going live");
		}
	}

	@Transactional(readOnly = true)
	public List<QuestionAdminDto> listQuestions(Long mockId) {
		return questionRepository.findByMockTestIdOrderByOrderIndexAsc(mockId).stream()
				.map(this::toQuestionDto).toList();
	}

	@Transactional
	public QuestionAdminDto createQuestion(QuestionRequest request) {
		MockTest mock = findMock(request.mockTestId());
		long count = questionRepository.countByMockTestId(mock.getId());
		if (count >= mock.getQuestionCount()) {
			throw new ApiException(HttpStatus.BAD_REQUEST,
					"Question limit reached (" + mock.getQuestionCount()
							+ "). Increase the limit in mock settings or delete a question.");
		}
		Question q = new Question();
		q.setMockTest(mock);
		applyQuestionRequest(q, request);
		if (q.getOrderIndex() == 0) {
			q.setOrderIndex((int) count + 1);
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
		validateImportQuestions(request.questions());
		MockTest mock = new MockTest();
		mock.setTitle(request.title().trim());
		mock.setDescription(request.description());
		mock.setDifficulty(Difficulty.valueOf(request.difficulty().trim().toUpperCase()));
		int count = request.questions().size();
		int qCount = request.questionCount() != null && request.questionCount() > 0
				? request.questionCount()
				: (count > 0 ? count : 25);
		mock.setQuestionCount(qCount);
		mock.setTimeLimitMinutes(request.timeLimitMinutes() != null ? request.timeLimitMinutes() : 20);
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
			question.setExplanation(ExplanationComposer.compose(
					q.explanation(), q.explainA(), q.explainB(), q.explainC(), q.explainD()));
			if (q.solutionImageUrl() != null && !q.solutionImageUrl().isBlank()) {
				question.setSolutionImageUrl(q.solutionImageUrl().trim());
			}
			if (q.topic() != null && !q.topic().isBlank()) {
				question.setTopic(Topic.valueOf(q.topic().trim().toUpperCase()));
			}
			if (q.topicTag() != null && !q.topicTag().isBlank()) {
				question.setTopicTag(q.topicTag().trim());
			}
			question.setOrderIndex(q.orderIndex() != null ? q.orderIndex() : index);
			questionRepository.save(question);
			index++;
		}
		return toAdminDto(mock);
	}

	private void validateImportQuestions(List<ImportQuestionDto> questions) {
		if (questions == null || questions.isEmpty()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "At least one question is required");
		}
		int i = 0;
		for (ImportQuestionDto q : questions) {
			i++;
			if (q.topic() == null || q.topic().isBlank()) {
				throw new ApiException(HttpStatus.BAD_REQUEST,
						"Question " + i + ": topic is required (syllabus chapter for analytics)");
			}
			try {
				Topic.valueOf(q.topic().trim().toUpperCase());
			} catch (IllegalArgumentException e) {
				throw new ApiException(HttpStatus.BAD_REQUEST, "Question " + i + ": invalid topic " + q.topic());
			}
			boolean structured = ExplanationComposer.hasAllOptionExplains(
					q.explainA(), q.explainB(), q.explainC(), q.explainD());
			String exp = q.explanation() == null ? "" : q.explanation().trim();
			if (structured) {
				if (exp.isEmpty()) {
					// Allowed — composer fills a default head from option explains
					continue;
				}
			} else if (ExplanationComposer.explainsAllOptionsInText(exp)) {
				if (exp.length() < 20) {
					throw new ApiException(HttpStatus.BAD_REQUEST,
							"Question " + i + ": explanation is too short");
				}
			} else {
				throw new ApiException(HttpStatus.BAD_REQUEST,
						"Question " + i + ": provide explainA, explainB, explainC, explainD (one short reason each)");
			}
		}
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
		if (r.showExamDate() != null) m.setShowExamDate(r.showExamDate());
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
		if (r.topicTag() != null) {
			q.setTopicTag(r.topicTag().isBlank() ? null : r.topicTag().trim());
		}
		if (r.orderIndex() != null) q.setOrderIndex(r.orderIndex());
	}

	private MockTestAdminDto toAdminDto(MockTest m) {
		Instant now = Instant.now();
		return new MockTestAdminDto(m.getId(), m.getTitle(), m.getDescription(), m.getDifficulty().name(),
				m.getQuestionCount(), m.getTimeLimitMinutes(), m.isPublished(), m.isAllowRetake(),
				m.isShowExamDate(),
				attemptRepository.countByMockTestIdAndSubmittedTrue(m.getId()), m.getPublishedAt(),
				m.getGoLiveAt(), MockVisibility.liveStatus(m, now),
				m.getMockCode(), m.getExamTarget().name(), m.getMockCategory().name());
	}

	private QuestionAdminDto toQuestionDto(Question q) {
		return new QuestionAdminDto(q.getId(), q.getMockTest().getId(), q.getOrderIndex(), q.getQuestionText(),
				q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD(),
				q.getCorrectOption().name(), q.getExplanation(),
				q.getTopic() != null ? q.getTopic().name() : null,
				q.getTopicTag());
	}
}
