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
		if (!columnExists("mock_tests", "go_live_at")) {
			jdbc.execute("""
					ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS go_live_at TIMESTAMPTZ
					""");
			jdbc.execute("""
					UPDATE mock_tests SET go_live_at = COALESCE(published_at, created_at)
					WHERE published = true AND go_live_at IS NULL
					""");
		}
		if (!columnExists("mock_tests", "show_exam_date")) {
			jdbc.execute("""
					ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS show_exam_date BOOLEAN NOT NULL DEFAULT false
					""");
		}
		if (!tableExists("daily_spotlight")) {
			jdbc.execute("""
					CREATE TABLE IF NOT EXISTS daily_spotlight (
					    id BIGSERIAL PRIMARY KEY,
					    user_id BIGINT NOT NULL REFERENCES users (id),
					    mock_test_id BIGINT NOT NULL REFERENCES mock_tests (id),
					    net_score DOUBLE PRECISION NOT NULL,
					    rank_position BIGINT NOT NULL DEFAULT 1,
					    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
					    expires_at TIMESTAMPTZ NOT NULL
					)
					""");
			jdbc.execute("""
					CREATE INDEX IF NOT EXISTS idx_daily_spotlight_mock_expires
					    ON daily_spotlight (mock_test_id, expires_at DESC)
					""");
		}
		if (!columnExists("users", "prep_points")) {
			log.warn("users.prep_points missing — adding column");
			jdbc.execute("""
					ALTER TABLE users ADD COLUMN IF NOT EXISTS prep_points INTEGER NOT NULL DEFAULT 0
					""");
		}
		if (!tableExists("practice_questions")) {
			log.warn("practice_questions missing — creating table");
			jdbc.execute("""
					CREATE TABLE IF NOT EXISTS practice_questions (
					    id BIGSERIAL PRIMARY KEY,
					    section_id VARCHAR(64) NOT NULL,
					    subtopic_slug VARCHAR(128) NOT NULL,
					    topic VARCHAR(64) NOT NULL,
					    question_text VARCHAR(4000) NOT NULL,
					    option_a VARCHAR(1000) NOT NULL,
					    option_b VARCHAR(1000) NOT NULL,
					    option_c VARCHAR(1000) NOT NULL,
					    option_d VARCHAR(1000) NOT NULL,
					    correct_option VARCHAR(1) NOT NULL,
					    explanation VARCHAR(8000),
					    solution_image_url VARCHAR(2000),
					    published BOOLEAN NOT NULL DEFAULT true,
					    question_number INT NOT NULL DEFAULT 1,
					    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
					    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
					    CONSTRAINT uq_practice_section_subtopic_qnum UNIQUE (section_id, subtopic_slug, question_number)
					)
					""");
		}
		patchPracticeQuestionConstraints();
		if (!columnExists("users", "phone")) {
			jdbc.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)");
			jdbc.execute("""
					CREATE UNIQUE INDEX IF NOT EXISTS uq_users_phone ON users (phone) WHERE phone IS NOT NULL
					""");
		}
		if (!columnExists("mock_tests", "mock_code")) {
			log.warn("mock_tests.mock_code missing — adding column");
			jdbc.execute("""
					ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS mock_code VARCHAR(32)
					""");
			jdbc.execute("""
					CREATE UNIQUE INDEX IF NOT EXISTS uq_mock_tests_mock_code
					    ON mock_tests (mock_code) WHERE mock_code IS NOT NULL
					""");
		}
		if (!columnExists("questions", "topic_tag")) {
			log.warn("questions.topic_tag missing — applying schema patch");
			jdbc.execute("ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic_tag VARCHAR(128)");
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

	private void patchPracticeQuestionConstraints() {
		if (!tableExists("practice_questions")) {
			return;
		}
		jdbc.execute("ALTER TABLE practice_questions ADD COLUMN IF NOT EXISTS question_number INT NOT NULL DEFAULT 1");
		jdbc.execute("UPDATE practice_questions SET question_number = 1 WHERE question_number IS NULL OR question_number < 1");

		Integer legacyUnique = jdbc.queryForObject("""
				SELECT COUNT(*) FROM pg_constraint c
				JOIN pg_class t ON c.conrelid = t.oid
				WHERE t.relname = 'practice_questions'
				  AND c.contype = 'u'
				  AND c.conname <> 'uq_practice_section_subtopic_qnum'
				""", Integer.class);
		if (legacyUnique != null && legacyUnique > 0) {
			log.warn("practice_questions: dropping {} legacy unique constraint(s)", legacyUnique);
			jdbc.execute("""
					DO $$
					DECLARE r RECORD;
					BEGIN
					  FOR r IN
					    SELECT c.conname
					    FROM pg_constraint c
					    JOIN pg_class t ON c.conrelid = t.oid
					    WHERE t.relname = 'practice_questions'
					      AND c.contype = 'u'
					      AND c.conname <> 'uq_practice_section_subtopic_qnum'
					  LOOP
					    EXECUTE format('ALTER TABLE practice_questions DROP CONSTRAINT IF EXISTS %I', r.conname);
					  END LOOP;
					END $$
					""");
		}

		Integer correctUnique = jdbc.queryForObject("""
				SELECT COUNT(*) FROM pg_constraint c
				JOIN pg_class t ON c.conrelid = t.oid
				WHERE t.relname = 'practice_questions'
				  AND c.contype = 'u'
				  AND c.conname = 'uq_practice_section_subtopic_qnum'
				""", Integer.class);
		if (correctUnique == null || correctUnique == 0) {
			log.warn("practice_questions: adding uq_practice_section_subtopic_qnum");
			jdbc.execute("ALTER TABLE practice_questions DROP CONSTRAINT IF EXISTS uq_practice_section_subtopic_qnum");
			jdbc.execute("""
					ALTER TABLE practice_questions
					ADD CONSTRAINT uq_practice_section_subtopic_qnum
					UNIQUE (section_id, subtopic_slug, question_number)
					""");
		}
	}
}
