package com.itofficerhub.util;

import com.itofficerhub.dto.AttemptAnswersData;
import com.itofficerhub.dto.AttemptCheckpointRequest;
import com.itofficerhub.dto.SubmitAttemptRequest;
import com.itofficerhub.entity.OptionLabel;
import com.itofficerhub.entity.Question;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class AttemptAnswersJson {

	private AttemptAnswersJson() {}

	public static AttemptAnswersData empty() {
		return new AttemptAnswersData();
	}

	public static AttemptAnswersData fromSubmit(List<SubmitAttemptRequest.AnswerSubmission> submissions) {
		AttemptAnswersData data = empty();
		if (submissions == null) {
			return data;
		}
		for (var sub : submissions) {
			if (sub.questionId() == null) {
				continue;
			}
			String key = String.valueOf(sub.questionId());
			if (sub.selectedOption() != null && !sub.selectedOption().isBlank()) {
				data.getAnswers().put(key, sub.selectedOption().trim().toUpperCase());
			}
		}
		return data;
	}

	public static AttemptAnswersData fromCheckpoint(List<AttemptCheckpointRequest.CheckpointAnswer> items) {
		AttemptAnswersData data = empty();
		if (items == null) {
			return data;
		}
		for (var item : items) {
			if (item.questionId() == null) {
				continue;
			}
			String key = String.valueOf(item.questionId());
			if (item.selectedOption() != null && !item.selectedOption().isBlank()) {
				data.getAnswers().put(key, item.selectedOption().trim().toUpperCase());
			} else if (item.selectedOption() != null) {
				data.getAnswers().remove(key);
			}
			if (item.markedForReview() != null) {
				if (item.markedForReview()) {
					data.getMarked().put(key, true);
				} else {
					data.getMarked().remove(key);
				}
			}
		}
		return data;
	}

	public static AttemptAnswersData merge(AttemptAnswersData base, AttemptAnswersData patch) {
		AttemptAnswersData out = new AttemptAnswersData(
				base != null ? new LinkedHashMap<>(base.getAnswers()) : new LinkedHashMap<>(),
				base != null ? new LinkedHashMap<>(base.getMarked()) : new LinkedHashMap<>());
		if (patch == null) {
			return out;
		}
		out.getAnswers().putAll(patch.getAnswers());
		for (var e : patch.getMarked().entrySet()) {
			if (Boolean.TRUE.equals(e.getValue())) {
				out.getMarked().put(e.getKey(), true);
			} else {
				out.getMarked().remove(e.getKey());
			}
		}
		return out;
	}

	public static OptionLabel selectedOption(AttemptAnswersData data, long questionId) {
		if (data == null || data.getAnswers() == null) {
			return null;
		}
		String raw = data.getAnswers().get(String.valueOf(questionId));
		if (raw == null || raw.isBlank()) {
			return null;
		}
		try {
			return OptionLabel.valueOf(raw.trim().toUpperCase());
		} catch (IllegalArgumentException e) {
			return null;
		}
	}

	public static boolean markedForReview(AttemptAnswersData data, long questionId) {
		if (data == null || data.getMarked() == null) {
			return false;
		}
		return Boolean.TRUE.equals(data.getMarked().get(String.valueOf(questionId)));
	}

	public static boolean isCorrect(AttemptAnswersData data, Question question) {
		OptionLabel selected = selectedOption(data, question.getId());
		return selected != null && selected == question.getCorrectOption();
	}

	public static Map<Long, OptionLabel> answerMap(AttemptAnswersData data) {
		Map<Long, OptionLabel> map = new LinkedHashMap<>();
		if (data == null || data.getAnswers() == null) {
			return map;
		}
		for (var e : data.getAnswers().entrySet()) {
			try {
				long qid = Long.parseLong(e.getKey());
				OptionLabel opt = selectedOption(data, qid);
				if (opt != null) {
					map.put(qid, opt);
				}
			} catch (NumberFormatException ignored) {
				/* skip malformed keys */
			}
		}
		return map;
	}
}
