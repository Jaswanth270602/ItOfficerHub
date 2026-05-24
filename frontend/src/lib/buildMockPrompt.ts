export function mockImportBatchSize(questionLimit: number, existingCount: number): number {
  return Math.max(0, questionLimit - existingCount)
}

export function buildMockPrompt(opts: {
  title: string
  difficulty: string
  questionLimit: number
  existingCount?: number
  examTarget?: string
  mockCategory?: string
  topics?: string
}): string {
  const existingCount = opts.existingCount ?? 0
  const batchSize = mockImportBatchSize(opts.questionLimit, existingCount)
  const startIdx = existingCount + 1
  const endIdx = existingCount + batchSize

  if (batchSize === 0) {
    return `This mock already has ${opts.questionLimit} questions (limit reached). Increase question limit in mock settings or delete questions first.`
  }

  const topics =
    opts.topics ??
    'NETWORKING, DBMS, OPERATING_SYSTEMS, SECURITY, WEB_TECHNOLOGIES (spread evenly, 2–4 Q each)'

  return `You are a senior IBPS Specialist Officer (IT Officer) content author for ItOfficerHub.

CRITICAL OUTPUT RULES (import will FAIL otherwise):
1. Reply with ONE raw JSON object only — first character must be { and last character must be }.
2. Do NOT wrap in markdown code fences. Do NOT write any text before or after the JSON.
3. Do NOT explain, summarise, or chat — only the JSON object.
4. If you cannot comply, output exactly: {"error":"cannot generate"}

TASK: Generate exactly ${batchSize} MCQs inside "questions".

MOCK SETTINGS:
- title: "${opts.title}"
- difficulty: ${opts.difficulty}
- examTarget: ${opts.examTarget ?? 'IBPS_SO_IT'}
- mockCategory: ${opts.mockCategory ?? 'FULL'}
- questionCount limit: ${opts.questionLimit}
- topics (spread evenly): ${topics}
${existingCount > 0 ? `- APPEND batch: orderIndex ${startIdx} through ${endIdx} (${existingCount} questions already exist)\n` : ''}
QUESTION RULES:
- Exactly ${batchSize} items in "questions"
- orderIndex: ${startIdx} through ${endIdx}
- 4 options A–D; exactly one correct (correctOption: "A"|"B"|"C"|"D")
- Every question MUST have "topic" (uppercase enum) AND "topicTag" (2–6 words)
- IBPS SO IT style; no duplicate stems

EXPLANATION (each question — server rejects if shorter):
- Minimum 400 characters in "explanation" string
- Use \\n for line breaks inside JSON
- Must include these section headers exactly:
  Core concept:
  Option breakdown:  (all four: Option A, Option B, Option C, Option D — mark correct with ✓ CORRECT)
  References:
- For numerical/subnetting: add "Solution steps:" with ≥3 numbered steps
- For theory: optional "Key distinction:" and "Exam tip:"

VALID topic values only:
NETWORKING, DBMS, OPERATING_SYSTEMS, SECURITY, WEB_TECHNOLOGIES, DATA_STRUCTURES, COMPUTER_ORGANIZATION, SOFTWARE_ENGINEERING, CLOUD_COMPUTING, DIGITAL_ELECTRONICS, QUANTITATIVE_APTITUDE, LOGICAL_REASONING, VERBAL_ABILITY

JSON TEMPLATE (fill all fields; keep valid JSON — escape quotes inside strings):

{
  "title": "${opts.title}",
  "description": "One-line mock subtitle",
  "difficulty": "${opts.difficulty}",
  "questionCount": ${opts.questionLimit},
  "mockCategory": "${opts.mockCategory ?? 'FULL'}",
  "examTarget": "${opts.examTarget ?? 'IBPS_SO_IT'}",
  "questions": [
    {
      "questionText": "Your MCQ stem here?",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctOption": "C",
      "explanation": "Core concept:\\n• ...\\n\\nOption breakdown:\\n• Option A — ...\\n• Option B — ...\\n• Option C — ✓ CORRECT — ...\\n• Option D — ...\\n\\nReferences: IBPS SO IT syllabus",
      "solutionImageUrl": null,
      "topic": "NETWORKING",
      "topicTag": "TCP/IP & OSI Model",
      "orderIndex": ${startIdx}
    }
  ]
}

Self-check before sending: ${batchSize} questions; valid JSON; no trailing commas; every explanation ≥400 chars with Option breakdown for A–D.
`
}
