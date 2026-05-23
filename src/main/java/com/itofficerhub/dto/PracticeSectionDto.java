package com.itofficerhub.dto;

import java.util.List;

public record PracticeSectionDto(
		String id,
		String title,
		String topic,
		String topicLabel,
		String description,
		int subtopicCount,
		int availableCount,
		List<PracticeSubtopicDto> subtopics) {}
