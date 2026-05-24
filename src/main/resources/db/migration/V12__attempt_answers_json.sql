-- Store mock attempt answers as JSON on test_attempts (replaces attempt_answers rows).

ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS answers_json JSONB;

DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.tables
		WHERE table_schema = current_schema() AND table_name = 'attempt_answers'
	) THEN
		UPDATE test_attempts ta
		SET answers_json = jsonb_build_object(
			'answers',
			COALESCE((
				SELECT jsonb_object_agg(aa.question_id::text, aa.selected_option)
				FROM attempt_answers aa
				WHERE aa.attempt_id = ta.id AND aa.selected_option IS NOT NULL
			), '{}'::jsonb),
			'marked',
			COALESCE((
				SELECT jsonb_object_agg(aa.question_id::text, to_jsonb(true))
				FROM attempt_answers aa
				WHERE aa.attempt_id = ta.id AND aa.marked_for_review = true
			), '{}'::jsonb)
		)
		WHERE EXISTS (SELECT 1 FROM attempt_answers aa WHERE aa.attempt_id = ta.id)
		  AND ta.answers_json IS NULL;

		DROP TABLE attempt_answers;
	END IF;
END $$;
