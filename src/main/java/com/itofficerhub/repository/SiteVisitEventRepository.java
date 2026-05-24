package com.itofficerhub.repository;

import com.itofficerhub.entity.SiteVisitEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public interface SiteVisitEventRepository extends JpaRepository<SiteVisitEvent, Long> {

	boolean existsByIpAddressAndPathAndVisitedAtAfter(String ipAddress, String path, Instant after);

	@Query("SELECT COUNT(DISTINCT e.ipAddress) FROM SiteVisitEvent e WHERE e.visitDate = :date")
	long countDistinctIpByVisitDate(@Param("date") LocalDate date);

	@Query("SELECT COUNT(e) FROM SiteVisitEvent e WHERE e.visitDate = :date")
	long countByVisitDate(@Param("date") LocalDate date);

	@Query("""
			SELECT e.visitDate, COUNT(e), COUNT(DISTINCT e.ipAddress)
			FROM SiteVisitEvent e
			WHERE e.visitDate >= :from
			GROUP BY e.visitDate
			ORDER BY e.visitDate DESC
			""")
	List<Object[]> aggregateByDaySince(@Param("from") LocalDate from);

	@Query(value = """
			SELECT e.* FROM site_visit_events e
			WHERE (:date IS NULL OR e.visit_date = CAST(:date AS date))
			  AND (:ip IS NULL OR :ip = '' OR e.ip_address LIKE CONCAT('%', :ip, '%'))
			  AND (:path IS NULL OR :path = '' OR LOWER(e.path) LIKE LOWER(CONCAT('%', :path, '%')))
			ORDER BY e.visited_at DESC
			""",
			countQuery = """
			SELECT COUNT(*) FROM site_visit_events e
			WHERE (:date IS NULL OR e.visit_date = CAST(:date AS date))
			  AND (:ip IS NULL OR :ip = '' OR e.ip_address LIKE CONCAT('%', :ip, '%'))
			  AND (:path IS NULL OR :path = '' OR LOWER(e.path) LIKE LOWER(CONCAT('%', :path, '%')))
			""",
			nativeQuery = true)
	Page<SiteVisitEvent> search(
			@Param("date") String date,
			@Param("ip") String ip,
			@Param("path") String path,
			Pageable pageable);

}
