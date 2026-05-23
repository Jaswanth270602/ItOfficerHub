package com.itofficerhub.dto;

public record ProfileDto(
		Long userId,
		String email,
		String phone,
		String name,
		String displayName,
		String anonymousAlias,
		boolean useAnonymousDisplay,
		String bio,
		String avatarEmoji,
		long mocksAttempted,
		boolean allowDirectMessages,
		boolean showInDirectory
) {}
