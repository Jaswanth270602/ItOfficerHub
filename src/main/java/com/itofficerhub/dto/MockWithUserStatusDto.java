package com.itofficerhub.dto;

public record MockWithUserStatusDto(
		Long id,
		String title,
		String description,
		String difficulty,
		int questionCount,
		int timeLimitMinutes,
		long attemptsCount,
		boolean allowRetake,
		boolean attempted,
		int userAttemptCount,
		Double bestNetScore,
		Long latestAttemptId,
		boolean latestClearedCutoff
) {}
