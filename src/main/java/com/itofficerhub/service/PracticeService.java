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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class PracticeService {

	private final PracticeQuestionRepository repository;

	public PracticeService(PracticeQuestionRepository repository) {
		this.repository = repository;
	}

	public PracticeCatalogDto catalog() {
		Set<String> available = new HashSet<>();
		for (var key : repository.findPublishedKeys()) {
			available.add(key.getSectionId() + "/" + key.getSubtopicSlug());
		}
		int total = 0;
		int avail = 0;
		var sections = PracticeCatalog.SECTIONS.stream().map(sec -> {
			var subs = sec.subtopics().stream().map(st -> {
				boolean has = available.contains(sec.id() + "/" + st.slug());
				return new PracticeSubtopicDto(st.slug(), st.title(), has);
			}).toList();
			int subAvail = (int) subs.stream().filter(PracticeSubtopicDto::hasQuestion).count();
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
		for (var s : sections) {
			total += s.subtopicCount();
			avail += s.availableCount();
		}
		return new PracticeCatalogDto(sections, total, avail);
	}

	public PracticeSectionDto section(String sectionId) {
		var sec = PracticeCatalog.section(sectionId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Section not found"));
		Set<String> available = new HashSet<>();
		repository.findPublishedKeys().stream()
				.filter(k -> k.getSectionId().equals(sectionId))
				.forEach(k -> available.add(k.getSubtopicSlug()));
		var subs = sec.subtopics().stream()
				.map(st -> new PracticeSubtopicDto(st.slug(), st.title(), available.contains(st.slug())))
				.toList();
		int subAvail = (int) subs.stream().filter(PracticeSubtopicDto::hasQuestion).count();
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

	public PracticeQuestionDto getQuestion(String sectionId, String subtopicSlug) {
		PracticeCatalog.subtopic(sectionId, subtopicSlug)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Subtopic not found"));
		var pq = repository.findBySectionIdAndSubtopicSlugAndPublishedTrue(sectionId, subtopicSlug)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No practice question for this topic yet"));
		return toDto(pq, false);
	}

	public record PracticeRevealDto(String correctOption, String explanation, String solutionImageUrl) {}

	public PracticeRevealDto revealAnswer(String sectionId, String subtopicSlug) {
		var pq = repository.findBySectionIdAndSubtopicSlugAndPublishedTrue(sectionId, subtopicSlug)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found"));
		return new PracticeRevealDto(
				pq.getCorrectOption().name().substring(0, 1),
				pq.getExplanation(),
				pq.getSolutionImageUrl());
	}

	@Transactional
	public int importQuestions(ImportPracticeRequest request) {
		int n = 0;
		for (int i = 0; i < request.questions().size(); i++) {
			ImportPracticeItem item = request.questions().get(i);
			validateItem(item, i + 1);
			var sec = PracticeCatalog.section(item.sectionId())
					.orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
							"Question " + (i + 1) + ": unknown sectionId " + item.sectionId()));
			PracticeCatalog.subtopic(item.sectionId(), item.subtopicSlug())
					.orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
							"Question " + (i + 1) + ": unknown subtopicSlug " + item.subtopicSlug()));

			Topic topic = sec.topic();
			if (item.topic() != null && !item.topic().isBlank()) {
				try {
					topic = Topic.valueOf(item.topic().trim().toUpperCase());
				} catch (IllegalArgumentException e) {
					throw new ApiException(HttpStatus.BAD_REQUEST, "Question " + (i + 1) + ": invalid topic");
				}
			}

			OptionLabel correct;
			try {
				correct = OptionLabel.valueOf(item.correctOption().trim().toUpperCase());
			} catch (IllegalArgumentException e) {
				throw new ApiException(HttpStatus.BAD_REQUEST, "Question " + (i + 1) + ": correctOption must be A–D");
			}

			var existing = repository.findBySectionIdAndSubtopicSlug(item.sectionId(), item.subtopicSlug());
			PracticeQuestion pq = existing.orElseGet(PracticeQuestion::new);
			pq.setSectionId(item.sectionId());
			pq.setSubtopicSlug(item.subtopicSlug());
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

	private void validateItem(ImportPracticeItem item, int index) {
		String label = "Question " + index;
		if (item.explanation() == null || item.explanation().length() < 80) {
			throw new ApiException(HttpStatus.BAD_REQUEST, label + ": explanation must be at least 80 characters");
		}
		long bullets = item.explanation().lines().filter(l -> l.trim().startsWith("•") || l.trim().startsWith("-")).count();
		if (bullets < 2) {
			throw new ApiException(HttpStatus.BAD_REQUEST, label + ": include at least 2 bullet lines (• or -)");
		}
	}

	private PracticeQuestionDto toDto(PracticeQuestion pq, boolean includeAnswer) {
		var sec = PracticeCatalog.section(pq.getSectionId()).orElseThrow();
		var sub = PracticeCatalog.subtopic(pq.getSectionId(), pq.getSubtopicSlug()).orElseThrow();
		return new PracticeQuestionDto(
				pq.getId(),
				pq.getSectionId(),
				sec.title(),
				pq.getSubtopicSlug(),
				sub.title(),
				pq.getTopic().name(),
				pq.getQuestionText(),
				pq.getOptionA(),
				pq.getOptionB(),
				pq.getOptionC(),
				pq.getOptionD(),
				includeAnswer ? pq.getExplanation() : null,
				includeAnswer ? pq.getSolutionImageUrl() : null);
	}
}
