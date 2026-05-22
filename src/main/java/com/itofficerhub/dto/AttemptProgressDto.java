package com.itofficerhub.dto;

import java.util.List;

public record AttemptProgressDto(
		List<AnswerProgressDto> answers
) {
	public record AnswerProgressDto(
			Long questionId,
			String selectedOption,
			boolean markedForReview
	) {}
}
