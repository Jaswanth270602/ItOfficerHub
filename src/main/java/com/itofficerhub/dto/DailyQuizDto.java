package com.itofficerhub.dto;

import java.util.List;

public record DailyQuizDto(
		String quizDate,
		String title,
		int questionCount,
		List<DailyQuizQuestionDto> questions) {}
