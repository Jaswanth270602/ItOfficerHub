package com.itofficerhub.dto;

public record PracticeQuestionDto(
		Long id,
		String sectionId,
		String sectionTitle,
		String subtopicSlug,
		String subtopicTitle,
		String topic,
		String questionText,
		String optionA,
		String optionB,
		String optionC,
		String optionD,
		String explanation,
		String solutionImageUrl) {}
