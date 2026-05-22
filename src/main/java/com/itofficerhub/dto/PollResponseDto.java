package com.itofficerhub.dto;

import java.time.Instant;
import java.util.List;

public record PollResponseDto(
		Instant serverTime,
		long totalUnread,
		List<ChatMessageDto> newMessages,
		List<ConversationDto> inboxUpdates
) {}
