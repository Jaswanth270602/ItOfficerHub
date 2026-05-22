package com.itofficerhub.dto;

import java.time.Instant;
import java.util.List;

public record ConversationDto(
		Long id,
		String type,
		String name,
		String description,
		String lastMessagePreview,
		Instant lastMessageAt,
		long unreadCount,
		List<MemberSummaryDto> members
) {
	public record MemberSummaryDto(Long userId, String displayName, String avatarEmoji) {}
}
