package com.itofficerhub.service;

import com.itofficerhub.dto.*;
import com.itofficerhub.entity.*;
import com.itofficerhub.exception.ApiException;
import com.itofficerhub.repository.*;
import com.itofficerhub.security.UserPrincipal;
import com.itofficerhub.util.AttemptAnswersJson;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class AttemptService {

	private final TestAttemptRepository attemptRepository;
	private final QuestionRepository questionRepository;
	private final UniqueRankingService uniqueRankingService;
	private final UserAttemptCacheService userAttemptCache;
	private final AppCacheService appCacheService;
	private final TopicAnalyticsService topicAnalyticsService;
	private final RevisionService revisionService;
	private final PrepPointsService prepPointsService;
	private final DailySpotlightService dailySpotlightService;
	private final MockCatalogService mockCatalogService;

	public AttemptService(TestAttemptRepository attemptRepository, QuestionRepository questionRepository,
			UniqueRankingService uniqueRankingService, UserAttemptCacheService userAttemptCache,
			AppCacheService appCacheService, TopicAnalyticsService topicAnalyticsService,
			RevisionService revisionService, PrepPointsService prepPointsService,
			DailySpotlightService dailySpotlightService, MockCatalogService mockCatalogService) {
		this.attemptRepository = attemptRepository;
		this.questionRepository = questionRepository;
		this.uniqueRankingService = uniqueRankingService;
		this.userAttemptCache = userAttemptCache;
		this.appCacheService = appCacheService;
		this.topicAnalyticsService = topicAnalyticsService;
		this.revisionService = revisionService;
		this.prepPointsService = prepPointsService;
		this.dailySpotlightService = dailySpotlightService;
		this.mockCatalogService = mockCatalogService;
	}

	@Transactional
	public StartAttemptResponse startAttempt(StartAttemptRequest request) {
		UserPrincipal user = getCurrentUser();
		MockTest mock = mockCatalogService.findByIdIfVisible(request.mockTestId(), Instant.now())
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Mock test not found or not live yet"));
		List<Question> questions = questionRepository.findByMockTestIdOrderByOrderIndexAsc(mock.getId());
		if (questions.size() < mock.getQuestionCount()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Mock test is not ready yet");
		}

		TestAttempt attempt = new TestAttempt();
		attempt.setMockTest(mock);
		attempt.setUser(user.getUser());
		attempt.setTotalQuestions(mock.getQuestionCount());
		attempt = attemptRepository.save(attempt);

		List<QuestionDto> qDtos = questions.stream()
				.limit(mock.getQuestionCount())
				.map(q -> new QuestionDto(q.getId(), q.getOrderIndex(), q.getQuestionText(),
						q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD(),
						q.getTopic() != null ? q.getTopic().name() : null))
				.toList();

		return new StartAttemptResponse(attempt.getId(), null, mock.getId(), mock.getTitle(),
				mock.getTimeLimitMinutes(), qDtos,
				ExamScoring.MARKS_PER_CORRECT, ExamScoring.NEGATIVE_PER_WRONG);
	}

	@Transactional(readOnly = true)
	public AttemptProgressDto getProgress(Long attemptId) {
		TestAttempt attempt = loadOwnedAttempt(attemptId);
		if (attempt.isSubmitted()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Attempt already submitted");
		}
		AttemptAnswersData data = attempt.getAnswersJson();
		if (data == null) {
			return new AttemptProgressDto(List.of());
		}
		List<AttemptProgressDto.AnswerProgressDto> dtos = new ArrayList<>();
		Set<String> keys = new LinkedHashSet<>();
		if (data.getAnswers() != null) {
			keys.addAll(data.getAnswers().keySet());
		}
		if (data.getMarked() != null) {
			keys.addAll(data.getMarked().keySet());
		}
		for (String key : keys) {
			long questionId;
			try {
				questionId = Long.parseLong(key);
			} catch (NumberFormatException e) {
				continue;
			}
			OptionLabel selected = AttemptAnswersJson.selectedOption(data, questionId);
			dtos.add(new AttemptProgressDto.AnswerProgressDto(
					questionId,
					selected != null ? selected.name() : null,
					AttemptAnswersJson.markedForReview(data, questionId)));
		}
		return new AttemptProgressDto(dtos);
	}

	/** Legacy single-answer endpoint — answers persist on submit only; no-op during exam. */
	@Transactional
	public void saveAnswer(Long attemptId, SaveAnswerRequest request) {
		loadOwnedAttempt(attemptId);
	}

	/** No DB writes during exam — client localStorage is primary; answers saved on submit. */
	@Transactional
	public void saveCheckpoint(Long attemptId, AttemptCheckpointRequest request) {
		loadOwnedAttempt(attemptId);
	}

	@Transactional
	public AttemptResultDto submit(Long attemptId, SubmitAttemptRequest request) {
		TestAttempt attempt = loadOwnedAttempt(attemptId);
		if (attempt.isSubmitted()) {
			return buildResult(attempt);
		}
		if (request.answers() != null && !request.answers().isEmpty()) {
			attempt.setAnswersJson(AttemptAnswersJson.fromSubmit(request.answers()));
		} else if (attempt.getAnswersJson() == null) {
			attempt.setAnswersJson(AttemptAnswersJson.empty());
		}
		applyScoring(attempt);
		attempt.setTimeTakenSeconds(request.timeTakenSeconds());
		boolean firstAttemptOnMock = prepPointsService.isFirstSubmittedAttempt(
				attempt.getUser().getId(), attempt.getMockTest().getId());
		attempt.setSubmitted(true);
		attempt.setSubmittedAt(Instant.now());
		attempt = attemptRepository.saveAndFlush(attempt);
		appCacheService.evictAfterMockSubmit(attempt.getMockTest().getId(), attempt.getUser().getId());
		snapshotRank(attempt);
		attempt = attemptRepository.save(attempt);
		ExamScoring.Breakdown b = ExamScoring.compute(
				attempt.getTotalQuestions(), attempt.getCorrectCount(), attempt.getWrongCount());
		double pctMarks = b.maxMarks() > 0 ? (attempt.getNetScore() / b.maxMarks()) * 100.0 : 0;
		boolean cleared = attempt.getNetScore() >= attempt.getMockTest().getCutoffMarks();
		int pointsEarned = firstAttemptOnMock
				? prepPointsService.awardFirstAttempt(attempt.getUser().getId(), pctMarks, cleared)
				: 0;
		dailySpotlightService.refreshAfterSubmit(attempt.getMockTest().getId());
		return buildResult(attempt, firstAttemptOnMock, pointsEarned);
	}

	@Transactional(readOnly = true)
	public AttemptResultDto getResult(Long attemptId) {
		TestAttempt attempt = loadOwnedAttempt(attemptId);
		if (!attempt.isSubmitted()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Attempt not submitted yet");
		}
		return buildResult(attempt);
	}

	@Transactional(readOnly = true)
	public List<AttemptHistoryItemDto> getUserHistory() {
		return userAttemptCache.historyForUser(getCurrentUser().getId());
	}

	@Transactional(readOnly = true)
	public List<MockWithUserStatusDto> getMocksWithUserStatus() {
		return userAttemptCache.mockStatusForUser(getCurrentUser().getId());
	}

	private void ensureScoring(TestAttempt attempt) {
		if (attempt.isSubmitted()) {
			applyScoring(attempt);
		}
	}

	private void applyScoring(TestAttempt attempt) {
		List<Question> questions = questionRepository.findByMockTestIdOrderByOrderIndexAsc(attempt.getMockTest().getId());
		AttemptAnswersData data = attempt.getAnswersJson();

		int correct = 0;
		int wrong = 0;
		int limit = attempt.getTotalQuestions();
		int idx = 0;
		for (Question q : questions) {
			if (idx >= limit) break;
			OptionLabel selected = AttemptAnswersJson.selectedOption(data, q.getId());
			if (selected != null) {
				if (selected == q.getCorrectOption()) correct++;
				else wrong++;
			}
			idx++;
		}

		ExamScoring.Breakdown b = ExamScoring.compute(limit, correct, wrong);
		attempt.setScore(correct);
		attempt.setCorrectCount(b.correct());
		attempt.setWrongCount(b.wrong());
		attempt.setUnattemptedCount(b.unattempted());
		attempt.setPositiveMarks(b.positiveMarks());
		attempt.setNegativeMarks(b.negativeMarks());
		attempt.setNetScore(b.netScore());
	}

	private void snapshotRank(TestAttempt attempt) {
		var unique = uniqueRankingService.computeForAttempt(attempt);
		attempt.setRankAtSubmit(unique.rank());
		attempt.setPercentileAtSubmit(unique.percentile());
		attempt.setUniqueStudentsAtSubmit(unique.uniqueStudents());
	}

	private RankStats rankStatsFor(TestAttempt attempt) {
		if (attempt.getRankAtSubmit() != null) {
			return new RankStats(
					attempt.getRankAtSubmit(),
					attempt.getPercentileAtSubmit() != null ? attempt.getPercentileAtSubmit() : 0,
					attempt.getUniqueStudentsAtSubmit() != null ? attempt.getUniqueStudentsAtSubmit() : 0,
					0);
		}
		return computeRankStats(attempt);
	}

	private RankStats computeRankStats(TestAttempt attempt) {
		var unique = uniqueRankingService.computeForAttempt(attempt);
		return new RankStats(
				unique.rank(),
				unique.percentile(),
				unique.uniqueStudents(),
				unique.totalAttempts());
	}

	private record RankStats(long rank, double percentile, long uniqueStudents, long totalAttempts) {}

	private AttemptResultDto buildResult(TestAttempt attempt) {
		return buildResult(attempt, false, 0);
	}

	private AttemptResultDto buildResult(TestAttempt attempt, boolean firstAttemptOnMock, int pointsEarned) {
		ensureScoring(attempt);
		List<Question> questions = questionRepository.findByMockTestIdOrderByOrderIndexAsc(attempt.getMockTest().getId());
		AttemptAnswersData data = attempt.getAnswersJson();

		List<AttemptResultDto.QuestionReviewDto> reviews = new ArrayList<>();
		int idx = 1;
		for (Question q : questions) {
			if (idx > attempt.getTotalQuestions()) break;
			OptionLabel selected = AttemptAnswersJson.selectedOption(data, q.getId());
			String selectedName = selected != null ? selected.name() : null;
			boolean attempted = selected != null;
			reviews.add(new AttemptResultDto.QuestionReviewDto(
					q.getId(), q.getOrderIndex(), q.getQuestionText(),
					q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD(),
					selectedName, q.getCorrectOption().name(),
					AttemptAnswersJson.isCorrect(data, q), attempted, q.getExplanation(),
					q.getSolutionImageUrl(),
					q.getTopic() != null ? q.getTopic().name() : null));
			idx++;
		}

		ExamScoring.Breakdown b = ExamScoring.compute(
				attempt.getTotalQuestions(),
				attempt.getCorrectCount(),
				attempt.getWrongCount());
		RankStats stats = rankStatsFor(attempt);
		double pctMarks = b.maxMarks() > 0 ? (attempt.getNetScore() / b.maxMarks()) * 100.0 : 0;
		return buildDto(attempt, reviews, stats, b, pctMarks, firstAttemptOnMock, pointsEarned);
	}

	private List<LeaderboardEntryDto> buildLeaderboard(TestAttempt current, long mockId) {
		return uniqueRankingService.topLeaderboardForMock(current.getMockTest(), current.getUser(), 10);
	}

	private AttemptResultDto buildDto(TestAttempt attempt, List<AttemptResultDto.QuestionReviewDto> reviews,
			RankStats stats, ExamScoring.Breakdown b, double pctMarks,
			boolean firstAttemptOnMock, int pointsEarned) {
		double cutoff = attempt.getMockTest().getCutoffMarks();
		double net = attempt.getNetScore();
		boolean cleared = net >= cutoff;
		double toCutoff = cleared ? 0 : round2(cutoff - net);
		List<LeaderboardEntryDto> leaderboard = buildLeaderboard(attempt, attempt.getMockTest().getId());
		List<TopicBreakdownDto> topicBreakdown = topicAnalyticsService.breakdownForAttempt(attempt);
		Set<Long> bookmarked = bookmarkedIdsForUser(attempt.getUser().getId());

		String share = String.format(
				"🎯 IBPS SO IT Officer Mock Result\n\n%s\nNet Score: %.2f / %.0f (Cutoff %.0f %s)\nCorrect: %d | Wrong: %d | Left: %d\nRank: #%d of %d students | Percentile: %.1f\n(Best score per student · retakes not counted)\n\nItOfficerHub",
				attempt.getMockTest().getTitle(),
				net, b.maxMarks(), cutoff, cleared ? "✅" : "❌",
				attempt.getCorrectCount(), attempt.getWrongCount(), attempt.getUnattemptedCount(),
				stats.rank(), stats.uniqueStudents(), stats.percentile());

		return new AttemptResultDto(
				attempt.getId(),
				attempt.getMockTest().getId(),
				attempt.getMockTest().getTitle(),
				attempt.getScore(),
				attempt.getTotalQuestions(),
				attempt.getCorrectCount(),
				attempt.getWrongCount(),
				attempt.getUnattemptedCount(),
				round2(attempt.getPositiveMarks()),
				round2(attempt.getNegativeMarks()),
				round2(net),
				b.maxMarks(),
				ExamScoring.MARKS_PER_CORRECT,
				ExamScoring.NEGATIVE_PER_WRONG,
				round1(pctMarks),
				round1(b.accuracyPercent()),
				attempt.getTimeTakenSeconds(),
				stats.rank(),
				round1(stats.percentile()),
				stats.uniqueStudents(),
				stats.rank(),
				round1(stats.percentile()),
				stats.uniqueStudents(),
				stats.totalAttempts(),
				cutoff,
				cleared,
				toCutoff,
				leaderboard,
				reviews,
				attempt.getMockTest().isAllowRetake(),
				share,
				topicBreakdown,
				bookmarked,
				firstAttemptOnMock,
				pointsEarned,
				prepPointsService.getTotalPoints(attempt.getUser().getId()));
	}

	private Set<Long> bookmarkedIdsForUser(long userId) {
		return new HashSet<>(revisionService.listForUser(userId).stream()
				.map(RevisionItemDto::questionId)
				.toList());
	}

	private double round1(double v) { return Math.round(v * 10) / 10.0; }
	private double round2(double v) { return Math.round(v * 100) / 100.0; }

	private TestAttempt loadOwnedAttempt(Long attemptId) {
		TestAttempt attempt = attemptRepository.findByIdWithMockAndUser(attemptId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Attempt not found"));
		UserPrincipal user = getCurrentUser();
		if (!attempt.getUser().getId().equals(user.getId())) {
			throw new ApiException(HttpStatus.FORBIDDEN, "Access denied");
		}
		return attempt;
	}

	private UserPrincipal getCurrentUser() {
		var auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.getPrincipal() instanceof UserPrincipal p) {
			return p;
		}
		throw new ApiException(HttpStatus.UNAUTHORIZED, "Login required to attempt mock tests");
	}
}
