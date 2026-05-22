package com.itofficerhub.service;

import com.itofficerhub.dto.*;
import com.itofficerhub.entity.*;
import com.itofficerhub.exception.ApiException;
import com.itofficerhub.repository.*;
import com.itofficerhub.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;

@Service
public class AttemptService {

	private final TestAttemptRepository attemptRepository;
	private final AttemptAnswerRepository answerRepository;
	private final MockTestRepository mockTestRepository;
	private final QuestionRepository questionRepository;
	private final UniqueRankingService uniqueRankingService;

	public AttemptService(TestAttemptRepository attemptRepository, AttemptAnswerRepository answerRepository,
			MockTestRepository mockTestRepository, QuestionRepository questionRepository,
			UniqueRankingService uniqueRankingService) {
		this.attemptRepository = attemptRepository;
		this.answerRepository = answerRepository;
		this.mockTestRepository = mockTestRepository;
		this.questionRepository = questionRepository;
		this.uniqueRankingService = uniqueRankingService;
	}

	@Transactional
	public StartAttemptResponse startAttempt(StartAttemptRequest request) {
		UserPrincipal user = getCurrentUser();
		MockTest mock = mockTestRepository.findById(request.mockTestId())
				.filter(MockTest::isPublished)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Mock test not found"));
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
		List<AttemptAnswer> answers = answerRepository.findByAttemptIdOrderByQuestionOrderIndexAsc(attemptId);
		List<AttemptProgressDto.AnswerProgressDto> dtos = answers.stream()
				.map(a -> new AttemptProgressDto.AnswerProgressDto(
						a.getQuestion().getId(),
						a.getSelectedOption() != null ? a.getSelectedOption().name() : null,
						a.isMarkedForReview()))
				.toList();
		return new AttemptProgressDto(dtos);
	}

	@Transactional
	public void saveAnswer(Long attemptId, SaveAnswerRequest request) {
		TestAttempt attempt = loadOwnedAttempt(attemptId);
		if (attempt.isSubmitted()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Attempt already submitted");
		}
		if (request.selectedOption() == null && request.markedForReview() == null) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Provide selectedOption and/or markedForReview");
		}
		Question question = questionRepository.findById(request.questionId())
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found"));

