package com.itofficerhub.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record AttemptCheckpointRequest(
		@Valid List<CheckpointAnswer> answers
) {
	public record CheckpointAnswer(
			@NotNull Long questionId,
			String selectedOption,
			Boolean markedForReview
	) {}
}
