package com.itofficerhub.dto;

import java.time.Instant;

public record MockOfDayDto(
		Long id,
		String title,
		String description,
		String difficulty,
		int questionCount,
		int timeLimitMinutes,
		long attemptsCount,
		boolean allowRetake,
		double cutoffMarks,
		Instant publishedAt,
		double marksPerCorrect,
		double marksPerWrong
) {}
