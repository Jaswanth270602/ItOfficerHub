package com.itofficerhub.service;

import com.itofficerhub.dto.TopicBreakdownDto;
import com.itofficerhub.dto.TopicTagBreakdownDto;
import com.itofficerhub.dto.AttemptAnswersData;
import com.itofficerhub.entity.*;
import com.itofficerhub.repository.QuestionRepository;
import com.itofficerhub.repository.TestAttemptRepository;
import com.itofficerhub.util.AttemptAnswersJson;
import com.itofficerhub.util.TopicDisplay;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class TopicAnalyticsService {

	private final TestAttemptRepository attemptRepository;
	private final QuestionRepository questionRepository;

	public TopicAnalyticsService(TestAttemptRepository attemptRepository, QuestionRepository questionRepository) {
		this.attemptRepository = attemptRepository;
		this.questionRepository = questionRepository;
	}

	@Transactional(readOnly = true)
	public List<TopicBreakdownDto> breakdownForAttempt(TestAttempt attempt) {
		List<Question> questions = questionRepository.findByMockTestIdOrderByOrderIndexAsc(attempt.getMockTest().getId());
		return aggregateFromAttempt(attempt.getAnswersJson(), questions, attempt.getTotalQuestions());
	}

	@Transactional(readOnly = true)
	public List<TopicBreakdownDto> lifetimeBreakdownForUser(long userId) {
		List<TestAttempt> attempts = attemptRepository.findByUserIdAndSubmittedTrueOrderBySubmittedAtDesc(userId);
		if (attempts.isEmpty()) {
			return List.of();
		}
		Set<Long> mockIds = new HashSet<>();
		for (TestAttempt a : attempts) {
			mockIds.add(a.getMockTest().getId());
		}
		Map<Long, List<Question>> questionsByMock = new HashMap<>();
		for (Long mockId : mockIds) {
			questionsByMock.put(mockId, questionRepository.findByMockTestIdOrderByOrderIndexAsc(mockId));
		}

		Map<String, ChapterAgg> chapters = new LinkedHashMap<>();
		for (TestAttempt attempt : attempts) {
			if (attempt.getAnswersJson() == null) {
				continue;
			}
			List<Question> questions = questionsByMock.getOrDefault(attempt.getMockTest().getId(), List.of());
			mergeAttempt(chapters, attempt.getAnswersJson(), questions, attempt.getTotalQuestions());
		}
		return toBreakdownList(chapters);
	}

	private List<TopicBreakdownDto> aggregateFromAttempt(AttemptAnswersData data, List<Question> questions, int limit) {
		Map<String, ChapterAgg> chapters = new LinkedHashMap<>();
		mergeAttempt(chapters, data, questions, limit);
		return toBreakdownList(chapters);
	}

	private void mergeAttempt(Map<String, ChapterAgg> chapters, AttemptAnswersData data,
			List<Question> questions, int limit) {
		if (data == null) {
			return;
		}
		int idx = 0;
		for (Question q : questions) {
			if (idx >= limit) break;
			Topic topic = q.getTopic();
			String key = topic != null ? topic.name() : "GENERAL";
			ChapterAgg agg = chapters.computeIfAbsent(key, k -> new ChapterAgg());
			OptionLabel selected = AttemptAnswersJson.selectedOption(data, q.getId());
			boolean correct = AttemptAnswersJson.isCorrect(data, q);
			agg.addAnswer(selected, correct);
			String tag = normalizeTag(q.getTopicTag());
			if (tag != null) {
				agg.tagCounts.computeIfAbsent(tag, t -> new int[4]);
				int[] tc = agg.tagCounts.get(tag);
				tc[0]++;
				if (selected == null) {
					tc[3]++;
				} else if (correct) {
					tc[1]++;
				} else {
					tc[2]++;
				}
			}
			idx++;
		}
	}

	private List<TopicBreakdownDto> toBreakdownList(Map<String, ChapterAgg> chapters) {
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

		void addAnswer(OptionLabel selected, boolean correct) {
			chapter[0]++;
			if (selected == null) {
				chapter[3]++;
			} else if (correct) {
				chapter[1]++;
			} else {
				chapter[2]++;
			}
		}
	}
}
