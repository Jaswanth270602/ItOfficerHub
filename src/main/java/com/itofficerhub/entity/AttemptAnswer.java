package com.itofficerhub.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "attempt_answers")
public class AttemptAnswer {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "attempt_id", nullable = false)
	private TestAttempt attempt;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "question_id", nullable = false)
	private Question question;

	@Enumerated(EnumType.STRING)
	private OptionLabel selectedOption;

	@Column(nullable = false)
	private boolean correct;

	@Column(nullable = false)
	private boolean markedForReview = false;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public TestAttempt getAttempt() { return attempt; }
	public void setAttempt(TestAttempt attempt) { this.attempt = attempt; }
	public Question getQuestion() { return question; }
	public void setQuestion(Question question) { this.question = question; }
	public OptionLabel getSelectedOption() { return selectedOption; }
	public void setSelectedOption(OptionLabel selectedOption) { this.selectedOption = selectedOption; }
	public boolean isCorrect() { return correct; }
	public void setCorrect(boolean correct) { this.correct = correct; }
	public boolean isMarkedForReview() { return markedForReview; }
	public void setMarkedForReview(boolean markedForReview) { this.markedForReview = markedForReview; }
}
