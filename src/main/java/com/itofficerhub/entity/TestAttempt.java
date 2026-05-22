package com.itofficerhub.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "test_attempts")
public class TestAttempt {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "mock_test_id", nullable = false)
	private MockTest mockTest;

	/** Raw correct count (for quick display) */
	private int score;

	@Column(nullable = false)
	private int totalQuestions;

	private int correctCount;
	private int wrongCount;
	private int unattemptedCount;

	private double positiveMarks;
	private double negativeMarks;
	private double netScore;

	private int timeTakenSeconds;

	@Column(nullable = false)
	private boolean submitted = false;

	@Column(nullable = false, updatable = false)
	private Instant startedAt = Instant.now();

	private Instant submittedAt;

	/** Snapshot at submit time — avoids recomputing rank on every list/history load */
	private Long rankAtSubmit;
	private Double percentileAtSubmit;
	private Long uniqueStudentsAtSubmit;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }
	public MockTest getMockTest() { return mockTest; }
	public void setMockTest(MockTest mockTest) { this.mockTest = mockTest; }
	public int getScore() { return score; }
	public void setScore(int score) { this.score = score; }
	public int getTotalQuestions() { return totalQuestions; }
	public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
	public int getCorrectCount() { return correctCount; }
	public void setCorrectCount(int correctCount) { this.correctCount = correctCount; }
	public int getWrongCount() { return wrongCount; }
	public void setWrongCount(int wrongCount) { this.wrongCount = wrongCount; }
	public int getUnattemptedCount() { return unattemptedCount; }
	public void setUnattemptedCount(int unattemptedCount) { this.unattemptedCount = unattemptedCount; }
	public double getPositiveMarks() { return positiveMarks; }
	public void setPositiveMarks(double positiveMarks) { this.positiveMarks = positiveMarks; }
	public double getNegativeMarks() { return negativeMarks; }
	public void setNegativeMarks(double negativeMarks) { this.negativeMarks = negativeMarks; }
	public double getNetScore() { return netScore; }
	public void setNetScore(double netScore) { this.netScore = netScore; }
	public int getTimeTakenSeconds() { return timeTakenSeconds; }
	public void setTimeTakenSeconds(int timeTakenSeconds) { this.timeTakenSeconds = timeTakenSeconds; }
	public boolean isSubmitted() { return submitted; }
	public void setSubmitted(boolean submitted) { this.submitted = submitted; }
	public Instant getStartedAt() { return startedAt; }
	public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
	public Instant getSubmittedAt() { return submittedAt; }
	public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
	public Long getRankAtSubmit() { return rankAtSubmit; }
	public void setRankAtSubmit(Long rankAtSubmit) { this.rankAtSubmit = rankAtSubmit; }
	public Double getPercentileAtSubmit() { return percentileAtSubmit; }
	public void setPercentileAtSubmit(Double percentileAtSubmit) { this.percentileAtSubmit = percentileAtSubmit; }
	public Long getUniqueStudentsAtSubmit() { return uniqueStudentsAtSubmit; }
	public void setUniqueStudentsAtSubmit(Long uniqueStudentsAtSubmit) { this.uniqueStudentsAtSubmit = uniqueStudentsAtSubmit; }
}
