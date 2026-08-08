-- Vocab Daily APK download counter (admin metrics)

CREATE TABLE app_download_counters (
    app_key         VARCHAR(64) PRIMARY KEY,
    download_count  BIGINT NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_download_counters (app_key, download_count)
VALUES ('vocab-daily', 0);
