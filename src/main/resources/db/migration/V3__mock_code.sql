ALTER TABLE mock_tests
    ADD COLUMN IF NOT EXISTS mock_code VARCHAR(32);

CREATE UNIQUE INDEX IF NOT EXISTS uq_mock_tests_mock_code
    ON mock_tests (mock_code)
    WHERE mock_code IS NOT NULL;
