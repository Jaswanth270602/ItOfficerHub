package com.itofficerhub.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CreateGroupRequest(
		@NotBlank String name,
		String description,
		List<Long> memberIds
) {}
