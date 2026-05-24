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

  return `You are a senior IBPS Specialist Officer (IT Officer) content author building mocks for ItOfficerHub.

TASK: Generate exactly ${batchSize} MCQs as ONE JSON object. No markdown fences — only valid JSON.

MOCK SETTINGS:
- title: "${opts.title}"
- difficulty: ${opts.difficulty}
- examTarget: ${opts.examTarget ?? 'IBPS_SO_IT'}
- mockCategory: ${opts.mockCategory ?? 'FULL'}
- questionCount limit: ${opts.questionLimit}
- topics (spread evenly): ${topics}
${existingCount > 0 ? `- APPEND batch: orderIndex ${startIdx} through ${endIdx} (${existingCount} questions already exist — do NOT restart at 1)\n` : ''}
RULES:
- Exactly ${batchSize} questions in the "questions" array
- orderIndex: ${startIdx} through ${endIdx} on each item
- 4 options A–D; exactly one correct (correctOption: "A"|"B"|"C"|"D")
- Every question MUST have "topic" AND "topicTag" (2–6 words, e.g. "TCP/IP & OSI Model")
- IBPS SO IT style; varied difficulty; no duplicate stems

EXPLANATION (mandatory — minimum 400 characters each):
- Use \\n for line breaks in JSON
- Include "Option breakdown:" with Option A, B, C, D individually — mark correct with ✓ CORRECT
- Include "References:" line
- Quant/numerical: "Solution steps:" with ≥3 numbered steps
- Tech topics: flowchart (-->, graph TD) OR ASCII diagram when helpful

JSON SCHEMA:

{
  "title": "${opts.title}",
  "description": "One-line mock subtitle",
  "difficulty": "${opts.difficulty}",
  "questionCount": ${opts.questionLimit},
  "mockCategory": "${opts.mockCategory ?? 'FULL'}",
  "examTarget": "${opts.examTarget ?? 'IBPS_SO_IT'}",
  "questions": [
    {
      "questionText": "...",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctOption": "C",
      "explanation": "Core concept:\\n• ...\\n\\nOption breakdown:\\n• Option A — ...\\n• Option B — ...\\n• Option C — ✓ CORRECT — ...\\n• Option D — ...\\n\\nReferences: ...",
      "solutionImageUrl": null,
      "topic": "NETWORKING",
      "topicTag": "TCP/IP & OSI Model",
      "orderIndex": ${startIdx}
    }
  ]
}

VALID topic values: NETWORKING, DBMS, OPERATING_SYSTEMS, SECURITY, WEB_TECHNOLOGIES, DATA_STRUCTURES, COMPUTER_ORGANIZATION, SOFTWARE_ENGINEERING, CLOUD_COMPUTING, DIGITAL_ELECTRONICS, QUANTITATIVE_APTITUDE, LOGICAL_REASONING, VERBAL_ABILITY

Before output, self-check: ${batchSize} questions; orderIndex ${startIdx}–${endIdx}; topic + topicTag on every row; each explanation ≥400 chars with full option breakdown.

Admin import: paste JSON at ItOfficerHub → Admin → Import Mock (or Manage Mock).
`
}
