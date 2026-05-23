package com.itofficerhub.dto;

import java.time.Instant;

public record UpcomingMockDto(
		Long id,
		String title,
		String mockCode,
		Instant goLiveAt,
		String goLiveDateLabel
) {}
