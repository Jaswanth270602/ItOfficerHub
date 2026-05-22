package com.itofficerhub.repository;

import com.itofficerhub.entity.TestAttempt;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {

	List<TestAttempt> findByUserIdAndSubmittedTrueOrderBySubmittedAtDesc(Long userId);

	@Query("""
			SELECT a FROM TestAttempt a
			JOIN FETCH a.mockTest m
			WHERE a.user.id = :userId AND a.submitted = true
			ORDER BY a.submittedAt DESC
			""")
	List<TestAttempt> findSubmittedByUserWithMock(@Param("userId") Long userId);

	@Query("SELECT AVG(a.netScore * 100.0 / (a.totalQuestions * 1.0)) FROM TestAttempt a WHERE a.submitted = true AND a.totalQuestions > 0")
	Double averageNetScorePercent();

	long countByMockTestIdAndSubmittedTrue(Long mockTestId);

	@Query("SELECT COUNT(a) FROM TestAttempt a WHERE a.mockTest.id = :mockId AND a.submitted = true")
	long countSubmittedByMock(@Param("mockId") Long mockTestId);

	@Query("SELECT COUNT(a) FROM TestAttempt a WHERE a.mockTest.id = :mockId AND a.submitted = true AND a.netScore < :netScore")
	long countStrictlyBelowNetScore(@Param("mockId") Long mockId, @Param("netScore") double netScore);

	@Query("SELECT COUNT(a) FROM TestAttempt a WHERE a.mockTest.id = :mockId AND a.submitted = true AND a.netScore = :netScore")
	long countEqualNetScore(@Param("mockId") Long mockId, @Param("netScore") double netScore);

	@Query("SELECT COUNT(a) FROM TestAttempt a WHERE a.mockTest.id = :mockId AND a.submitted = true AND a.netScore > :netScore")
	long countAboveNetScore(@Param("mockId") Long mockId, @Param("netScore") double netScore);

	long countBySubmittedTrue();

	@Query("""
			SELECT a FROM TestAttempt a
			JOIN FETCH a.user u
			WHERE a.mockTest.id = :mockId AND a.submitted = true
			ORDER BY a.netScore DESC, a.timeTakenSeconds ASC, a.submittedAt ASC
			""")
	List<TestAttempt> findLeaderboardByMock(@Param("mockId") Long mockId, Pageable pageable);

	@Query("""
			SELECT a FROM TestAttempt a
			JOIN FETCH a.user u
			JOIN FETCH a.mockTest m
			WHERE a.mockTest.id = :mockId AND a.submitted = true
			""")
	List<TestAttempt> findSubmittedByMockWithUser(@Param("mockId") Long mockId);
}
