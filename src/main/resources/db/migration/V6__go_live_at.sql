ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS go_live_at TIMESTAMPTZ;

UPDATE mock_tests
SET go_live_at = COALESCE(published_at, created_at)
WHERE published = true AND go_live_at IS NULL;
