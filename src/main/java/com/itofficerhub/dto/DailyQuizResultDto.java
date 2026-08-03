package com.itofficerhub.dto;

import java.util.List;

public record DailyQuizResultDto(
		String quizDate,
		int correctCount,
		int wrongCount,
		int skippedCount,
		int totalQuestions,
		int scorePercent,
		String shareHeadline,
		List<DailyQuizReviewDto> reviews) {}
