package com.itofficerhub.dto;

public record StudentDirectoryDto(
		Long userId,
		String displayName,
		String avatarEmoji,
		String bio,
		long mocksAttempted,
		boolean allowDirectMessages,
		boolean blockedByMe,
		boolean blockedMe,
		boolean canMessage
) {}
