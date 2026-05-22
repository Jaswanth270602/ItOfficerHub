package com.itofficerhub.dto;

public record QuestionAdminDto(
		Long id,
		Long mockTestId,
		int orderIndex,
		String questionText,
		String optionA,
		String optionB,
		String optionC,
		String optionD,
		String correctOption,
		String explanation,
		String topic
) {}
