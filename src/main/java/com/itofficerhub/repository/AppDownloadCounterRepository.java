package com.itofficerhub.repository;

import com.itofficerhub.entity.AppDownloadCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppDownloadCounterRepository extends JpaRepository<AppDownloadCounter, String> {

	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("""
			UPDATE AppDownloadCounter c
			SET c.downloadCount = c.downloadCount + 1, c.updatedAt = CURRENT_TIMESTAMP
			WHERE c.appKey = :appKey
			""")
	int increment(@Param("appKey") String appKey);

	@Query("SELECT COALESCE(c.downloadCount, 0) FROM AppDownloadCounter c WHERE c.appKey = :appKey")
	Long findCountByAppKey(@Param("appKey") String appKey);
}
