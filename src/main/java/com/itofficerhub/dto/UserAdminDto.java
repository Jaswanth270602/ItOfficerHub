package com.itofficerhub.dto;

import java.time.Instant;

public record UserAdminDto(
		Long id,
		String email,
		String phone,
		String name,
		String role,
		Instant createdAt,
		int prepPoints
) {}
