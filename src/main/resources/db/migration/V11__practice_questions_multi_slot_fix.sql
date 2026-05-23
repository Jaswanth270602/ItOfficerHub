-- Fix legacy unique(section_id, subtopic_slug) — allow up to 20 questions per subtopic
ALTER TABLE practice_questions ADD COLUMN IF NOT EXISTS question_number INT NOT NULL DEFAULT 1;

UPDATE practice_questions SET question_number = 1 WHERE question_number IS NULL OR question_number < 1;

DO $$
DECLARE
  r RECORD;
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
END $$;

ALTER TABLE practice_questions DROP CONSTRAINT IF EXISTS uq_practice_section_subtopic;
ALTER TABLE practice_questions DROP CONSTRAINT IF EXISTS uk9arv04m1u1lanvjkkjuclupqf;
ALTER TABLE practice_questions DROP CONSTRAINT IF EXISTS uq_practice_section_subtopic_qnum;

ALTER TABLE practice_questions
    ADD CONSTRAINT uq_practice_section_subtopic_qnum UNIQUE (section_id, subtopic_slug, question_number);

CREATE INDEX IF NOT EXISTS idx_practice_section_subtopic_num
    ON practice_questions (section_id, subtopic_slug, question_number);
