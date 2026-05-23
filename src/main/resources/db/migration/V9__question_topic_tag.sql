-- Fine-grained topic tag from Claude import (e.g. "Deadlock", "Paging" under OS)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic_tag VARCHAR(128);
