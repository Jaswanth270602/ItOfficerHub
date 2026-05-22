package com.itofficerhub.dto;

public record MockTestAdminDto(
		Long id,
		String title,
		String description,
		String difficulty,
		int questionCount,
		int timeLimitMinutes,
		boolean published,
		boolean allowRetake,
		long attemptsCount
) {}
