package com.itofficerhub.dto;

public record PracticeQuestionAdminDto(
		Long id,
		String sectionId,
		String subtopicSlug,
		int questionNumber,
		String topic,
		String questionText,
		String optionA,
		String optionB,
		String optionC,
		String optionD,
		String correctOption,
		String explanation,
		String solutionImageUrl,
		boolean published
) {}
