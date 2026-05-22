package com.itofficerhub.dto;

public record HallOfFameEntryDto(
		int rank,
		Long userId,
		String displayName,
		String avatarEmoji,
		double aggregateScore,
		int mocksContributed,
		int totalCorrect,
		int totalTimeSeconds
) {}
