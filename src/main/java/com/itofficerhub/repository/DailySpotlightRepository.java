package com.itofficerhub.repository;

import com.itofficerhub.entity.DailySpotlight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface DailySpotlightRepository extends JpaRepository<DailySpotlight, Long> {

	@Query("""
			SELECT s FROM DailySpotlight s
			JOIN FETCH s.user
			JOIN FETCH s.mockTest
			WHERE s.mockTest.id = :mockId AND s.expiresAt > :now
			ORDER BY s.awardedAt DESC
			""")
	Optional<DailySpotlight> findActiveForMock(@Param("mockId") Long mockId, @Param("now") Instant now);

	@Modifying
	@Query("DELETE FROM DailySpotlight s WHERE s.expiresAt <= :now")
	void deleteExpired(@Param("now") Instant now);

	@Modifying
	@Query("DELETE FROM DailySpotlight s WHERE s.mockTest.id <> :mockId")
	void deleteForOtherMocks(@Param("mockId") Long mockId);

	@Modifying
	@Query("DELETE FROM DailySpotlight s WHERE s.mockTest.id = :mockId")
	void deleteByMockTestId(@Param("mockId") Long mockId);
}
