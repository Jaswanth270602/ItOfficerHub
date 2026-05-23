package com.itofficerhub.dto;

import java.util.List;

public record PracticeCatalogDto(
		List<PracticeSectionDto> sections,
		int totalSubtopics,
		int availableQuestions) {}
