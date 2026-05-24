package com.itofficerhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RecordVisitRequest(
		@NotBlank @Size(max = 512) String path,
		@Size(max = 1024) String query,
		@Size(max = 2048) String referer,
		@Size(max = 64) String sessionKey
) {}
