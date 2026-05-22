package com.itofficerhub.dto;

import java.time.Instant;

public record AttemptHistoryItemDto(
		Long attemptId,
		Long mockTestId,
		String mockTitle,
		double netScore,
		double maxMarks,
		int correctCount,
		int wrongCount,
		double percentage,
		long uniqueRank,
		double uniquePercentile,
		long uniqueStudents,
		boolean clearedCutoff,
		double cutoffMarks,
		Instant submittedAt,
		boolean allowRetake,
		int attemptIndexForMock
) {}
