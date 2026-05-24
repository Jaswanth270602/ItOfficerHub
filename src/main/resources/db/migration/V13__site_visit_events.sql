-- Page visit analytics (IP + path + session context). Retain per your privacy policy.

CREATE TABLE site_visit_events (
    id              BIGSERIAL PRIMARY KEY,
    ip_address      VARCHAR(45) NOT NULL,
    visited_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visit_date      DATE NOT NULL,
    path            VARCHAR(512) NOT NULL,
    query_string    VARCHAR(1024),
    referer         VARCHAR(2048),
    user_agent      TEXT,
    accept_language VARCHAR(128),
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    session_key     VARCHAR(64),
    device_class    VARCHAR(16) NOT NULL DEFAULT 'UNKNOWN',
    is_authenticated BOOLEAN NOT NULL DEFAULT FALSE,
    country_hint    VARCHAR(8)
);

CREATE INDEX idx_site_visit_visited_at ON site_visit_events (visited_at DESC);
CREATE INDEX idx_site_visit_visit_date ON site_visit_events (visit_date DESC);
CREATE INDEX idx_site_visit_ip ON site_visit_events (ip_address);
CREATE INDEX idx_site_visit_date_ip ON site_visit_events (visit_date, ip_address);
CREATE INDEX idx_site_visit_path ON site_visit_events (path);
