package com.itofficerhub.service;

import com.itofficerhub.dto.TopicBreakdownDto;
import com.itofficerhub.dto.TopicTagBreakdownDto;
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
		Map<String, ChapterAgg> chapters = new LinkedHashMap<>();
		for (AttemptAnswer aa : answers) {
			Question q = aa.getQuestion();
			Topic topic = q.getTopic();
			String key = topic != null ? topic.name() : "GENERAL";
			ChapterAgg agg = chapters.computeIfAbsent(key, k -> new ChapterAgg());
			agg.addChapter(aa);
			String tag = normalizeTag(q.getTopicTag());
			if (tag != null) {
				agg.tagCounts.computeIfAbsent(tag, t -> new int[4]);
				int[] tc = agg.tagCounts.get(tag);
				tc[0]++;
				if (aa.getSelectedOption() == null) {
					tc[3]++;
				} else if (aa.isCorrect()) {
					tc[1]++;
				} else {
					tc[2]++;
				}
			}
		}

		List<TopicBreakdownDto> out = new ArrayList<>();
		for (var e : chapters.entrySet()) {
			String key = e.getKey();
			ChapterAgg agg = e.getValue();
			int total = agg.chapter[0];
			int correct = agg.chapter[1];
			int wrong = agg.chapter[2];
			int unattempted = agg.chapter[3];
			int attempted = correct + wrong;
			double acc = attempted > 0 ? (correct * 100.0) / attempted : 0;
			Topic topicEnum = parseTopic(key);
			String shortLabel = topicEnum != null ? TopicDisplay.shortLabel(topicEnum) : key;
			String fullLabel = topicEnum != null ? TopicDisplay.fullLabel(topicEnum) : key;
			List<TopicTagBreakdownDto> tags = buildTags(agg.tagCounts);
			out.add(new TopicBreakdownDto(key, shortLabel, fullLabel, total, correct, wrong, unattempted,
					Math.round(acc * 10) / 10.0, tags));
		}
		out.sort(Comparator.comparingInt(TopicBreakdownDto::wrong).reversed()
				.thenComparing(TopicBreakdownDto::topic));
		return out;
	}

	private List<TopicTagBreakdownDto> buildTags(Map<String, int[]> tagCounts) {
		List<TopicTagBreakdownDto> tags = new ArrayList<>();
		for (var e : tagCounts.entrySet()) {
			int total = e.getValue()[0];
			int correct = e.getValue()[1];
			int wrong = e.getValue()[2];
			int unattempted = e.getValue()[3];
			int attempted = correct + wrong;
			double acc = attempted > 0 ? (correct * 100.0) / attempted : 0;
			tags.add(new TopicTagBreakdownDto(e.getKey(), total, correct, wrong, unattempted,
					Math.round(acc * 10) / 10.0));
		}
		tags.sort(Comparator.comparingInt(TopicTagBreakdownDto::wrong).reversed()
				.thenComparing(TopicTagBreakdownDto::tag));
		return tags;
	}

	private String normalizeTag(String raw) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		return raw.trim();
	}

	private Topic parseTopic(String key) {
		try {
			return Topic.valueOf(key);
		} catch (IllegalArgumentException e) {
			return null;
		}
	}

	private static final class ChapterAgg {
		private final int[] chapter = new int[4];
		private final Map<String, int[]> tagCounts = new LinkedHashMap<>();

		void addChapter(AttemptAnswer aa) {
			chapter[0]++;
			if (aa.getSelectedOption() == null) {
				chapter[3]++;
			} else if (aa.isCorrect()) {
				chapter[1]++;
			} else {
				chapter[2]++;
			}
		}
	}
}
