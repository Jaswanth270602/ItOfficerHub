package com.itofficerhub.service;

import com.itofficerhub.dto.*;
import com.itofficerhub.entity.OptionLabel;
import com.itofficerhub.entity.PracticeQuestion;
import com.itofficerhub.entity.Topic;
import com.itofficerhub.exception.ApiException;
import com.itofficerhub.repository.PracticeQuestionRepository;
import com.itofficerhub.util.PracticeCatalog;
import com.itofficerhub.util.TopicDisplay;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

@Service
public class PracticeService {

	public static final int TARGET_QUESTIONS_PER_SUBTOPIC = 50;

	private final PracticeQuestionRepository repository;

	public PracticeService(PracticeQuestionRepository repository) {
		this.repository = repository;
	}

	private Map<String, Long> publishedCountMap() {
		Map<String, Long> map = new HashMap<>();
		for (var row : repository.countPublishedBySubtopic()) {
			map.put(row.getSectionId() + "/" + row.getSubtopicSlug(), row.getCnt());
		}
		return map;
	}

	public PracticeCatalogDto catalog() {
		Map<String, Long> counts = publishedCountMap();
		long totalMcqs = 0;
		var sections = PracticeCatalog.SECTIONS.stream().map(sec -> {
			var subs = sec.subtopics().stream().map(st -> {
				long cnt = counts.getOrDefault(sec.id() + "/" + st.slug(), 0L);
				return new PracticeSubtopicDto(st.slug(), st.title(), (int) cnt);
			}).toList();
			int subAvail = (int) subs.stream().filter(s -> s.questionCount() > 0).count();
			return new PracticeSectionDto(
					sec.id(),
					sec.title(),
					sec.topic().name(),
					TopicDisplay.fullLabel(sec.topic()),
					sec.description(),
					subs.size(),
					subAvail,
					subs);
		}).toList();
		int totalSlots = 0;
		int filledSlots = 0;
		for (var s : sections) {
			totalSlots += s.subtopicCount();
			filledSlots += s.availableCount();
			for (var st : s.subtopics()) {
				totalMcqs += st.questionCount();
			}
		}
		return new PracticeCatalogDto(sections, totalSlots, (int) totalMcqs, filledSlots);
	}

