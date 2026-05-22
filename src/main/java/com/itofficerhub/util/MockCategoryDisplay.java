package com.itofficerhub.util;

import com.itofficerhub.dto.MockCategoryCatalogItemDto;
import com.itofficerhub.entity.MockCategory;

import java.util.Arrays;
import java.util.List;

public final class MockCategoryDisplay {

	private MockCategoryDisplay() {}

	public static List<MockCategoryCatalogItemDto> catalog() {
		return Arrays.stream(MockCategory.values())
				.map(c -> new MockCategoryCatalogItemDto(c.name(), label(c)))
				.toList();
	}

	public static String label(MockCategory category) {
		return switch (category) {
			case FULL -> "Full mock";
			case SECTIONAL -> "Sectional";
			case PYQ -> "Previous year";
			case CHALLENGE -> "30-day challenge";
		};
	}
}
