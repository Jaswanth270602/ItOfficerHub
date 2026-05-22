package com.itofficerhub.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ImportMockRequest(
		@NotBlank String title,
		String description,
		@NotBlank String difficulty,
		@NotEmpty @Valid List<ImportQuestionDto> questions,
		String mockCategory,
		String examTarget,
		Integer seriesDay,
		Integer timeLimitMinutes,
		Integer questionCount
) {}
