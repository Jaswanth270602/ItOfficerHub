package com.itofficerhub.service;

import com.itofficerhub.entity.Topic;
import com.itofficerhub.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.*;
@Service
public class MockTopicService {

	private static final int CUMULATIVE_MIN_TOPICS = 3;

	private final QuestionRepository questionRepository;

	public MockTopicService(QuestionRepository questionRepository) {
		this.questionRepository = questionRepository;
	}

	public Map<Long, List<String>> topicsByMockId(Collection<Long> mockIds) {
		if (mockIds == null || mockIds.isEmpty()) {
			return Map.of();
		}
		Map<Long, Set<String>> acc = new HashMap<>();
		for (Object[] row : questionRepository.findTopicPairsByMockIds(mockIds)) {
			Long mockId = (Long) row[0];
			Topic topic = (Topic) row[1];
			if (topic != null) {
				acc.computeIfAbsent(mockId, k -> new TreeSet<>()).add(topic.name());
			}
		}
		Map<Long, List<String>> out = new HashMap<>();
		acc.forEach((id, set) -> out.put(id, List.copyOf(set)));
		return out;
	}

	public List<String> topicsForMock(long mockId) {
		return topicsByMockId(List.of(mockId)).getOrDefault(mockId, List.of());
	}

	public boolean isCumulative(List<String> topics) {
		return topics != null && topics.size() >= CUMULATIVE_MIN_TOPICS;
	}

	public boolean matchesFilter(List<String> mockTopics, String filter) {
		if (filter == null || filter.isBlank() || "ALL".equals(filter)) {
			return true;
		}
		if ("CUMULATIVE".equals(filter)) {
			return isCumulative(mockTopics);
		}
		return mockTopics != null && mockTopics.contains(filter);
	}
}
