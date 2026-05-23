package com.itofficerhub.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Deletes all mock tests and related attempt/question data. Users and chat are kept.
 */
@Service
public class MockDataWipeService {

	private static final Logger log = LoggerFactory.getLogger(MockDataWipeService.class);

	private final JdbcTemplate jdbc;
	private final AppCacheService appCacheService;

	public MockDataWipeService(JdbcTemplate jdbc, AppCacheService appCacheService) {
		this.jdbc = jdbc;
		this.appCacheService = appCacheService;
	}

	@Transactional
	public void wipeAllMocks() {
		log.warn("Wiping all mock tests, questions, attempts, and revision bookmarks");
		jdbc.execute("DELETE FROM attempt_answers");
		jdbc.execute("DELETE FROM revision_bookmarks");
		jdbc.execute("DELETE FROM test_attempts");
		jdbc.execute("DELETE FROM daily_spotlight");
		jdbc.execute("DELETE FROM questions");
		jdbc.execute("DELETE FROM mock_tests");
		appCacheService.evictPublicCatalog();
		log.warn("Mock data wipe complete");
	}
}
