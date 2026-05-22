package com.itofficerhub.controller;

import com.itofficerhub.dto.MockTestSummaryDto;
import com.itofficerhub.dto.PublicStatsDto;
import com.itofficerhub.service.PublicService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {

	private final PublicService publicService;

	public PublicController(PublicService publicService) {
		this.publicService = publicService;
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
	public List<String> topics() {
		return publicService.listTopics();
	}
}
