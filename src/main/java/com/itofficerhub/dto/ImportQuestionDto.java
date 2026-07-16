package com.itofficerhub.dto;

import jakarta.validation.constraints.NotBlank;

public record ImportQuestionDto(
		@NotBlank String questionText,
		@NotBlank String optionA,
		@NotBlank String optionB,
		@NotBlank String optionC,
		@NotBlank String optionD,
		@NotBlank String correctOption,
		String explanation,
		/** Short reason for option A (preferred over long free-text templates). */
		String explainA,
		String explainB,
		String explainC,
		String explainD,
		String solutionImageUrl,
		String topic,
		Integer orderIndex,
		String topicTag
) {}
