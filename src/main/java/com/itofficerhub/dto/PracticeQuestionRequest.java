package com.itofficerhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PracticeQuestionRequest(
		@NotBlank String sectionId,
		@NotBlank String subtopicSlug,
		@NotBlank String questionText,
		@NotBlank String optionA,
		@NotBlank String optionB,
		@NotBlank String optionC,
		@NotBlank String optionD,
		@NotBlank String correctOption,
		String explanation,
		String topic,
		Integer questionNumber,
		String solutionImageUrl,
		Boolean published
) {}
