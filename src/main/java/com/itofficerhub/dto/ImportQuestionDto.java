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
		String solutionImageUrl,
		String topic,
		Integer orderIndex,
		String topicTag
) {}
