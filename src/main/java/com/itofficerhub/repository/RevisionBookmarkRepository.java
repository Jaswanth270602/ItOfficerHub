package com.itofficerhub.repository;

import com.itofficerhub.entity.RevisionBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface RevisionBookmarkRepository extends JpaRepository<RevisionBookmark, Long> {

	@Modifying
	@Query("DELETE FROM RevisionBookmark rb WHERE rb.question.mockTest.id = :mockId")
	void deleteByMockTestId(@Param("mockId") Long mockId);

	boolean existsByUserIdAndQuestionId(Long userId, Long questionId);

	Optional<RevisionBookmark> findByUserIdAndQuestionId(Long userId, Long questionId);

	void deleteByUserIdAndQuestionId(Long userId, Long questionId);

	long countByUserId(Long userId);

	@Query("""
			SELECT rb FROM RevisionBookmark rb
			JOIN FETCH rb.question q
			JOIN FETCH q.mockTest m
			WHERE rb.user.id = :userId
			ORDER BY rb.createdAt DESC
			""")
	List<RevisionBookmark> findByUserIdWithQuestion(@Param("userId") Long userId);
}
