package com.itofficerhub.dto;

public record AdminDashboardDto(
		long totalMocks,
		long totalQuestions,
		long totalUsers,
		long totalAttempts
) {}
