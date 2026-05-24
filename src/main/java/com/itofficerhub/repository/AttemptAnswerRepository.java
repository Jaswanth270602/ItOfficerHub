package com.itofficerhub.repository;

import com.itofficerhub.entity.AttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {

	@Modifying
	@Query("DELETE FROM AttemptAnswer aa WHERE aa.attempt.mockTest.id = :mockId")
	void deleteByMockTestId(@Param("mockId") Long mockId);

	List<AttemptAnswer> findByAttemptIdOrderByQuestionOrderIndexAsc(Long attemptId);

	Optional<AttemptAnswer> findByAttempt_IdAndQuestion_Id(Long attemptId, Long questionId);

	@org.springframework.data.jpa.repository.Query("""
			SELECT aa FROM AttemptAnswer aa
			JOIN FETCH aa.question q
			JOIN FETCH aa.attempt a
			WHERE a.user.id = :userId AND a.submitted = true
			""")
	List<AttemptAnswer> findSubmittedAnswersByUser(@org.springframework.data.repository.query.Param("userId") Long userId);
}
