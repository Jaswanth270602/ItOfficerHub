package com.itofficerhub.dto;

public record LeaderboardEntryDto(
		int rank,
		String displayName,
		double netScore,
		int correctCount,
		int timeTakenSeconds,
		boolean currentUser
) {}
