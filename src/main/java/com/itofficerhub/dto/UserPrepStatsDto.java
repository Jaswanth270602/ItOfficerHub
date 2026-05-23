package com.itofficerhub.dto;

import java.util.List;

public record UserPrepStatsDto(
		long totalAttempts,
		long uniqueMocksAttempted,
		int currentStreakDays,
		double bestNetScore,
		long revisionBookmarkCount,
		int prepPoints,
		List<TopicBreakdownDto> lifetimeTopicBreakdown,
		List<ChallengeDayDto> challengePlan
) {
	public record ChallengeDayDto(int day, Long mockId, String title, boolean published, boolean attempted) {}
}
