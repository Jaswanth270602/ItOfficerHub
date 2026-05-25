-- Java Topic enum includes aptitude tracks; legacy CHECK only listed IT syllabus topics.
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_topic_check;

ALTER TABLE questions ADD CONSTRAINT questions_topic_check CHECK (
    topic IS NULL
    OR topic IN (
        'NETWORKING',
        'DBMS',
        'OPERATING_SYSTEMS',
        'SECURITY',
        'WEB_TECHNOLOGIES',
        'DATA_STRUCTURES',
        'COMPUTER_ORGANIZATION',
        'SOFTWARE_ENGINEERING',
        'CLOUD_COMPUTING',
        'DIGITAL_ELECTRONICS',
        'QUANTITATIVE_APTITUDE',
        'LOGICAL_REASONING',
        'VERBAL_ABILITY'
    )
);
