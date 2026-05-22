package com.itofficerhub.repository;

import com.itofficerhub.entity.AttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {
	List<AttemptAnswer> findByAttemptIdOrderByQuestionOrderIndexAsc(Long attemptId);
}
