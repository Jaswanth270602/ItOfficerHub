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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_practice_section_subtopic UNIQUE (section_id, subtopic_slug)
);

CREATE INDEX IF NOT EXISTS idx_practice_section ON practice_questions (section_id);
CREATE INDEX IF NOT EXISTS idx_practice_topic ON practice_questions (topic);
