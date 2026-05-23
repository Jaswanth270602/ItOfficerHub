package com.itofficerhub.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "practice_questions", uniqueConstraints = @UniqueConstraint(columnNames = { "section_id", "subtopic_slug", "question_number" }))
public class PracticeQuestion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "section_id", nullable = false, length = 64)
	private String sectionId;

	@Column(name = "subtopic_slug", nullable = false, length = 128)
	private String subtopicSlug;

	@Column(name = "question_number", nullable = false)
	private int questionNumber = 1;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 64)
	private Topic topic;

	@Column(name = "question_text", nullable = false, length = 4000)
	private String questionText;

	@Column(name = "option_a", nullable = false, length = 1000)
	private String optionA;

	@Column(name = "option_b", nullable = false, length = 1000)
	private String optionB;

	@Column(name = "option_c", nullable = false, length = 1000)
	private String optionC;

	@Column(name = "option_d", nullable = false, length = 1000)
	private String optionD;

	@Enumerated(EnumType.STRING)
	@Column(name = "correct_option", nullable = false)
	private OptionLabel correctOption;

	@Column(length = 8000)
	private String explanation;

	@Column(name = "solution_image_url", length = 2000)
	private String solutionImageUrl;

	@Column(nullable = false)
	private boolean published = true;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt = Instant.now();

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt = Instant.now();

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getSectionId() { return sectionId; }
	public void setSectionId(String sectionId) { this.sectionId = sectionId; }
	public String getSubtopicSlug() { return subtopicSlug; }
	public void setSubtopicSlug(String subtopicSlug) { this.subtopicSlug = subtopicSlug; }
	public int getQuestionNumber() { return questionNumber; }
	public void setQuestionNumber(int questionNumber) { this.questionNumber = questionNumber; }
	public Topic getTopic() { return topic; }
	public void setTopic(Topic topic) { this.topic = topic; }
	public String getQuestionText() { return questionText; }
	public void setQuestionText(String questionText) { this.questionText = questionText; }
	public String getOptionA() { return optionA; }
	public void setOptionA(String optionA) { this.optionA = optionA; }
	public String getOptionB() { return optionB; }
	public void setOptionB(String optionB) { this.optionB = optionB; }
	public String getOptionC() { return optionC; }
	public void setOptionC(String optionC) { this.optionC = optionC; }
	public String getOptionD() { return optionD; }
	public void setOptionD(String optionD) { this.optionD = optionD; }
	public OptionLabel getCorrectOption() { return correctOption; }
	public void setCorrectOption(OptionLabel correctOption) { this.correctOption = correctOption; }
	public String getExplanation() { return explanation; }
	public void setExplanation(String explanation) { this.explanation = explanation; }
	public String getSolutionImageUrl() { return solutionImageUrl; }
	public void setSolutionImageUrl(String solutionImageUrl) { this.solutionImageUrl = solutionImageUrl; }
	public boolean isPublished() { return published; }
	public void setPublished(boolean published) { this.published = published; }
	public Instant getCreatedAt() { return createdAt; }
	public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
	public Instant getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
