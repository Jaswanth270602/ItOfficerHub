package com.itofficerhub.dto;

import java.util.List;

public record VisitorAnalyticsDto(
		List<SiteVisitRowDto> visits,
		long totalElements,
		int page,
		int size,
		long totalPages,
		long visitsOnSelectedDay,
		long uniqueIpsOnSelectedDay,
		List<DailyVisitSummaryDto> dailySummaries
) {}
