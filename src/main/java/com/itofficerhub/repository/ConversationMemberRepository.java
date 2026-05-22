package com.itofficerhub.repository;

import com.itofficerhub.entity.ConversationMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ConversationMemberRepository extends JpaRepository<ConversationMember, Long> {

	Optional<ConversationMember> findByConversationIdAndUserId(Long conversationId, Long userId);

	List<ConversationMember> findByConversationId(Long conversationId);

	@Query("SELECT m FROM ConversationMember m JOIN FETCH m.user WHERE m.conversation.id = :convId")
	List<ConversationMember> findByConversationIdWithUser(@Param("convId") Long convId);

	boolean existsByConversationIdAndUserId(Long conversationId, Long userId);
}
