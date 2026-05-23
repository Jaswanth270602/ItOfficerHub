ALTER TABLE practice_questions DROP CONSTRAINT IF EXISTS uq_practice_section_subtopic;

ALTER TABLE practice_questions ADD COLUMN IF NOT EXISTS question_number INT NOT NULL DEFAULT 1;

UPDATE practice_questions SET question_number = 1 WHERE question_number IS NULL;

ALTER TABLE practice_questions
    ADD CONSTRAINT uq_practice_section_subtopic_qnum UNIQUE (section_id, subtopic_slug, question_number);

CREATE INDEX IF NOT EXISTS idx_practice_section_subtopic_num
    ON practice_questions (section_id, subtopic_slug, question_number);
