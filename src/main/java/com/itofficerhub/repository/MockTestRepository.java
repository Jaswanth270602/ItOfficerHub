package com.itofficerhub.repository;

import com.itofficerhub.entity.MockTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface MockTestRepository extends JpaRepository<MockTest, Long> {
	List<MockTest> findByPublishedTrueOrderByCreatedAtDesc();

	@Query("""
			SELECT m FROM MockTest m WHERE m.published = true
			ORDER BY COALESCE(m.goLiveAt, m.publishedAt, m.createdAt) DESC
			""")
	List<MockTest> findPublishedCandidates();

	long countByPublishedTrue();

	long countByExamTarget(com.itofficerhub.entity.ExamTarget examTarget);
}
