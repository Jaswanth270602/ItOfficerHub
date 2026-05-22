package com.itofficerhub.dto;

public record TopicBreakdownDto(
		String topic,
		String shortLabel,
		String fullLabel,
		int total,
		int correct,
		int wrong,
		int unattempted,
		double accuracyPercent
) {}
