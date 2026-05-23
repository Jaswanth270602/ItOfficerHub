package com.itofficerhub.dto;

import java.time.Instant;

public record MockTestSummaryDto(
		Long id,
		String title,
		String description,
		String difficulty,
		int questionCount,
		int timeLimitMinutes,
		long attemptsCount,
		boolean allowRetake,
		Instant publishedAt,
		java.util.List<String> topics,
		boolean cumulative,
		String mockCategory,
		String examTarget,
		Integer seriesDay,
		String mockCode
) {}
