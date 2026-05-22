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

	public AdminController(AdminService adminService) {
		this.adminService = adminService;
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

	@PostMapping("/mocks/import")
	public MockTestAdminDto importMock(@Valid @RequestBody ImportMockRequest request) {
		return adminService.importMock(request);
	}
}
