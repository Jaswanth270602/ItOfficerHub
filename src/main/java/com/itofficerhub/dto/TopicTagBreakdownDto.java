package com.itofficerhub.dto;

public record TopicTagBreakdownDto(
		String tag,
		int total,
		int correct,
		int wrong,
		int unattempted,
		double accuracyPercent
) {}
