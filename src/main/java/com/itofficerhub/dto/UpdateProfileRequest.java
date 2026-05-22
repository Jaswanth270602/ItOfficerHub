package com.itofficerhub.dto;

public record UpdateProfileRequest(
		String anonymousAlias,
		Boolean useAnonymousDisplay,
		String bio,
		String avatarEmoji,
		Boolean allowDirectMessages,
		Boolean showInDirectory
) {}
