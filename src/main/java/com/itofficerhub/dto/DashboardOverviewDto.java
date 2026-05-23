package com.itofficerhub.dto;

import java.util.List;

public record DashboardOverviewDto(
		MockOfDayDto mockOfTheDay,
		UpcomingMockDto upcomingMock,
		ProfileOfDayDto profileOfTheDay,
		List<HallOfFameEntryDto> hallOfFameTop10,
		List<LeaderboardEntryDto> todaysMockLeaderboard,
		PublicStatsDto platformStats,
		double marksPerCorrect,
		double marksPerWrong
) {}
