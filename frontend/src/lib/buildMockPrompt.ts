export function mockImportBatchSize(questionLimit: number, existingCount: number): number {
  return Math.max(0, questionLimit - existingCount)
}

/** Escape for single-line fields in prompt JSON examples. */
function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ')
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

  return 'NETWORKING, DBMS, OPERATING_SYSTEMS, SECURITY, WEB_TECHNOLOGIES, DATA_STRUCTURES (spread evenly)'
}

function exampleQuestionBlock(focusTopic: string | null): {
  topic: string
  topicTag: string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: string
  explanation: string
  explainA: string
  explainB: string
  explainC: string
  explainD: string
} {
  if (focusTopic === 'DATA_STRUCTURES') {
    return {
      topic: 'DATA_STRUCTURES',
      topicTag: 'Stacks & Queues',
      questionText: 'Which data structure is most suitable for implementing undo/redo operations in an application?',
      optionA: 'Queue',
      optionB: 'Stack',
      optionC: 'Binary tree',
      optionD: 'Hash table',
      correctOption: 'B',
      explanation: 'Undo/redo needs last-in-first-out access so the most recent action can be reversed first.',
      explainA: 'Queues are FIFO — the oldest item comes out first, which does not match undo order.',
      explainB: 'Stacks are LIFO — push/pop of recent actions fits undo/redo perfectly.',
      explainC: 'Trees organise hierarchical data; they are not required for simple sequential undo.',
      explainD: 'Hash tables optimise lookup by key, not ordered reversal of actions.',
    }
  }
  if (focusTopic === 'DBMS') {
    return {
      topic: 'DBMS',
      topicTag: 'Normalization & Keys',
      questionText: 'Which normal form removes partial dependency on a composite primary key?',
      optionA: '1NF',
      optionB: '2NF',
      optionC: '3NF',
      optionD: 'BCNF',
      correctOption: 'B',
      explanation: '2NF builds on 1NF by requiring every non-key attribute to depend on the whole composite key.',
      explainA: '1NF only removes repeating groups / ensures atomic values.',
      explainB: '2NF eliminates partial dependency on part of a composite key.',
      explainC: '3NF removes transitive dependency, not partial dependency.',
      explainD: 'BCNF is stricter than 3NF; it is not the form that introduces partial-dependency removal.',
    }
  }
  return {
    topic: focusTopic ?? 'NETWORKING',
    topicTag: focusTopic === 'NETWORKING' || !focusTopic ? 'IP Addressing & Subnetting' : 'Core concepts',
    questionText:
      focusTopic === 'NETWORKING' || !focusTopic
        ? 'A subnet mask 255.255.255.192 is used. How many usable host addresses are there per subnet?'
        : 'Sample question stem aligned to the mock title and description?',
    optionA: focusTopic === 'NETWORKING' || !focusTopic ? '30' : 'Option A text',
    optionB: focusTopic === 'NETWORKING' || !focusTopic ? '62' : 'Option B text',
    optionC: focusTopic === 'NETWORKING' || !focusTopic ? '126' : 'Option C text',
    optionD: focusTopic === 'NETWORKING' || !focusTopic ? '254' : 'Option D text',
    correctOption: 'B',
    explanation:
      focusTopic === 'NETWORKING' || !focusTopic
        ? 'Mask 255.255.255.192 is /26, so there are 6 host bits: 2^6 − 2 = 62 usable hosts.'
        : 'State the core rule in one or two sentences.',
    explainA:
      focusTopic === 'NETWORKING' || !focusTopic
        ? '30 usable hosts belong to /27 (5 host bits), not /26.'
        : 'Why A is wrong (one short sentence).',
    explainB:
      focusTopic === 'NETWORKING' || !focusTopic
        ? 'Correct: /26 → 64 addresses − network − broadcast = 62.'
        : 'Why B is correct (one short sentence).',
    explainC:
      focusTopic === 'NETWORKING' || !focusTopic
        ? '126 usable hosts belong to /25, not /26.'
        : 'Why C is wrong (one short sentence).',
    explainD:
      focusTopic === 'NETWORKING' || !focusTopic
        ? '254 usable hosts belong to /24, not /26.'
        : 'Why D is wrong (one short sentence).',
  }
}

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
  const ex = exampleQuestionBlock(focusTopic)

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
- Do NOT generate questions from unrelated chapters.
- topic / topicTag on each row must fit this mock's subject.

SYLLABUS TOPICS FOR THIS BATCH:
${topicDirective}

QUESTION RULES:
- Exactly ${batchSize} items in "questions"
- orderIndex: ${startIdx} through ${endIdx}
- 4 options A–D; exactly one correct (correctOption: "A"|"B"|"C"|"D")
- Every question MUST have "topic" (uppercase enum) AND "topicTag" (2–6 words)
- IBPS SO IT style; no duplicate stems
- Keep text short and plain — NO flowcharts, Mermaid, ASCII diagrams, or "References" sections

EXPLANATION FIELDS (simple — do not write long templates):
- "explanation": 1–3 sentences on why the correct answer is right
- "explainA", "explainB", "explainC", "explainD": one short sentence each (why that option is right or wrong)
- No other explanation format is required

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
      "optionA": "${esc(ex.optionA)}",
      "optionB": "${esc(ex.optionB)}",
      "optionC": "${esc(ex.optionC)}",
      "optionD": "${esc(ex.optionD)}",
      "correctOption": "${ex.correctOption}",
      "explanation": "${esc(ex.explanation)}",
      "explainA": "${esc(ex.explainA)}",
      "explainB": "${esc(ex.explainB)}",
      "explainC": "${esc(ex.explainC)}",
      "explainD": "${esc(ex.explainD)}",
      "topic": "${ex.topic}",
      "topicTag": "${esc(ex.topicTag)}",
      "orderIndex": ${startIdx}
    }
  ]
}

SELF-CHECK:
[ ] JSON title and description match MOCK METADATA exactly
[ ] All ${batchSize} questions match "${esc(title)}"
[ ] Every question has explanation + explainA + explainB + explainC + explainD
[ ] orderIndex ${startIdx}–${endIdx}; valid JSON only
`
}
