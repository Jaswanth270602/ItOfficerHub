package com.itofficerhub.repository;

import com.itofficerhub.entity.Conversation;
import com.itofficerhub.entity.ConversationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

	@Query("""
			SELECT DISTINCT c FROM Conversation c
			JOIN ConversationMember m ON m.conversation = c
			WHERE m.user.id = :userId
			ORDER BY c.updatedAt DESC
			""")
	List<Conversation> findForUser(@Param("userId") Long userId);

	@Query("""
			SELECT c FROM Conversation c
			JOIN ConversationMember m1 ON m1.conversation = c
			JOIN ConversationMember m2 ON m2.conversation = c
			WHERE c.type = :type AND m1.user.id = :u1 AND m2.user.id = :u2
			""")
	Optional<Conversation> findDirectBetween(@Param("u1") Long u1, @Param("u2") Long u2, @Param("type") ConversationType type);
}
