package com.itofficerhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record QuestionRequest(
		@NotNull Long mockTestId,
		@NotBlank String questionText,
		@NotBlank String optionA,
		@NotBlank String optionB,
		@NotBlank String optionC,
		@NotBlank String optionD,
		@NotBlank String correctOption,
		String explanation,
		String topic,
		Integer orderIndex
) {}
