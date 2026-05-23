package com.itofficerhub.controller;

import com.itofficerhub.dto.*;
import com.itofficerhub.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

	private final AdminService adminService;
	private final PracticeService practiceService;

	public AdminController(AdminService adminService, PracticeService practiceService) {
		this.adminService = adminService;
		this.practiceService = practiceService;
	}

	@GetMapping("/dashboard")
	public AdminDashboardDto dashboard() {
		return adminService.dashboard();
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

	@PostMapping("/practice/import")
	public java.util.Map<String, Object> importPractice(@Valid @RequestBody ImportPracticeRequest request) {
		int count = practiceService.importQuestions(request);
		return java.util.Map.of("imported", count);
	}

	@GetMapping("/practice/catalog")
	public com.itofficerhub.dto.PracticeCatalogDto practiceCatalog() {
		return practiceService.catalog();
	}
}
