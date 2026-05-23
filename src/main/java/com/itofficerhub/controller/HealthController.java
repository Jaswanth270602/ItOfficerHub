package com.itofficerhub.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Lightweight liveness probe for Render and UptimeRobot — no database or business logic.
 */
@RestController
public class HealthController {

	@GetMapping("/health")
	public ResponseEntity<String> health() {
		return ResponseEntity.ok("UP");
	}
}
