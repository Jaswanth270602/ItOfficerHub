package com.itofficerhub.service;

import com.itofficerhub.dto.TopicBreakdownDto;
import com.itofficerhub.entity.*;
import com.itofficerhub.repository.AttemptAnswerRepository;
import com.itofficerhub.util.TopicDisplay;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TopicAnalyticsService {

	private final AttemptAnswerRepository answerRepository;

	public TopicAnalyticsService(AttemptAnswerRepository answerRepository) {
		this.answerRepository = answerRepository;
	}

	public List<TopicBreakdownDto> breakdownForAttempt(long attemptId) {
		List<AttemptAnswer> answers = answerRepository.findByAttemptIdOrderByQuestionOrderIndexAsc(attemptId);
		return aggregateFromAnswers(answers);
	}

	public List<TopicBreakdownDto> lifetimeBreakdownForUser(long userId) {
		List<AttemptAnswer> answers = answerRepository.findSubmittedAnswersByUser(userId);
		return aggregateFromAnswers(answers);
	}

	private List<TopicBreakdownDto> aggregateFromAnswers(List<AttemptAnswer> answers) {
		Map<String, int[]> counts = new LinkedHashMap<>();
		for (AttemptAnswer aa : answers) {
			Topic topic = aa.getQuestion().getTopic();
			String key = topic != null ? topic.name() : "GENERAL";
			int[] c = counts.computeIfAbsent(key, k -> new int[4]);
			c[0]++;
			if (aa.getSelectedOption() == null) {
				c[3]++;
			} else if (aa.isCorrect()) {
				c[1]++;
			} else {
				c[2]++;
			}
		}
		List<TopicBreakdownDto> out = new ArrayList<>();
		for (var e : counts.entrySet()) {
			String key = e.getKey();
			int total = e.getValue()[0];
			int correct = e.getValue()[1];
			int wrong = e.getValue()[2];
			int unattempted = e.getValue()[3];
			int attempted = correct + wrong;
			double acc = attempted > 0 ? (correct * 100.0) / attempted : 0;
			Topic topicEnum = parseTopic(key);
			String shortLabel = topicEnum != null ? TopicDisplay.shortLabel(topicEnum) : key;
			String fullLabel = topicEnum != null ? TopicDisplay.fullLabel(topicEnum) : key;
			out.add(new TopicBreakdownDto(key, shortLabel, fullLabel, total, correct, wrong, unattempted,
					Math.round(acc * 10) / 10.0));
		}
		out.sort(Comparator.comparingInt(TopicBreakdownDto::wrong).reversed()
				.thenComparing(TopicBreakdownDto::topic));
		return out;
	}

	private Topic parseTopic(String key) {
		try {
			return Topic.valueOf(key);
		} catch (IllegalArgumentException e) {
			return null;
		}
	}
}
