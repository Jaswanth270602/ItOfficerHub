package com.itofficerhub.repository;

import com.itofficerhub.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
	List<Question> findByMockTestIdOrderByOrderIndexAsc(Long mockTestId);
	long countByMockTestId(Long mockTestId);
	void deleteByMockTestId(Long mockTestId);
}
