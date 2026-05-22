package com.itofficerhub.util;

import com.itofficerhub.dto.ExamTargetCatalogItemDto;
import com.itofficerhub.entity.ExamTarget;

import java.util.Arrays;
import java.util.List;

public final class ExamTargetDisplay {

	private ExamTargetDisplay() {}

	public static List<ExamTargetCatalogItemDto> catalog() {
		return Arrays.stream(ExamTarget.values())
				.map(e -> new ExamTargetCatalogItemDto(e.name(), label(e)))
				.toList();
	}

	public static String label(ExamTarget target) {
		return switch (target) {
			case IBPS_SO_IT -> "IBPS SO IT Officer";
			case NIACL_IT -> "NIACL IT Officer";
			case LIC_IT -> "LIC IT Officer";
			case GIC_IT -> "GIC IT Officer";
			case RBI_IT -> "RBI IT Officer";
			case PSU_IT_GENERAL -> "PSU IT (General)";
			case MIXED -> "Mixed PSU / Bank IT";
		};
	}
}
