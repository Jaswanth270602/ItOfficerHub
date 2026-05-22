package com.itofficerhub.repository;

import com.itofficerhub.entity.AttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {

	List<AttemptAnswer> findByAttemptIdOrderByQuestionOrderIndexAsc(Long attemptId);

	@org.springframework.data.jpa.repository.Query("""
			SELECT aa FROM AttemptAnswer aa
			JOIN FETCH aa.question q
			JOIN FETCH aa.attempt a
			WHERE a.user.id = :userId AND a.submitted = true
			""")
	List<AttemptAnswer> findSubmittedAnswersByUser(@org.springframework.data.repository.query.Param("userId") Long userId);
}
