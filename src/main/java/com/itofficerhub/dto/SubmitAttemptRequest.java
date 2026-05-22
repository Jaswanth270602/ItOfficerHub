package com.itofficerhub.dto;

import java.util.List;

public record SubmitAttemptRequest(
		int timeTakenSeconds,
		List<AnswerSubmission> answers
) {
	public record AnswerSubmission(Long questionId, String selectedOption) {}
}
