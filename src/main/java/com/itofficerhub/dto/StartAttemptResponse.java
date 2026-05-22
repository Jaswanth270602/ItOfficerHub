package com.itofficerhub.dto;

import java.util.List;

public record StartAttemptResponse(
		Long attemptId,
		String guestToken,
		Long mockTestId,
		String mockTitle,
		int timeLimitMinutes,
		List<QuestionDto> questions,
		double marksPerCorrect,
		double negativePerWrong
) {}
