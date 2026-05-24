package com.itofficerhub.dto;

import java.time.Instant;

public record SiteVisitRowDto(
		Long id,
		String ipAddress,
		Instant visitedAt,
		String visitDate,
		String path,
		String queryString,
		String referer,
		String deviceClass,
		boolean authenticated,
		Long userId,
		String userEmail,
		String userName,
		String countryHint
) {}
