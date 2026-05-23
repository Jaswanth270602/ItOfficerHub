package com.itofficerhub.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "daily_spotlight")
public class DailySpotlight {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "mock_test_id", nullable = false)
	private MockTest mockTest;

	@Column(nullable = false)
	private double netScore;

	@Column(name = "rank_position", nullable = false)
	private long rankPosition = 1;

	@Column(nullable = false, updatable = false)
	private Instant awardedAt = Instant.now();

	@Column(nullable = false)
	private Instant expiresAt;

	public Long getId() { return id; }
	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }
	public MockTest getMockTest() { return mockTest; }
	public void setMockTest(MockTest mockTest) { this.mockTest = mockTest; }
	public double getNetScore() { return netScore; }
	public void setNetScore(double netScore) { this.netScore = netScore; }
	public long getRankPosition() { return rankPosition; }
	public void setRankPosition(long rankPosition) { this.rankPosition = rankPosition; }
	public Instant getAwardedAt() { return awardedAt; }
	public void setAwardedAt(Instant awardedAt) { this.awardedAt = awardedAt; }
	public Instant getExpiresAt() { return expiresAt; }
	public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}
