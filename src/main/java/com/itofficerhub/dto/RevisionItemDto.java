package com.itofficerhub.dto;

public record RevisionItemDto(
		Long questionId,
		Long mockTestId,
		String mockTitle,
		int orderIndex,
		String questionText,
		String topic,
		String shortLabel,
		String correctOption,
		String explanation,
		String solutionImageUrl,
		Long sourceAttemptId
) {}
