package com.itofficerhub.dto;

public record DailyQuizQuestionDto(
		long id,
		int orderIndex,
		String topic,
		String sectionTitle,
		String subtopicTitle,
		String questionText,
		String optionA,
		String optionB,
		String optionC,
		String optionD) {}