		List<AttemptAnswer> existing = answerRepository.findByAttemptIdOrderByQuestionOrderIndexAsc(attemptId);
		AttemptAnswer answer = existing.stream()
				.filter(a -> a.getQuestion().getId().equals(question.getId()))
				.findFirst()
				.orElse(new AttemptAnswer());
		answer.setAttempt(attempt);
		answer.setQuestion(question);
		if (request.selectedOption() != null) {
			OptionLabel selected = parseOption(request.selectedOption());
			answer.setSelectedOption(selected);
			answer.setCorrect(selected != null && selected == question.getCorrectOption());
		}
		if (request.markedForReview() != null) {
			answer.setMarkedForReview(request.markedForReview());
		}
		answerRepository.save(answer);
	}

	@Transactional
	public AttemptResultDto submit(Long attemptId, SubmitAttemptRequest request) {
		TestAttempt attempt = loadOwnedAttempt(attemptId);
		if (attempt.isSubmitted()) {
			return buildResult(attempt);
		}
		if (request.answers() != null) {
			for (var sub : request.answers()) {
				saveAnswer(attemptId, new SaveAnswerRequest(sub.questionId(), sub.selectedOption(), null));
			}
		}
		applyScoring(attempt);
		attempt.setTimeTakenSeconds(request.timeTakenSeconds());
		attempt.setSubmitted(true);
		attempt.setSubmittedAt(Instant.now());
		attemptRepository.save(attempt);
		return buildResult(attempt);
	}

	public AttemptResultDto getResult(Long attemptId) {
		TestAttempt attempt = loadOwnedAttempt(attemptId);
		if (!attempt.isSubmitted()) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Attempt not submitted yet");
		}
		return buildResult(attempt);
	}

	public List<AttemptResultDto> getUserHistory() {
		UserPrincipal user = getCurrentUser();
		return attemptRepository.findByUserIdAndSubmittedTrueOrderBySubmittedAtDesc(user.getId()).stream()
				.map(this::buildResultSummary)
				.toList();
	}

	private void ensureScoring(TestAttempt attempt) {
		if (attempt.isSubmitted()) {
			applyScoring(attempt);
		}
	}

	private void applyScoring(TestAttempt attempt) {
		List<Question> questions = questionRepository.findByMockTestIdOrderByOrderIndexAsc(attempt.getMockTest().getId());
		List<AttemptAnswer> answers = answerRepository.findByAttemptIdOrderByQuestionOrderIndexAsc(attempt.getId());
		Map<Long, AttemptAnswer> answerMap = new HashMap<>();
		answers.forEach(a -> answerMap.put(a.getQuestion().getId(), a));

		int correct = 0;
		int wrong = 0;
		int limit = attempt.getTotalQuestions();
		int idx = 0;
		for (Question q : questions) {
			if (idx >= limit) break;
			AttemptAnswer aa = answerMap.get(q.getId());
			if (aa != null && aa.getSelectedOption() != null) {
				if (aa.isCorrect()) correct++;
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

	private RankStats computeRankStats(TestAttempt attempt) {
		var unique = uniqueRankingService.computeForAttempt(attempt);
		return new RankStats(
				unique.rank(),
				unique.percentile(),
				unique.uniqueStudents(),
				unique.totalAttempts());
	}

	private record RankStats(long rank, double percentile, long uniqueStudents, long totalAttempts) {}

	private AttemptResultDto buildResultSummary(TestAttempt attempt) {
		ensureScoring(attempt);
		ExamScoring.Breakdown b = ExamScoring.compute(
				attempt.getTotalQuestions(),
				attempt.getCorrectCount(),
				attempt.getWrongCount());
		RankStats stats = computeRankStats(attempt);
		double pctMarks = b.maxMarks() > 0 ? (attempt.getNetScore() / b.maxMarks()) * 100.0 : 0;
		return buildDto(attempt, List.of(), stats, b, pctMarks);
	}

	private AttemptResultDto buildResult(TestAttempt attempt) {
		ensureScoring(attempt);
		List<Question> questions = questionRepository.findByMockTestIdOrderByOrderIndexAsc(attempt.getMockTest().getId());
		List<AttemptAnswer> answers = answerRepository.findByAttemptIdOrderByQuestionOrderIndexAsc(attempt.getId());
		Map<Long, AttemptAnswer> answerMap = new HashMap<>();
		answers.forEach(a -> answerMap.put(a.getQuestion().getId(), a));

		List<AttemptResultDto.QuestionReviewDto> reviews = new ArrayList<>();
		int idx = 1;
		for (Question q : questions) {
			if (idx > attempt.getTotalQuestions()) break;
			AttemptAnswer aa = answerMap.get(q.getId());
			String selected = aa != null && aa.getSelectedOption() != null ? aa.getSelectedOption().name() : null;
			boolean attempted = selected != null;
			reviews.add(new AttemptResultDto.QuestionReviewDto(
					q.getId(), q.getOrderIndex(), q.getQuestionText(),
					q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD(),
					selected, q.getCorrectOption().name(),
					aa != null && aa.isCorrect(), attempted, q.getExplanation(),
					q.getSolutionImageUrl(),
					q.getTopic() != null ? q.getTopic().name() : null));
			idx++;
		}

		ExamScoring.Breakdown b = ExamScoring.compute(
				attempt.getTotalQuestions(),
				attempt.getCorrectCount(),
				attempt.getWrongCount());
		RankStats stats = computeRankStats(attempt);
		double pctMarks = b.maxMarks() > 0 ? (attempt.getNetScore() / b.maxMarks()) * 100.0 : 0;
		return buildDto(attempt, reviews, stats, b, pctMarks);
	}

	private List<LeaderboardEntryDto> buildLeaderboard(TestAttempt current, long mockId) {
		return uniqueRankingService.topLeaderboard(mockId, current.getUser(), 10);
	}

	private AttemptResultDto buildDto(TestAttempt attempt, List<AttemptResultDto.QuestionReviewDto> reviews,
			RankStats stats, ExamScoring.Breakdown b, double pctMarks) {
		double cutoff = attempt.getMockTest().getCutoffMarks();
		double net = attempt.getNetScore();
		boolean cleared = net >= cutoff;
		double toCutoff = cleared ? 0 : round2(cutoff - net);
		List<LeaderboardEntryDto> leaderboard = buildLeaderboard(attempt, attempt.getMockTest().getId());

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
				share);
	}

	private double round1(double v) { return Math.round(v * 10) / 10.0; }
	private double round2(double v) { return Math.round(v * 100) / 100.0; }

	private TestAttempt loadOwnedAttempt(Long attemptId) {
		TestAttempt attempt = attemptRepository.findById(attemptId)
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

	private OptionLabel parseOption(String opt) {
		if (opt == null || opt.isBlank()) return null;
		try {
			return OptionLabel.valueOf(opt.trim().toUpperCase());
		} catch (IllegalArgumentException e) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid option: " + opt);
		}
	}
}
