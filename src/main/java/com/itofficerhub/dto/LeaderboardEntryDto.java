package com.itofficerhub.dto;

public record LeaderboardEntryDto(
		int rank,
		Long userId,
		String displayName,
		double netScore,
		int correctCount,
		int timeTakenSeconds,
		boolean currentUser
) {}
