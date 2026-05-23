package com.itofficerhub.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "mock_tests")
public class MockTest {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String title;

	@Column(length = 2000)
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Difficulty difficulty = Difficulty.MEDIUM;

	@Column(nullable = false)
	private int questionCount = 20;

	@Column(nullable = false)
	private int timeLimitMinutes = 15;

	@Column(nullable = false)
	private boolean published = false;

	/** Set when admin publishes — used for “mock of the day” and release date badge */
	private Instant publishedAt;

	@Column(nullable = false)
	private boolean allowRetake = true;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private MockCategory mockCategory = MockCategory.FULL;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ExamTarget examTarget = ExamTarget.IBPS_SO_IT;

	/** Day 1–30 for CHALLENGE series mocks; null otherwise */
	private Integer seriesDay;

	/** Display ID e.g. IBPS-001, TCS-003 — unique, category-prefixed */
	@Column(unique = true, length = 32)
	private String mockCode;

	/** Minimum net score to clear mock (IBPS-style qualifying bar) */
	@Column(nullable = false)
	private double cutoffMarks = 10.0;

	@Column(nullable = false, updatable = false)
	private Instant createdAt = Instant.now();

	private Instant updatedAt = Instant.now();

	@PreUpdate
	void onUpdate() { this.updatedAt = Instant.now(); }

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
	public Difficulty getDifficulty() { return difficulty; }
	public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
	public int getQuestionCount() { return questionCount; }
	public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }
	public int getTimeLimitMinutes() { return timeLimitMinutes; }
	public void setTimeLimitMinutes(int timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }
	public boolean isPublished() { return published; }
	public void setPublished(boolean published) { this.published = published; }
	public Instant getPublishedAt() { return publishedAt; }
	public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
	public boolean isAllowRetake() { return allowRetake; }
	public void setAllowRetake(boolean allowRetake) { this.allowRetake = allowRetake; }
	public MockCategory getMockCategory() { return mockCategory; }
	public void setMockCategory(MockCategory mockCategory) { this.mockCategory = mockCategory; }
	public ExamTarget getExamTarget() { return examTarget; }
	public void setExamTarget(ExamTarget examTarget) { this.examTarget = examTarget; }
	public Integer getSeriesDay() { return seriesDay; }
	public void setSeriesDay(Integer seriesDay) { this.seriesDay = seriesDay; }
	public String getMockCode() { return mockCode; }
	public void setMockCode(String mockCode) { this.mockCode = mockCode; }
	public double getCutoffMarks() { return cutoffMarks; }
	public void setCutoffMarks(double cutoffMarks) { this.cutoffMarks = cutoffMarks; }
	public Instant getCreatedAt() { return createdAt; }
	public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
	public Instant getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
