package com.itofficerhub.dto;

import jakarta.validation.constraints.NotNull;

public record DailyQuizAnswerRequest(
		@NotNull Long questionId,
		String selectedOption) {}
