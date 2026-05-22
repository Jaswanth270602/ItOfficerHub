package com.itofficerhub.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "revision_bookmarks", uniqueConstraints = {
		@UniqueConstraint(columnNames = { "user_id", "question_id" })
})
public class RevisionBookmark {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "question_id", nullable = false)
	private Question question;

	private Long sourceAttemptId;

	@Column(nullable = false, updatable = false)
	private Instant createdAt = Instant.now();

	public Long getId() { return id; }
	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }
	public Question getQuestion() { return question; }
	public void setQuestion(Question question) { this.question = question; }
	public Long getSourceAttemptId() { return sourceAttemptId; }
	public void setSourceAttemptId(Long sourceAttemptId) { this.sourceAttemptId = sourceAttemptId; }
	public Instant getCreatedAt() { return createdAt; }
}
