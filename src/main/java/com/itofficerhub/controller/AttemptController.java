package com.itofficerhub.controller;

import com.itofficerhub.dto.*;
import com.itofficerhub.service.AttemptService;
import com.itofficerhub.service.RevisionService;
import com.itofficerhub.service.UserPrepStatsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/attempts")
public class AttemptController {

	private final AttemptService attemptService;
	private final UserPrepStatsService userPrepStatsService;
	private final RevisionService revisionService;

	public AttemptController(AttemptService attemptService, UserPrepStatsService userPrepStatsService,
			RevisionService revisionService) {
		this.attemptService = attemptService;
		this.userPrepStatsService = userPrepStatsService;
		this.revisionService = revisionService;
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

	@PostMapping("/{id}/checkpoint")
	public void checkpoint(@PathVariable Long id, @Valid @RequestBody AttemptCheckpointRequest request) {
		attemptService.saveCheckpoint(id, request);
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

	@GetMapping("/me/stats")
	public UserPrepStatsDto myStats() {
		return userPrepStatsService.statsForCurrentUser();
	}

	@GetMapping("/revision")
	public List<RevisionItemDto> revisionList() {
		return revisionService.listForCurrentUser();
	}

	@org.springframework.web.bind.annotation.PostMapping("/revision/{questionId}")
	public void addRevision(@org.springframework.web.bind.annotation.PathVariable Long questionId,
			@org.springframework.web.bind.annotation.RequestParam(required = false) Long attemptId) {
		revisionService.addForCurrentUser(questionId, attemptId);
	}

	@org.springframework.web.bind.annotation.DeleteMapping("/revision/{questionId}")
	public void removeRevision(@org.springframework.web.bind.annotation.PathVariable Long questionId) {
		revisionService.removeForCurrentUser(questionId);
	}
}
