package com.itofficerhub.controller;

import com.itofficerhub.dto.DashboardOverviewDto;
import com.itofficerhub.dto.MockTestSummaryDto;
import com.itofficerhub.dto.PublicStatsDto;
import com.itofficerhub.dto.TopicCatalogItemDto;
import com.itofficerhub.service.DashboardService;
import com.itofficerhub.service.PublicService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {

	private final PublicService publicService;
	private final DashboardService dashboardService;

	public PublicController(PublicService publicService, DashboardService dashboardService) {
		this.publicService = publicService;
		this.dashboardService = dashboardService;
	}

	@GetMapping("/dashboard")
	public DashboardOverviewDto dashboard() {
		return dashboardService.getOverview();
	}

	@GetMapping("/stats")
	public PublicStatsDto stats() {
		return publicService.getStats();
	}

	@GetMapping("/mocks")
	public List<MockTestSummaryDto> mocks() {
		return publicService.listPublishedMocks();
	}

	@GetMapping("/topics")
	public List<TopicCatalogItemDto> topics() {
		return publicService.topicCatalog();
	}

	@GetMapping("/exam-targets")
	public List<com.itofficerhub.dto.ExamTargetCatalogItemDto> examTargets() {
		return com.itofficerhub.util.ExamTargetDisplay.catalog();
	}

	@GetMapping("/mock-categories")
	public List<com.itofficerhub.dto.MockCategoryCatalogItemDto> mockCategories() {
		return com.itofficerhub.util.MockCategoryDisplay.catalog();
	}
}
