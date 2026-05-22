package com.itofficerhub.dto;

import jakarta.validation.constraints.NotNull;

public record SaveAnswerRequest(
		@NotNull Long questionId,
		String selectedOption,
		Boolean markedForReview
) {}
