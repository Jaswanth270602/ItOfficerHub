package com.itofficerhub.controller;

import com.itofficerhub.dto.*;
import com.itofficerhub.service.AdminService;
import com.itofficerhub.service.PracticeService;
import com.itofficerhub.service.VisitTrackingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

	private final AdminService adminService;
	private final PracticeService practiceService;
	private final VisitTrackingService visitTrackingService;

	public AdminController(AdminService adminService, PracticeService practiceService,
			VisitTrackingService visitTrackingService) {
		this.adminService = adminService;
		this.practiceService = practiceService;
		this.visitTrackingService = visitTrackingService;
	}

	@GetMapping("/visitors")
	public VisitorAnalyticsDto visitors(
			@RequestParam(required = false) String date,
			@RequestParam(required = false) String ip,
			@RequestParam(required = false) String path,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "50") int size) {
		return visitTrackingService.adminAnalytics(date, ip, path, page, size);
	}

	@GetMapping("/dashboard")
	public AdminDashboardDto dashboard() {
		return adminService.dashboard();
	}

	@GetMapping("/users")
	public List<UserAdminDto> listUsers(@RequestParam(defaultValue = "USER") String role) {
		return adminService.listUsers(role);
	}

	@PutMapping("/users/{id}/password")
	public void resetUserPassword(@PathVariable Long id, @Valid @RequestBody AdminResetPasswordRequest request) {
		adminService.resetUserPassword(id, request);
	}

	@GetMapping("/mocks")
	public List<MockTestAdminDto> listMocks() {
		return adminService.listMocks();
	}

	@GetMapping("/mocks/{id}")
	public MockTestAdminDto getMock(@PathVariable Long id) {
		return adminService.getMock(id);
	}

	@PostMapping("/mocks")
	public MockTestAdminDto createMock(@Valid @RequestBody MockTestRequest request) {
		return adminService.createMock(request);
	}

	@PutMapping("/mocks/{id}")
	public MockTestAdminDto updateMock(@PathVariable Long id, @Valid @RequestBody MockTestRequest request) {
		return adminService.updateMock(id, request);
	}

	@DeleteMapping("/mocks/{id}")
	public void deleteMock(@PathVariable Long id) {
		adminService.deleteMock(id);
	}

	@PatchMapping("/mocks/{id}/publish")
	public MockTestAdminDto togglePublish(@PathVariable Long id) {
		return adminService.togglePublish(id);
	}

	@PatchMapping("/mocks/{id}/show-date")
	public MockTestAdminDto toggleShowExamDate(@PathVariable Long id) {
		return adminService.toggleShowExamDate(id);
	}

	@PatchMapping("/mocks/{id}/schedule")
	public MockTestAdminDto scheduleMock(@PathVariable Long id, @Valid @RequestBody ScheduleMockRequest request) {
		return adminService.scheduleMock(id, request);
	}

	@DeleteMapping("/mocks/{id}/schedule")
	public MockTestAdminDto cancelSchedule(@PathVariable Long id) {
		return adminService.cancelSchedule(id);
	}

	@GetMapping("/mocks/{mockId}/questions")
	public List<QuestionAdminDto> listQuestions(@PathVariable Long mockId) {
		return adminService.listQuestions(mockId);
	}

	@PostMapping("/questions")
	public QuestionAdminDto createQuestion(@Valid @RequestBody QuestionRequest request) {
		return adminService.createQuestion(request);
	}

	@PutMapping("/questions/{id}")
	public QuestionAdminDto updateQuestion(@PathVariable Long id, @Valid @RequestBody QuestionRequest request) {
		return adminService.updateQuestion(id, request);
	}

	@DeleteMapping("/questions/{id}")
	public void deleteQuestion(@PathVariable Long id) {
		adminService.deleteQuestion(id);
	}

	@GetMapping("/mocks/next-code")
	public MockCodePreviewDto previewNextCode(@RequestParam(defaultValue = "IBPS_SO_IT") String examTarget) {
		return adminService.previewNextCode(examTarget);
	}

	@PostMapping("/mocks/import")
	public MockTestAdminDto importMock(@Valid @RequestBody ImportMockRequest request) {
		return adminService.importMock(request);
	}

	/** Base64-wrapped JSON — use when Cloudflare/WAF blocks plain mock import bodies. */
	@PostMapping("/mocks/import-safe")
	public MockTestAdminDto importMockSafe(@Valid @RequestBody ImportEncodedRequest wrapped,
			com.itofficerhub.util.ImportPayloadCodec codec) {
		return adminService.importMock(codec.decodeMock(wrapped.payload()));
	}

	@PostMapping("/practice/import")
	public java.util.Map<String, Object> importPractice(@Valid @RequestBody ImportPracticeRequest request) {
		int count = practiceService.importQuestions(request);
		return java.util.Map.of("imported", count);
	}

	@PostMapping("/practice/import-safe")
	public java.util.Map<String, Object> importPracticeSafe(@Valid @RequestBody ImportEncodedRequest wrapped,
			com.itofficerhub.util.ImportPayloadCodec codec) {
		int count = practiceService.importQuestions(codec.decodePractice(wrapped.payload()));
		return java.util.Map.of("imported", count);
	}

	@GetMapping("/practice/catalog")
	public com.itofficerhub.dto.PracticeCatalogDto practiceCatalog() {
		return practiceService.catalog();
	}

	@GetMapping("/practice/sections/{sectionId}/topics/{subtopicSlug}/questions")
	public List<PracticeQuestionAdminDto> listPracticeQuestions(
			@PathVariable String sectionId, @PathVariable String subtopicSlug) {
		return practiceService.listAdminQuestions(sectionId, subtopicSlug);
	}

	@PostMapping("/practice/questions")
	public PracticeQuestionAdminDto createPracticeQuestion(@Valid @RequestBody PracticeQuestionRequest request) {
		return practiceService.createAdminQuestion(request);
	}

	@PutMapping("/practice/questions/{id}")
	public PracticeQuestionAdminDto updatePracticeQuestion(@PathVariable Long id,
			@Valid @RequestBody PracticeQuestionRequest request) {
		return practiceService.updateAdminQuestion(id, request);
	}

	@DeleteMapping("/practice/questions/{id}")
	public void deletePracticeQuestion(@PathVariable Long id) {
		practiceService.deleteAdminQuestion(id);
	}
}
