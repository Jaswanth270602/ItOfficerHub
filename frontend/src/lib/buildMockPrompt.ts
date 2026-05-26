export function mockImportBatchSize(questionLimit: number, existingCount: number): number {
  return Math.max(0, questionLimit - existingCount)
}

/** Escape for single-line fields in prompt JSON examples. */
function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ')
}

/** Escape multi-line explanation for JSON example inside the prompt. */
function escJson(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r\n/g, '\n').replace(/\n/g, '\\n').replace(/\r/g, '')
}

const TOPIC_INFERENCE: { topic: string; label: string; keywords: string[] }[] = [
  { topic: 'DATA_STRUCTURES', label: 'Data Structures', keywords: ['data structure', 'data structures', 'algorithm', 'sorting', 'linked list', 'binary tree', 'graph', 'bfs', 'dfs', 'stack', 'queue', 'heap', 'hash table'] },
  { topic: 'DBMS', label: 'DBMS', keywords: ['dbms', 'sql', 'normalization', 'transaction', 'acid', 'indexing', 'er diagram', 'relational', 'join', 'query'] },
  { topic: 'NETWORKING', label: 'Networking', keywords: ['networking', 'subnet', 'tcp', 'udp', 'osi', 'ip address', 'routing', 'dns', 'dhcp', 'firewall', 'vlan'] },
  { topic: 'OPERATING_SYSTEMS', label: 'Operating Systems', keywords: ['operating system', 'operating systems', 'deadlock', 'scheduling', 'paging', 'virtual memory', 'process', 'thread', 'semaphore'] },
  { topic: 'SECURITY', label: 'Security', keywords: ['security', 'encryption', 'malware', 'owasp', 'authentication', 'cipher', 'hashing attack'] },
  { topic: 'WEB_TECHNOLOGIES', label: 'Web Technologies', keywords: ['web technolog', 'http', 'html', 'css', 'javascript', 'rest api', 'cookie', 'session', 'jwt'] },
  { topic: 'COMPUTER_ORGANIZATION', label: 'Computer Organization', keywords: ['computer organization', 'cpu', 'cache', 'pipeline', 'instruction cycle', 'register', 'microprogram'] },
  { topic: 'SOFTWARE_ENGINEERING', label: 'Software Engineering', keywords: ['software engineering', 'sdlc', 'agile', 'scrum', 'uml', 'testing', 'unit test'] },
  { topic: 'CLOUD_COMPUTING', label: 'Cloud Computing', keywords: ['cloud computing', 'iaas', 'paas', 'saas', 'virtualization', 'container', 'docker', 'kubernetes'] },
  { topic: 'DIGITAL_ELECTRONICS', label: 'Digital Electronics', keywords: ['digital electronics', 'boolean', 'logic gate', 'k-map', 'flip flop', 'number system'] },
  { topic: 'QUANTITATIVE_APTITUDE', label: 'Quantitative Aptitude', keywords: ['quantitative', 'percentage', 'profit', 'loss', 'ratio', 'time and work', 'aptitude'] },
  { topic: 'LOGICAL_REASONING', label: 'Logical Reasoning', keywords: ['logical reasoning', 'syllogism', 'blood relation', 'seating arrangement'] },
  { topic: 'VERBAL_ABILITY', label: 'Verbal Ability', keywords: ['verbal ability', 'reading comprehension', 'grammar', 'vocabulary'] },
]

export function inferMockTopicFocus(title: string, description: string): string | null {
  const text = `${title} ${description}`.toLowerCase()
  for (const row of TOPIC_INFERENCE) {
    if (row.keywords.some((k) => text.includes(k))) return row.topic
  }
  return null
}

function buildTopicDirective(
  batchSize: number,
  mockCategory: string,
  focusTopic: string | null,
  customTopics?: string
): string {
  if (customTopics?.trim()) return customTopics.trim()

  if (focusTopic) {
    const label = TOPIC_INFERENCE.find((r) => r.topic === focusTopic)?.label ?? focusTopic
    if (mockCategory === 'SECTIONAL' || mockCategory === 'PYQ') {
      return `ALL ${batchSize} questions MUST use topic "${focusTopic}" only (${label} sectional — from mock title/description). Use varied topicTag values within ${label} (e.g. different sub-chapters).`
    }
    return `Primary focus: ${focusTopic} (${label}) — at least ${Math.max(1, Math.floor(batchSize * 0.7))} of ${batchSize} questions on ${focusTopic}; remaining may be closely related IT topics only if needed for variety.`
  }

  if (mockCategory === 'SECTIONAL') {
    return `Derive the single syllabus topic from the mock TITLE and DESCRIPTION above. Use that topic enum on EVERY question (do not mix unrelated chapters).`
  }

  return 'NETWORKING, DBMS, OPERATING_SYSTEMS, SECURITY, WEB_TECHNOLOGIES, DATA_STRUCTURES (spread evenly, 2–4 Q each unless title implies one subject)'
}

