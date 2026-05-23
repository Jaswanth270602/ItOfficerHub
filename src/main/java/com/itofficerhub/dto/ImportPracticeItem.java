package com.itofficerhub.dto;

import jakarta.validation.constraints.NotBlank;

public record ImportPracticeItem(
		@NotBlank String sectionId,
		@NotBlank String subtopicSlug,
		String topic,
		@NotBlank String questionText,
		@NotBlank String optionA,
		@NotBlank String optionB,
		@NotBlank String optionC,
		@NotBlank String optionD,
		@NotBlank String correctOption,
		@NotBlank String explanation,
		Integer questionNumber,
		String solutionImageUrl,
		Boolean published) {}