	public PracticeSectionDto section(String sectionId) {
		var sec = PracticeCatalog.section(sectionId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Section not found"));
		Map<String, Long> counts = publishedCountMap();
		var subs = sec.subtopics().stream()
				.map(st -> new PracticeSubtopicDto(
						st.slug(),
						st.title(),
						(int) counts.getOrDefault(sectionId + "/" + st.slug(), 0L).longValue()))
				.toList();
		int subAvail = (int) subs.stream().filter(s -> s.questionCount() > 0).count();
		return new PracticeSectionDto(
				sec.id(),
				sec.title(),
				sec.topic().name(),
				TopicDisplay.fullLabel(sec.topic()),
				sec.description(),
				subs.size(),
				subAvail,
				subs);
	}

	public List<PracticeQuestionSummaryDto> listQuestions(String sectionId, String subtopicSlug) {
		PracticeCatalog.subtopic(sectionId, subtopicSlug)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Subtopic not found"));
		return repository.findBySectionIdAndSubtopicSlugAndPublishedTrueOrderByQuestionNumberAsc(sectionId, subtopicSlug)
				.stream()
				.map(p -> new PracticeQuestionSummaryDto(p.getQuestionNumber(), p.getId()))
				.toList();
	}

	public PracticeQuestionDto getQuestion(String sectionId, String subtopicSlug) {
		return getQuestionByNumber(sectionId, subtopicSlug, 1);
	}

	public PracticeQuestionDto getQuestionByNumber(String sectionId, String subtopicSlug, int questionNumber) {
		PracticeCatalog.subtopic(sectionId, subtopicSlug)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Subtopic not found"));
		var pq = repository.findBySectionIdAndSubtopicSlugAndQuestionNumberAndPublishedTrue(
						sectionId, subtopicSlug, questionNumber)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Practice question not found"));
		return toDto(pq, false);
	}

	public record PracticeRevealDto(String correctOption, String explanation, String solutionImageUrl) {}

	public PracticeRevealDto revealAnswer(String sectionId, String subtopicSlug) {
		return revealAnswerByNumber(sectionId, subtopicSlug, 1);
	}

	public PracticeRevealDto revealAnswerByNumber(String sectionId, String subtopicSlug, int questionNumber) {
		var pq = repository.findBySectionIdAndSubtopicSlugAndQuestionNumberAndPublishedTrue(
						sectionId, subtopicSlug, questionNumber)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found"));
		return new PracticeRevealDto(
				pq.getCorrectOption().name().substring(0, 1),
				pq.getExplanation(),
				pq.getSolutionImageUrl());
	}

	@Transactional
	public int importQuestions(ImportPracticeRequest request) {
		Map<String, List<Integer>> batchIndices = new HashMap<>();
		for (int i = 0; i < request.questions().size(); i++) {
			ImportPracticeItem item = request.questions().get(i);
			String slotKey = item.sectionId() + "/" + item.subtopicSlug();
			batchIndices.computeIfAbsent(slotKey, k -> new ArrayList<>()).add(i);
		}

		Map<String, Integer> numberOffsets = new HashMap<>();
		for (var entry : batchIndices.entrySet()) {
			String slotKey = entry.getKey();
			String[] parts = slotKey.split("/", 2);
			String sectionId = parts[0];
			String subtopicSlug = parts[1];
			int maxExisting = repository.findMaxQuestionNumber(sectionId, subtopicSlug);
			if (maxExisting > 0 && isContiguousFromOne(request.questions(), entry.getValue())) {
				numberOffsets.put(slotKey, maxExisting);
			}
		}

		int n = 0;
		Map<String, Integer> autoNum = new HashMap<>();
		for (int i = 0; i < request.questions().size(); i++) {
			ImportPracticeItem item = request.questions().get(i);
			final int qNum = i + 1;
			validateItem(item, qNum);
			var sec = PracticeCatalog.section(item.sectionId())
					.orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
							"Question " + qNum + ": unknown sectionId " + item.sectionId()));
			PracticeCatalog.subtopic(item.sectionId(), item.subtopicSlug())
					.orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
							"Question " + qNum + ": unknown subtopicSlug " + item.subtopicSlug()));

			Topic topic = sec.topic();
			if (item.topic() != null && !item.topic().isBlank()) {
				try {
					topic = Topic.valueOf(item.topic().trim().toUpperCase());
				} catch (IllegalArgumentException e) {
					throw new ApiException(HttpStatus.BAD_REQUEST, "Question " + qNum + ": invalid topic");
				}
			}

			OptionLabel correct;
			try {
				correct = OptionLabel.valueOf(item.correctOption().trim().toUpperCase());
			} catch (IllegalArgumentException e) {
				throw new ApiException(HttpStatus.BAD_REQUEST, "Question " + qNum + ": correctOption must be A–D");
			}

			String slotKey = item.sectionId() + "/" + item.subtopicSlug();
			int baseNumber = item.questionNumber() != null && item.questionNumber() > 0
					? item.questionNumber()
					: autoNum.merge(slotKey, 1, Integer::sum);
			int offset = numberOffsets.getOrDefault(slotKey, 0);
			int questionNumber = baseNumber + offset;

			long existingCount = repository.countBySectionIdAndSubtopicSlug(item.sectionId(), item.subtopicSlug());
			var existing = repository.findBySectionIdAndSubtopicSlugAndQuestionNumber(
					item.sectionId(), item.subtopicSlug(), questionNumber);
			if (existing.isEmpty() && existingCount >= TARGET_QUESTIONS_PER_SUBTOPIC) {
				throw new ApiException(HttpStatus.BAD_REQUEST,
						"Subtopic " + item.subtopicSlug() + " already has "
								+ TARGET_QUESTIONS_PER_SUBTOPIC + " questions");
			}
			if (questionNumber > TARGET_QUESTIONS_PER_SUBTOPIC) {
				throw new ApiException(HttpStatus.BAD_REQUEST,
						"Question " + qNum + ": questionNumber " + questionNumber
								+ " exceeds max " + TARGET_QUESTIONS_PER_SUBTOPIC + " per subtopic");
			}

			PracticeQuestion pq = existing.orElseGet(PracticeQuestion::new);
			pq.setSectionId(item.sectionId());
			pq.setSubtopicSlug(item.subtopicSlug());
			pq.setQuestionNumber(questionNumber);
			pq.setTopic(topic);
			pq.setQuestionText(item.questionText().trim());
			pq.setOptionA(item.optionA().trim());
			pq.setOptionB(item.optionB().trim());
			pq.setOptionC(item.optionC().trim());
			pq.setOptionD(item.optionD().trim());
			pq.setCorrectOption(correct);
			pq.setExplanation(item.explanation().trim());
			pq.setSolutionImageUrl(item.solutionImageUrl());
			pq.setPublished(item.published() == null || item.published());
			repository.save(pq);
			n++;
		}
		return n;
	}

	private boolean isContiguousFromOne(List<ImportPracticeItem> items, List<Integer> indices) {
		List<Integer> numbers = new ArrayList<>();
		for (int i = 0; i < indices.size(); i++) {
			ImportPracticeItem item = items.get(indices.get(i));
			numbers.add(item.questionNumber() != null && item.questionNumber() > 0
					? item.questionNumber()
					: i + 1);
		}
		numbers.sort(Integer::compareTo);
		return IntStream.range(0, numbers.size()).allMatch(i -> numbers.get(i) == i + 1);
	}

	private void validateItem(ImportPracticeItem item, int index) {
		String label = "Question " + index;
		String exp = item.explanation();
		if (exp == null || exp.length() < 300) {
			throw new ApiException(HttpStatus.BAD_REQUEST, label + ": explanation must be at least 300 characters");
		}
		if (!exp.toLowerCase().contains("option breakdown")) {
			throw new ApiException(HttpStatus.BAD_REQUEST,
					label + ": explanation must include \"Option breakdown:\" with all 4 options");
		}
		String upper = exp.toUpperCase();
		if (!upper.contains("OPTION A") || !upper.contains("OPTION B")
				|| !upper.contains("OPTION C") || !upper.contains("OPTION D")) {
			throw new ApiException(HttpStatus.BAD_REQUEST,
					label + ": explain Option A, B, C, and D individually");
		}
	}

	private PracticeQuestionDto toDto(PracticeQuestion pq, boolean includeAnswer) {
		var sec = PracticeCatalog.section(pq.getSectionId()).orElseThrow();
		var sub = PracticeCatalog.subtopic(pq.getSectionId(), pq.getSubtopicSlug()).orElseThrow();
		int total = (int) repository.countBySectionIdAndSubtopicSlugAndPublishedTrue(
				pq.getSectionId(), pq.getSubtopicSlug());
		return new PracticeQuestionDto(
				pq.getId(),
				pq.getSectionId(),
				sec.title(),
				pq.getSubtopicSlug(),
				sub.title(),
				pq.getTopic().name(),
				pq.getQuestionNumber(),
				total,
				pq.getQuestionText(),
				pq.getOptionA(),
				pq.getOptionB(),
				pq.getOptionC(),
				pq.getOptionD(),
				includeAnswer ? pq.getExplanation() : null,
				includeAnswer ? pq.getSolutionImageUrl() : null);
	}
}
