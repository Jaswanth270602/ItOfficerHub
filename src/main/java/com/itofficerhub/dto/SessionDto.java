package com.itofficerhub.dto;

/** Current user from database (role always fresh — use to sync admin UI). */
public record SessionDto(Long userId, String email, String name, String role) {}
