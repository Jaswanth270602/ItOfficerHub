package com.itofficerhub.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "conversation_members", uniqueConstraints = @UniqueConstraint(columnNames = {"conversation_id", "user_id"}))
public class ConversationMember {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "conversation_id", nullable = false)
	private Conversation conversation;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false, updatable = false)
	private Instant joinedAt = Instant.now();

	private Instant lastReadAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public Conversation getConversation() { return conversation; }
	public void setConversation(Conversation conversation) { this.conversation = conversation; }
	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }
	public Instant getJoinedAt() { return joinedAt; }
	public void setJoinedAt(Instant joinedAt) { this.joinedAt = joinedAt; }
	public Instant getLastReadAt() { return lastReadAt; }
	public void setLastReadAt(Instant lastReadAt) { this.lastReadAt = lastReadAt; }
}
