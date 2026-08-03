package com.itofficerhub.dto;

public record DailyQuizReviewDto(
		long questionId,
		int orderIndex,
		String questionText,
		String selectedOption,
		String correctOption,
		boolean correct,
		boolean attempted,
		String explanation,
		String topic) {}
