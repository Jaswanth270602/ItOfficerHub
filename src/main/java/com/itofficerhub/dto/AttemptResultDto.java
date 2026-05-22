package com.itofficerhub.dto;

import java.util.List;

public record AttemptResultDto(
		Long attemptId,
		Long mockTestId,
		String mockTitle,
		int score,
		int totalQuestions,
		int correctCount,
		int wrongCount,
		int unattemptedCount,
		double positiveMarks,
		double negativeMarks,
		double netScore,
		double maxMarks,
		double marksPerCorrect,
		double negativePerWrong,
		double percentage,
		double accuracy,
		int timeTakenSeconds,
		long rank,
		double percentile,
		long totalTestTakers,
		long uniqueRank,
		double uniquePercentile,
		long uniqueStudents,
		long totalAttemptsAll,
		double cutoffMarks,
		boolean clearedCutoff,
		double marksToCutoff,
		List<LeaderboardEntryDto> leaderboard,
		List<QuestionReviewDto> reviews,
		boolean allowRetake,
		String shareMessage
) {
	public record QuestionReviewDto(
			Long questionId,
			int orderIndex,
			String questionText,
			String optionA,
			String optionB,
			String optionC,
			String optionD,
			String selectedOption,
			String correctOption,
			boolean correct,
			boolean attempted,
			String explanation,
			String solutionImageUrl,
			String topic
	) {}
}
