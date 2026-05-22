package com.itofficerhub.repository;

import com.itofficerhub.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

	@Query("""
			SELECT m FROM ChatMessage m
			JOIN FETCH m.sender s
			WHERE m.conversation.id = :convId
			ORDER BY m.createdAt ASC
			""")
	List<ChatMessage> findAllForConversation(@Param("convId") Long convId);

	@Query("""
			SELECT m FROM ChatMessage m
			JOIN FETCH m.sender s
			WHERE m.conversation.id = :convId
			AND m.createdAt > :since
			ORDER BY m.createdAt ASC
			""")
	List<ChatMessage> findForConversationAfter(@Param("convId") Long convId, @Param("since") Instant since);

	Optional<ChatMessage> findTopByConversationIdOrderByCreatedAtDesc(Long conversationId);

	@Query("""
			SELECT COUNT(m) FROM ChatMessage m
			JOIN ConversationMember cm ON cm.conversation = m.conversation
			WHERE cm.user.id = :userId
			AND m.sender.id <> :userId
			AND (cm.lastReadAt IS NULL OR m.createdAt > cm.lastReadAt)
			""")
	long countUnreadForUser(@Param("userId") Long userId);

	@Query("""
			SELECT m FROM ChatMessage m
			JOIN FETCH m.sender s
			JOIN FETCH m.conversation c
			JOIN ConversationMember cm ON cm.conversation = c
			WHERE cm.user.id = :userId
			AND m.createdAt > :since
			ORDER BY m.createdAt ASC
			""")
	List<ChatMessage> findNewForUserAfter(@Param("userId") Long userId, @Param("since") Instant since);
}
