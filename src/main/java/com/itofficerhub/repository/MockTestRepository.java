package com.itofficerhub.repository;

import com.itofficerhub.entity.MockTest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface MockTestRepository extends JpaRepository<MockTest, Long> {
	List<MockTest> findByPublishedTrueOrderByCreatedAtDesc();

	@Query("""
			SELECT m FROM MockTest m WHERE m.published = true
			ORDER BY COALESCE(m.publishedAt, m.createdAt) DESC
			""")
	List<MockTest> findPublishedOrderByReleaseDesc();

	@Query("""
			SELECT m FROM MockTest m WHERE m.published = true
			ORDER BY COALESCE(m.publishedAt, m.createdAt) DESC
			""")
	List<MockTest> findPublishedOrderByReleaseDesc(Pageable pageable);

	default Optional<MockTest> findFeaturedMock() {
		return findPublishedOrderByReleaseDesc(Pageable.ofSize(1)).stream().findFirst();
	}

	long countByPublishedTrue();
}
