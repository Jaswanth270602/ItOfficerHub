package com.itofficerhub.controller;

import com.itofficerhub.dto.DashboardOverviewDto;
import com.itofficerhub.dto.MockTestSummaryDto;
import com.itofficerhub.dto.PublicStatsDto;
import com.itofficerhub.dto.TopicCatalogItemDto;
import com.itofficerhub.service.DashboardService;
import com.itofficerhub.service.PracticeService;
import com.itofficerhub.service.PublicService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {

	private final PublicService publicService;
	private final DashboardService dashboardService;
	private final PracticeService practiceService;

	public PublicController(PublicService publicService, DashboardService dashboardService,
			PracticeService practiceService) {
		this.publicService = publicService;
		this.dashboardService = dashboardService;
		this.practiceService = practiceService;
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

	@GetMapping("/practice/catalog")
	public com.itofficerhub.dto.PracticeCatalogDto practiceCatalog() {
		return practiceService.catalog();
	}

	@GetMapping("/practice/sections/{sectionId}")
	public com.itofficerhub.dto.PracticeSectionDto practiceSection(@PathVariable String sectionId) {
		return practiceService.section(sectionId);
	}

	@GetMapping("/practice/sections/{sectionId}/topics/{subtopicSlug}")
	public com.itofficerhub.dto.PracticeQuestionDto practiceQuestion(
			@PathVariable String sectionId,
			@PathVariable String subtopicSlug) {
		return practiceService.getQuestion(sectionId, subtopicSlug);
	}

	@GetMapping("/practice/sections/{sectionId}/topics/{subtopicSlug}/reveal")
	public PracticeService.PracticeRevealDto practiceReveal(
			@PathVariable String sectionId,
			@PathVariable String subtopicSlug) {
		return practiceService.revealAnswer(sectionId, subtopicSlug);
	}
}
