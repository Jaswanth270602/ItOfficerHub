package com.itofficerhub.dto;

public record ScoreCardDto(
		Long attemptId,
		String mockTitle,
		double netScore,
		double maxMarks,
		int correctCount,
		int wrongCount,
		long uniqueRank,
		double uniquePercentile,
		long uniqueStudents,
		boolean clearedCutoff,
		double cutoffMarks
) {}