function exampleQuestionBlock(focusTopic: string | null, startIdx: number): {
  topic: string
  topicTag: string
  questionText: string
  explanation: string
} {
  if (focusTopic === 'DATA_STRUCTURES') {
    return {
      topic: 'DATA_STRUCTURES',
      topicTag: 'Stacks & Queues',
      questionText: 'Which data structure is most suitable for implementing undo/redo operations in an application?',
      explanation:
        'Core concept:\\n• Undo/redo needs LIFO access to the most recent action first.\\n\\nOption breakdown:\\n• Option A — Queue — INCORRECT because queues are FIFO, not LIFO\\n• Option B — Stack — ✓ CORRECT — stacks provide LIFO push/pop ideal for undo\\n• Option C — Binary tree — INCORRECT because trees are not required for simple sequential undo\\n• Option D — Hash table — INCORRECT because hashing solves lookup, not ordered reversal\\n\\nKey distinction:\\n• Stack = LIFO; Queue = FIFO — do not swap in MCQs\\n\\nExam tip:\\n• Undo/redo, DFS, expression evaluation → think Stack first\\n\\nReferences: CLRS; IBPS SO IT — Data Structures',
    }
  }
  if (focusTopic === 'DBMS') {
    return {
      topic: 'DBMS',
      topicTag: 'Normalization & Keys',
      questionText: 'Which normal form removes partial dependency on a composite primary key?',
      explanation:
        'Core concept:\\n• 2NF applies when a table is in 1NF and non-key attributes depend on the whole key.\\n\\nOption breakdown:\\n• Option A — 1NF — INCORRECT because 1NF only removes repeating groups\\n• Option B — 2NF — ✓ CORRECT — eliminates partial dependency on part of a composite key\\n• Option C — 3NF — INCORRECT because 3NF removes transitive dependency\\n• Option D — BCNF — INCORRECT because BCNF is stricter than 3NF\\n\\nExam tip:\\n• Partial → 2NF; Transitive → 3NF\\n\\nReferences: Codd normal forms; IBPS SO IT — DBMS',
    }
  }
  // Default networking example only when focus is networking or unknown full mock
  return {
    topic: focusTopic ?? 'NETWORKING',
    topicTag: focusTopic === 'NETWORKING' || !focusTopic ? 'IP Addressing & Subnetting' : 'Core concepts',
    questionText:
      focusTopic === 'NETWORKING' || !focusTopic
        ? 'A subnet mask 255.255.255.192 is used on network 192.168.10.0/24. How many usable host addresses per subnet?'
        : 'Sample question stem aligned to the mock title and description?',
    explanation:
      focusTopic === 'NETWORKING' || !focusTopic
        ? 'Core concept:\\n• Usable hosts = 2^h − 2.\\n\\nSolution steps:\\n1. /26 mask gives h = 6 host bits\\n2. 2^6 = 64 addresses\\n3. Usable = 64 − 2 = 62\\n4. Matches Option B\\n\\nOption breakdown:\\n• Option A — 30 — INCORRECT\\n• Option B — 62 — ✓ CORRECT\\n• Option C — 126 — INCORRECT\\n• Option D — 254 — INCORRECT\\n\\nCommon trap:\\n• Forgetting to subtract network and broadcast\\n\\nExam tip:\\n• /26 → 62 usable hosts\\n\\nReferences: RFC 950; IBPS SO IT — Networking'
        : 'Core concept:\\n• ...\\n\\nOption breakdown:\\n• Option A — ... — INCORRECT\\n• Option B — ... — INCORRECT\\n• Option C — ✓ CORRECT — ...\\n• Option D — ... — INCORRECT\\n\\nExam tip:\\n• ...\\n\\nReferences: IBPS SO IT syllabus',
  }
}

