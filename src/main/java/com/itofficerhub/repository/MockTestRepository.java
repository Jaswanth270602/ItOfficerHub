package com.itofficerhub.repository;

import com.itofficerhub.entity.MockTest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MockTestRepository extends JpaRepository<MockTest, Long> {
	List<MockTest> findByPublishedTrueOrderByCreatedAtDesc();
	long countByPublishedTrue();
}
