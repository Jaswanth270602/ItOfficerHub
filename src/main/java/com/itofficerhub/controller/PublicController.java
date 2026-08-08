package com.itofficerhub.controller;

import com.itofficerhub.dto.DashboardOverviewDto;
import com.itofficerhub.dto.MockTestSummaryDto;
import com.itofficerhub.dto.PublicStatsDto;
import com.itofficerhub.dto.TopicCatalogItemDto;
import com.itofficerhub.service.DashboardService;
import com.itofficerhub.service.PracticeService;
import com.itofficerhub.service.PublicService;
import com.itofficerhub.service.VisitTrackingService;
import com.itofficerhub.service.VocabDailyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

	private final PublicService publicService;
	private final DashboardService dashboardService;
	private final PracticeService practiceService;
	private final VisitTrackingService visitTrackingService;
	private final VocabDailyService vocabDailyService;

	public PublicController(PublicService publicService, DashboardService dashboardService,
			PracticeService practiceService, VisitTrackingService visitTrackingService,
			VocabDailyService vocabDailyService) {
		this.publicService = publicService;
		this.dashboardService = dashboardService;
		this.practiceService = practiceService;
		this.visitTrackingService = visitTrackingService;
		this.vocabDailyService = vocabDailyService;
	}

	@GetMapping("/vocab-daily/download")
	public ResponseEntity<Resource> downloadVocabDaily() {
		Resource apk = vocabDailyService.prepareDownload();
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"VocabDaily.apk\"")
				.contentType(MediaType.parseMediaType("application/vnd.android.package-archive"))
				.body(apk);
	}

	@GetMapping("/vocab-daily/stats")
	public Map<String, Long> vocabDailyStats() {
		return Map.of("downloads", vocabDailyService.downloadCount());
	}

	@PostMapping("/visits")
	public void recordVisit(@Valid @RequestBody com.itofficerhub.dto.RecordVisitRequest request,
			HttpServletRequest httpRequest) {
		visitTrackingService.recordVisit(httpRequest, request);
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

	@GetMapping("/practice/daily-quiz")
	public com.itofficerhub.dto.DailyQuizDto dailyQuiz() {
		return practiceService.dailyQuiz();
	}

	@PostMapping("/practice/daily-quiz/submit")
	public com.itofficerhub.dto.DailyQuizResultDto submitDailyQuiz(
			@Valid @RequestBody com.itofficerhub.dto.DailyQuizSubmitRequest request) {
		return practiceService.submitDailyQuiz(request);
	}

	@GetMapping("/practice/catalog")
	public com.itofficerhub.dto.PracticeCatalogDto practiceCatalog() {
		return practiceService.catalog();
	}

	@GetMapping("/practice/sections/{sectionId}")
	public com.itofficerhub.dto.PracticeSectionDto practiceSection(@PathVariable String sectionId) {
		return practiceService.section(sectionId);
	}

	@GetMapping("/practice/sections/{sectionId}/topics/{subtopicSlug}/questions")
	public java.util.List<com.itofficerhub.dto.PracticeQuestionSummaryDto> practiceQuestionList(
			@PathVariable String sectionId,
			@PathVariable String subtopicSlug) {
		return practiceService.listQuestions(sectionId, subtopicSlug);
	}

	@GetMapping("/practice/sections/{sectionId}/topics/{subtopicSlug}/questions/{questionNumber}")
	public com.itofficerhub.dto.PracticeQuestionDto practiceQuestionByNumber(
			@PathVariable String sectionId,
			@PathVariable String subtopicSlug,
			@PathVariable int questionNumber) {
		return practiceService.getQuestionByNumber(sectionId, subtopicSlug, questionNumber);
	}

	@GetMapping("/practice/sections/{sectionId}/topics/{subtopicSlug}/questions/{questionNumber}/reveal")
	public PracticeService.PracticeRevealDto practiceRevealByNumber(
			@PathVariable String sectionId,
			@PathVariable String subtopicSlug,
			@PathVariable int questionNumber) {
		return practiceService.revealAnswerByNumber(sectionId, subtopicSlug, questionNumber);
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
