ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS show_exam_date BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS daily_spotlight (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id),
    mock_test_id BIGINT NOT NULL REFERENCES mock_tests (id),
    net_score DOUBLE PRECISION NOT NULL,
    rank_position BIGINT NOT NULL DEFAULT 1,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_daily_spotlight_mock_expires ON daily_spotlight (mock_test_id, expires_at DESC);
