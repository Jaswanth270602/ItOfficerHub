package com.itofficerhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ScheduleMockRequest(
		@NotBlank
		@Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "liveOn must be yyyy-MM-dd")
		String liveOn
) {}
