package com.itofficerhub.controller;

import com.itofficerhub.dto.*;
import com.itofficerhub.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/register")
	public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
		return authService.register(request);
	}

	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody AuthRequest request) {
		return authService.login(request);
	}

	@PostMapping("/admin/login")
	public AuthResponse adminLogin(@Valid @RequestBody AuthRequest request) {
		return authService.adminLogin(request);
	}

	@PostMapping("/change-password")
	public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
		authService.changePassword(request);
	}

}
