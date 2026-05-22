package com.itofficerhub.controller;

import com.itofficerhub.dto.*;
import com.itofficerhub.service.AttemptService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/attempts")
public class AttemptController {

	private final AttemptService attemptService;

	public AttemptController(AttemptService attemptService) {
		this.attemptService = attemptService;
	}

	@PostMapping("/start")
	public StartAttemptResponse start(@Valid @RequestBody StartAttemptRequest request) {
		return attemptService.startAttempt(request);
	}

	@GetMapping("/{id}/progress")
	public AttemptProgressDto progress(@PathVariable Long id) {
		return attemptService.getProgress(id);
	}

	@PostMapping("/{id}/answers")
	public void saveAnswer(@PathVariable Long id, @Valid @RequestBody SaveAnswerRequest request) {
		attemptService.saveAnswer(id, request);
	}

	@PostMapping("/{id}/submit")
	public AttemptResultDto submit(@PathVariable Long id, @Valid @RequestBody SubmitAttemptRequest request) {
		return attemptService.submit(id, request);
	}

	@GetMapping("/{id}/result")
	public AttemptResultDto result(@PathVariable Long id) {
		return attemptService.getResult(id);
	}

	@GetMapping("/my-mocks")
	public List<MockWithUserStatusDto> myMocks() {
		return attemptService.getMocksWithUserStatus();
	}

	@GetMapping("/history")
	public List<AttemptHistoryItemDto> history() {
		return attemptService.getUserHistory();
	}
}
