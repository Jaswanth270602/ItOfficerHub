package com.itofficerhub.dto;

public record QuestionDto(
		Long id,
		int orderIndex,
		String questionText,
		String optionA,
		String optionB,
		String optionC,
		String optionD,
		String topic
) {}
