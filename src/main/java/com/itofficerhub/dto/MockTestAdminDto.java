package com.itofficerhub.dto;

import java.time.Instant;

public record MockTestAdminDto(
		Long id,
		String title,
		String description,
		String difficulty,
		int questionCount,
		int timeLimitMinutes,
		boolean published,
		boolean allowRetake,
		long attemptsCount,
		Instant publishedAt
) {}
