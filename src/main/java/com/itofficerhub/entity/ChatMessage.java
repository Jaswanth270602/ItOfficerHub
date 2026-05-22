package com.itofficerhub.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "conversation_id", nullable = false)
	private Conversation conversation;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "sender_id", nullable = false)
	private User sender;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private MessageType messageType = MessageType.TEXT;

	@Column(length = 4000)
	private String body;

	private Long scoreCardAttemptId;

	@Column(nullable = false, updatable = false)
	private Instant createdAt = Instant.now();

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public Conversation getConversation() { return conversation; }
	public void setConversation(Conversation conversation) { this.conversation = conversation; }
	public User getSender() { return sender; }
	public void setSender(User sender) { this.sender = sender; }
	public MessageType getMessageType() { return messageType; }
	public void setMessageType(MessageType messageType) { this.messageType = messageType; }
	public String getBody() { return body; }
	public void setBody(String body) { this.body = body; }
	public Long getScoreCardAttemptId() { return scoreCardAttemptId; }
	public void setScoreCardAttemptId(Long scoreCardAttemptId) { this.scoreCardAttemptId = scoreCardAttemptId; }
	public Instant getCreatedAt() { return createdAt; }
	public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
