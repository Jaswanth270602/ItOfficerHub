-- Run in Neon SQL Editor if production still errors before next deploy.
-- Same changes as Flyway V1__mock_tags_and_revision_bookmarks.sql

ALTER TABLE mock_tests
    ADD COLUMN IF NOT EXISTS mock_category VARCHAR(32) NOT NULL DEFAULT 'FULL';

ALTER TABLE mock_tests
    ADD COLUMN IF NOT EXISTS exam_target VARCHAR(32) NOT NULL DEFAULT 'IBPS_SO_IT';

ALTER TABLE mock_tests
    ADD COLUMN IF NOT EXISTS series_day INTEGER;

CREATE TABLE IF NOT EXISTS revision_bookmarks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id),
    question_id BIGINT NOT NULL REFERENCES questions (id),
    source_attempt_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_revision_user_question UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_revision_bookmarks_user_id ON revision_bookmarks (user_id);

ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS mock_code VARCHAR(32);
CREATE UNIQUE INDEX IF NOT EXISTS uq_mock_tests_mock_code ON mock_tests (mock_code) WHERE mock_code IS NOT NULL;