/** Shared explanation rules — imported mocks render section-by-section in the result UI. */
const EXPLANATION_RULES = `
EXPLANATION FORMAT (mandatory — the app parses section headers; wrong order breaks the UI):

Use literal \\\\n between lines in JSON. Put a blank line (\\\\n\\\\n) between every section.

Pick exactly ONE template per question. Copy section headers verbatim (same spelling, trailing colon).

━━━ TEMPLATE A — Calculation / numerical ━━━
Core concept → Solution steps (numbered, no →/--> on steps) → Option breakdown → Common trap → Exam tip → References

━━━ TEMPLATE B — Conceptual ━━━
Core concept → Option breakdown → Key distinction → Exam tip → References (Flowchart optional before References)

━━━ GLOBAL ━━━
- Minimum 200 characters per explanation; four options in Option breakdown; one ✓ CORRECT; References: last line
- Flowchart optional (~30–50% of conceptual Qs only); never fake diagrams
`

export function buildMockPrompt(opts: {
  title: string
  description?: string
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
  const mockCategory = opts.mockCategory ?? 'FULL'
  const title = opts.title.trim()
  const description = (opts.description ?? '').trim() || `IBPS SO IT — ${title}`
  const focusTopic = inferMockTopicFocus(title, description)
  const topicDirective = buildTopicDirective(batchSize, mockCategory, focusTopic, opts.topics)
  const ex = exampleQuestionBlock(focusTopic, startIdx)

  if (batchSize === 0) {
    return `This mock already has ${opts.questionLimit} questions (limit reached). Increase question limit in mock settings or delete questions first.`
  }

  return `You are a senior IBPS Specialist Officer (IT Officer) content author for ItOfficerHub.

CRITICAL OUTPUT RULES (import will FAIL otherwise):
1. Reply with ONE raw JSON object only — first character must be { and last character must be }.
2. Do NOT wrap in markdown code fences. Do NOT write any text before or after the JSON.
3. Do NOT explain, summarise, or chat — only the JSON object.
4. If you cannot comply, output exactly: {"error":"cannot generate"}

TASK: Generate exactly ${batchSize} MCQs inside "questions".

MOCK METADATA (copy into JSON exactly — do not invent different title/description):
- title: "${esc(title)}"
- description: "${esc(description)}"
- difficulty: ${opts.difficulty}
- examTarget: ${opts.examTarget ?? 'IBPS_SO_IT'}
- mockCategory: ${mockCategory}
- questionCount: ${opts.questionLimit}

CONTENT SCOPE (mandatory):
- Every question MUST match the mock title and description above.
- Do NOT generate questions from unrelated chapters (e.g. no networking/subnetting if the mock is Data Structures).
- topic / topicTag on each row must fit this mock's subject.

SYLLABUS TOPICS FOR THIS BATCH:
${topicDirective}

QUESTION RULES:
- Exactly ${batchSize} items in "questions"
- orderIndex: ${startIdx} through ${endIdx}
- 4 options A–D; exactly one correct (correctOption: "A"|"B"|"C"|"D")
- Every question MUST have "topic" (uppercase enum) AND "topicTag" (2–6 words, specific sub-topic)
- IBPS SO IT style; no duplicate stems
${EXPLANATION_RULES}
VALID topic enum values:
NETWORKING, DBMS, OPERATING_SYSTEMS, SECURITY, WEB_TECHNOLOGIES, DATA_STRUCTURES, COMPUTER_ORGANIZATION, SOFTWARE_ENGINEERING, CLOUD_COMPUTING, DIGITAL_ELECTRONICS, QUANTITATIVE_APTITUDE, LOGICAL_REASONING, VERBAL_ABILITY

JSON TEMPLATE (use exact title/description above; example row shows format for THIS mock's subject):

{
  "title": "${esc(title)}",
  "description": "${esc(description)}",
  "difficulty": "${opts.difficulty}",
  "questionCount": ${opts.questionLimit},
  "mockCategory": "${mockCategory}",
  "examTarget": "${opts.examTarget ?? 'IBPS_SO_IT'}",
  "questions": [
    {
      "questionText": "${esc(ex.questionText)}",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctOption": "B",
      "explanation": "${escJson(ex.explanation)}",
      "solutionImageUrl": null,
      "topic": "${ex.topic}",
      "topicTag": "${esc(ex.topicTag)}",
      "orderIndex": ${startIdx}
    }
  ]
}

SELF-CHECK:
[ ] JSON title and description match MOCK METADATA exactly
[ ] All ${batchSize} questions match "${esc(title)}" — not random mixed syllabus
[ ] topic field follows SYLLABUS TOPICS FOR THIS BATCH
[ ] orderIndex ${startIdx}–${endIdx}; valid JSON; Option breakdown on every question
`
}
