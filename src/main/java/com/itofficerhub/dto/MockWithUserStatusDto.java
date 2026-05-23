package com.itofficerhub.dto;

import java.time.Instant;

public record MockWithUserStatusDto(
		Long id,
		String title,
		String description,
		String difficulty,
		int questionCount,
		int timeLimitMinutes,
		long attemptsCount,
		boolean allowRetake,
		Instant publishedAt,
		boolean featuredToday,
		boolean attempted,
		int userAttemptCount,
		Double bestNetScore,
		Long latestAttemptId,
		boolean latestClearedCutoff,
		java.util.List<String> topics,
		boolean cumulative,
		String mockCategory,
		String examTarget,
		Integer seriesDay,
		String mockCode
) {}
