package com.itofficerhub.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Safety net if Flyway skipped V1 (baseline-version=1 bug) or migration did not run on Neon.
 */
@Component
@Order(0)
public class DatabaseSchemaPatch implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaPatch.class);

	private final JdbcTemplate jdbc;

	public DatabaseSchemaPatch(JdbcTemplate jdbc) {
		this.jdbc = jdbc;
	}

	@Override
	public void run(ApplicationArguments args) {
		if (!columnExists("mock_tests", "exam_target")) {
			log.warn("mock_tests.exam_target missing — applying schema patch");
			jdbc.execute("""
					ALTER TABLE mock_tests
					    ADD COLUMN IF NOT EXISTS mock_category VARCHAR(32) NOT NULL DEFAULT 'FULL'
					""");
			jdbc.execute("""
					ALTER TABLE mock_tests
					    ADD COLUMN IF NOT EXISTS exam_target VARCHAR(32) NOT NULL DEFAULT 'IBPS_SO_IT'
					""");
			jdbc.execute("""
					ALTER TABLE mock_tests
					    ADD COLUMN IF NOT EXISTS series_day INTEGER
					""");
			log.info("mock_tests columns added");
		}
		if (!tableExists("revision_bookmarks")) {
			log.warn("revision_bookmarks missing — creating table");
			jdbc.execute("""
					CREATE TABLE IF NOT EXISTS revision_bookmarks (
					    id BIGSERIAL PRIMARY KEY,
					    user_id BIGINT NOT NULL REFERENCES users (id),
					    question_id BIGINT NOT NULL REFERENCES questions (id),
					    source_attempt_id BIGINT,
					    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
					    CONSTRAINT uq_revision_user_question UNIQUE (user_id, question_id)
					)
					""");
			jdbc.execute("""
					CREATE INDEX IF NOT EXISTS idx_revision_bookmarks_user_id ON revision_bookmarks (user_id)
					""");
			log.info("revision_bookmarks created");
		}
	}

	private boolean columnExists(String table, String column) {
		Integer count = jdbc.queryForObject("""
				SELECT COUNT(*) FROM information_schema.columns
				WHERE table_schema = 'public' AND table_name = ? AND column_name = ?
				""", Integer.class, table, column);
		return count != null && count > 0;
	}

	private boolean tableExists(String table) {
		Integer count = jdbc.queryForObject("""
				SELECT COUNT(*) FROM information_schema.tables
				WHERE table_schema = 'public' AND table_name = ?
				""", Integer.class, table);
		return count != null && count > 0;
	}
}
