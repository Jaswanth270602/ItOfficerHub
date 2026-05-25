export function mockImportBatchSize(questionLimit: number, existingCount: number): number {
  return Math.max(0, questionLimit - existingCount)
}

/** Shared explanation rules — imported mocks render section-by-section in the result UI. */
const EXPLANATION_RULES = `
EXPLANATION FORMAT (mandatory — the app parses section headers; wrong order breaks the UI):

Use literal \\\\n between lines in JSON. Put a blank line (\\\\n\\\\n) between every section.

Pick exactly ONE template per question. Copy section headers verbatim (same spelling, trailing colon).

━━━ TEMPLATE A — Calculation / subnetting / numerical (use when math or formula is involved) ━━━
Section order (do not reorder, do not skip):

Core concept:
• One bullet: what is being tested

Solution steps:
1. State formula or rule (no arrows → or --> on numbered lines)
2. Substitute values with numbers shown
3. Show intermediate calculation
4. State final answer and which option letter matches

Option breakdown:
• Option A — [value/meaning] — INCORRECT because [specific reason]
• Option B — [value/meaning] — INCORRECT because [reason]
• Option C — [value/meaning] — ✓ CORRECT — matches step 4
• Option D — [value/meaning] — INCORRECT because [reason]

Common trap:
• One bullet on the typical IBPS mistake

Exam tip:
• One bullet with a memory hook (arrows → allowed only inside • bullets, not in numbered steps)

References:
Source 1; Source 2

Do NOT add a Flowchart block for pure calculation/subnetting questions unless a diagram is essential.

━━━ TEMPLATE B — Conceptual / definition / protocol (no heavy calculation) ━━━
Section order:

Core concept:
• 2–3 bullets explaining the idea in plain English

Option breakdown:
• Option A — [simplified] — INCORRECT because [reason]
• Option B — [simplified] — INCORRECT because [reason]
• Option C — [simplified] — ✓ CORRECT because [2–3 lines why it fits]
• Option D — [simplified] — INCORRECT because [reason]

Key distinction:
• One bullet comparing the closest trap pair

Exam tip:
• One bullet for quick recall under time pressure

References:
Source 1; Source 2

━━━ FLOWCHART (OPTIONAL — do not force on every question) ━━━
- Add a Flowchart block only when a process/protocol truly benefits from a diagram (aim for ~30–50% of conceptual questions, not all 20).
- If you skip it, go straight from Exam tip to References — import accepts explanations with NO flowchart.
- NEVER invent a fake one-line diagram just to satisfy a checklist — poor diagrams hurt students.
- When you DO include one: put "Flowchart:" on its own line, then graph TD/LR (5–12 lines), all Mermaid lines contiguous, then References.
- NEVER put Option breakdown or teaching text inside the Flowchart block; NEVER use --> or graph TD inside numbered Solution steps.

━━━ GLOBAL RULES ━━━
- Minimum 200 characters per explanation (400+ recommended); every question needs all four options under Option breakdown:
- Mark the correct option with "✓ CORRECT" on its bullet line.
- "References:" must be the last line of the explanation string.
- Use the same section order for every question in this batch.
`

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
- Every question MUST have "topic" (uppercase enum) AND "topicTag" (2–6 words, specific sub-topic)
- IBPS SO IT style; no duplicate stems
${EXPLANATION_RULES}
VALID topic values only:
NETWORKING, DBMS, OPERATING_SYSTEMS, SECURITY, WEB_TECHNOLOGIES, DATA_STRUCTURES, COMPUTER_ORGANIZATION, SOFTWARE_ENGINEERING, CLOUD_COMPUTING, DIGITAL_ELECTRONICS, QUANTITATIVE_APTITUDE, LOGICAL_REASONING, VERBAL_ABILITY

JSON TEMPLATE (fill all fields; escape quotes inside strings):

{
  "title": "${opts.title}",
  "description": "One-line mock subtitle",
  "difficulty": "${opts.difficulty}",
  "questionCount": ${opts.questionLimit},
  "mockCategory": "${opts.mockCategory ?? 'FULL'}",
  "examTarget": "${opts.examTarget ?? 'IBPS_SO_IT'}",
  "questions": [
    {
      "questionText": "A company uses subnet mask 255.255.255.192 on Class C network 192.168.10.0. How many usable host addresses per subnet?",
      "optionA": "30",
      "optionB": "62",
      "optionC": "126",
      "optionD": "254",
      "correctOption": "B",
      "explanation": "Core concept:\\n• Usable hosts per subnet = 2^h − 2 (subtract network and broadcast).\\n\\nSolution steps:\\n1. Mask 255.255.255.192 → host bits h = 6\\n2. Total addresses per subnet = 2^6 = 64\\n3. Usable hosts = 64 − 2 = 62\\n4. Matches Option B (62)\\n\\nOption breakdown:\\n• Option A — 30 — INCORRECT because that implies 5 host bits (2^5−2=30), not /26\\n• Option B — 62 — ✓ CORRECT — matches step 4 with h=6\\n• Option C — 126 — INCORRECT because /25 gives 126 usable, not /26\\n• Option D — 254 — INCORRECT because that is an unsubnetted Class C block\\n\\nCommon trap:\\n• Forgetting to subtract 2 for network and broadcast addresses.\\n\\nExam tip:\\n• /26 → 62 usable; /25 → 126; /24 → 254 — memorise the common /26 and /27 values.\\n\\nReferences: RFC 950; IBPS SO IT — IP Addressing & Subnetting",
      "solutionImageUrl": null,
      "topic": "NETWORKING",
      "topicTag": "IP Addressing & Subnetting",
      "orderIndex": ${startIdx}
    }
  ]
}

SELF-CHECK (every question before you send):
[ ] ${batchSize} questions; orderIndex ${startIdx}–${endIdx}
[ ] Valid JSON; no trailing commas
[ ] explanation ≥ 200 chars with exact section headers in correct order
[ ] Option breakdown has four • lines (A, B, C, D) with exactly one ✓ CORRECT
[ ] Calculation questions use Template A; Conceptual use Template B
[ ] Flowchart is optional — omit entirely when text explanation is enough
[ ] If Flowchart present: all Mermaid lines together under "Flowchart:" before References
[ ] No --> or graph TD inside numbered Solution steps
[ ] References: is the last line
`
}
