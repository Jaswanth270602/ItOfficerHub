package com.itofficerhub.dto;

public record MockTestSummaryDto(
		Long id,
		String title,
		String description,
		String difficulty,
		int questionCount,
		int timeLimitMinutes,
		long attemptsCount,
		boolean allowRetake
) {}
