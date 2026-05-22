package com.itofficerhub.dto;

import java.time.Instant;

public record ChatMessageDto(
		Long id,
		Long conversationId,
		Long senderId,
		String senderDisplayName,
		String senderAvatarEmoji,
		String messageType,
		String body,
		ScoreCardDto scoreCard,
		Instant createdAt
) {}
