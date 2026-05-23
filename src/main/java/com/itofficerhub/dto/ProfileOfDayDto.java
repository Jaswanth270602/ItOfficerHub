package com.itofficerhub.dto;

import java.time.Instant;

public record ProfileOfDayDto(
		Long userId,
		String displayName,
		String avatarEmoji,
		String headline,
		double featuredNetScore,
		long featuredRank,
		long featuredMockId,
		String featuredMockTitle,
		int mocksAttempted,
		double aggregateScore,
		Instant spotlightExpiresAt
) {}
