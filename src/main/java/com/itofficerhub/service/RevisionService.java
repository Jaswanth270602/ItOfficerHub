package com.itofficerhub.service;

import com.itofficerhub.dto.RevisionItemDto;
import com.itofficerhub.entity.RevisionBookmark;
import com.itofficerhub.entity.User;
import com.itofficerhub.exception.ApiException;
import com.itofficerhub.repository.QuestionRepository;
import com.itofficerhub.repository.RevisionBookmarkRepository;
import com.itofficerhub.repository.UserRepository;
import com.itofficerhub.security.UserPrincipal;
import com.itofficerhub.util.TopicDisplay;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RevisionService {

	private final RevisionBookmarkRepository bookmarkRepository;
	private final QuestionRepository questionRepository;
	private final UserRepository userRepository;

	public RevisionService(RevisionBookmarkRepository bookmarkRepository, QuestionRepository questionRepository,
			UserRepository userRepository) {
		this.bookmarkRepository = bookmarkRepository;
		this.questionRepository = questionRepository;
		this.userRepository = userRepository;
	}

	@Transactional(readOnly = true)
	public List<RevisionItemDto> listForCurrentUser() {
		return listForUser(currentUserId());
	}

	@Transactional
	public void addForCurrentUser(long questionId, Long sourceAttemptId) {
		add(currentUserId(), questionId, sourceAttemptId);
	}

	@Transactional
	public void removeForCurrentUser(long questionId) {
		remove(currentUserId(), questionId);
	}

	@Transactional(readOnly = true)
	public List<RevisionItemDto> listForUser(long userId) {
		return bookmarkRepository.findByUserIdWithQuestion(userId).stream()
				.map(this::toDto)
				.toList();
	}

	@Transactional
	public void add(long userId, long questionId, Long sourceAttemptId) {
		if (bookmarkRepository.existsByUserIdAndQuestionId(userId, questionId)) {
			return;
		}
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
		var question = questionRepository.findById(questionId)
				.orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question not found"));
		RevisionBookmark rb = new RevisionBookmark();
		rb.setUser(user);
		rb.setQuestion(question);
		rb.setSourceAttemptId(sourceAttemptId);
		bookmarkRepository.save(rb);
	}

	@Transactional
	public void remove(long userId, long questionId) {
		bookmarkRepository.deleteByUserIdAndQuestionId(userId, questionId);
	}

	@Transactional(readOnly = true)
	public boolean isBookmarked(long userId, long questionId) {
		return bookmarkRepository.existsByUserIdAndQuestionId(userId, questionId);
	}

	private RevisionItemDto toDto(RevisionBookmark rb) {
		var q = rb.getQuestion();
		var m = q.getMockTest();
		String topic = q.getTopic() != null ? q.getTopic().name() : null;
		String shortLabel = q.getTopic() != null ? TopicDisplay.shortLabel(q.getTopic()) : null;
		return new RevisionItemDto(
				q.getId(),
				m.getId(),
				m.getTitle(),
				q.getOrderIndex(),
				q.getQuestionText(),
				topic,
				shortLabel,
				q.getCorrectOption().name(),
				q.getExplanation(),
				q.getSolutionImageUrl(),
				rb.getSourceAttemptId());
	}

	private long currentUserId() {
		var auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.getPrincipal() instanceof UserPrincipal p) {
			return p.getId();
		}
		throw new ApiException(HttpStatus.UNAUTHORIZED, "Login required");
	}
}
