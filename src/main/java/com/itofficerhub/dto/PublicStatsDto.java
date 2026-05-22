package com.itofficerhub.dto;

public record PublicStatsDto(
		long totalMocks,
		long totalUsers,
		long totalAttempts,
		double averageScorePercent
) {}
