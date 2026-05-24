package com.itofficerhub.dto;

import java.util.LinkedHashMap;
import java.util.Map;

/** Compact per-attempt answer payload stored as JSONB on test_attempts. */
public class AttemptAnswersData {

	private Map<String, String> answers = new LinkedHashMap<>();
	private Map<String, Boolean> marked = new LinkedHashMap<>();

	public AttemptAnswersData() {}

	public AttemptAnswersData(Map<String, String> answers, Map<String, Boolean> marked) {
		this.answers = answers != null ? new LinkedHashMap<>(answers) : new LinkedHashMap<>();
		this.marked = marked != null ? new LinkedHashMap<>(marked) : new LinkedHashMap<>();
	}

	public Map<String, String> getAnswers() { return answers; }
	public void setAnswers(Map<String, String> answers) {
		this.answers = answers != null ? answers : new LinkedHashMap<>();
	}

	public Map<String, Boolean> getMarked() { return marked; }
	public void setMarked(Map<String, Boolean> marked) {
		this.marked = marked != null ? marked : new LinkedHashMap<>();
	}
}
