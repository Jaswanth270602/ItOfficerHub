package com.itofficerhub.dto;

import jakarta.validation.constraints.NotBlank;

public record MockTestRequest(
		@NotBlank String title,
		String description,
		String difficulty,
		Integer questionCount,
		Integer timeLimitMinutes,
		Boolean published,
		Boolean allowRetake
) {}
