/** Extract and validate Claude/mock import JSON from pasted text (handles fences + chat prose). */

import {
  composeStoredExplanation,
  extractOptionExplains,
  hasAllOptionExplains,
  type OptionExplainMap,
  type OptionLetter,
} from '@/lib/composeExplanation'

const VALID_TOPICS = new Set([
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
  'VERBAL_ABILITY',
])

export type MockImportPayload = {
  title?: string
  description?: string
  difficulty?: string
  questions: Record<string, unknown>[]
  mockCategory?: string
  examTarget?: string
  seriesDay?: number | null
  questionCount?: number
  timeLimitMinutes?: number
}

export type ParseImportResult =
  | { ok: true; data: MockImportPayload; warnings: string[] }
  | { ok: false; message: string; hint?: string }

function stripFences(text: string): string {
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  }
  return cleaned
}

/** Brace-balanced slice starting at `{` index. */
function sliceBalancedObject(text: string, start: number): string | null {
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escape) escape = false
      else if (ch === '\\') escape = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

function extractJsonCandidates(text: string): string[] {
  const cleaned = stripFences(text)
  const candidates: string[] = []

  const questionsIdx = cleaned.search(/"questions"\s*:/)
  if (questionsIdx >= 0) {
    const braceStart = cleaned.lastIndexOf('{', questionsIdx)
    if (braceStart >= 0) {
      const slice = sliceBalancedObject(cleaned, braceStart)
      if (slice) candidates.push(slice)
    }
  }

  const first = cleaned.indexOf('{')
  const last = cleaned.lastIndexOf('}')
  if (first >= 0 && last > first) {
    const slice = sliceBalancedObject(cleaned, first) ?? cleaned.substring(first, last + 1)
    if (!candidates.includes(slice)) candidates.push(slice)
  }

  if (candidates.length === 0 && cleaned.startsWith('{')) candidates.push(cleaned)

  return candidates
}

function looksLikeChatProse(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    !/"questions"\s*:/.test(text) &&
    (lower.includes('here is') ||
      lower.includes("here's") ||
      lower.includes('getelementby') ||
      lower.includes('queryselector') ||
      lower.includes('let me') ||
      (text.length > 500 && !text.trimStart().startsWith('{')))
  )
}

function readOptionMap(q: Record<string, unknown>): OptionExplainMap {
  const nested = q.optionExplanations
  const fromNested: OptionExplainMap = {}
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    for (const letter of ['A', 'B', 'C', 'D'] as OptionLetter[]) {
      const v = (nested as Record<string, unknown>)[letter] ?? (nested as Record<string, unknown>)[letter.toLowerCase()]
      if (typeof v === 'string' && v.trim()) fromNested[letter] = v.trim()
    }
  }
  return {
    A: typeof q.explainA === 'string' ? q.explainA : fromNested.A,
    B: typeof q.explainB === 'string' ? q.explainB : fromNested.B,
    C: typeof q.explainC === 'string' ? q.explainC : fromNested.C,
    D: typeof q.explainD === 'string' ? q.explainD : fromNested.D,
  }
}

/** Normalize one question: compose explanation, drop nested helpers the API does not need. */
export function normalizeImportQuestion(raw: Record<string, unknown>, index: number): Record<string, unknown> {
  const optionMap = readOptionMap(raw)
  const legacyExp = typeof raw.explanation === 'string' ? raw.explanation : ''
  const fromLegacy = extractOptionExplains(legacyExp)
  const merged: OptionExplainMap = {
    A: optionMap.A || fromLegacy.A,
    B: optionMap.B || fromLegacy.B,
    C: optionMap.C || fromLegacy.C,
    D: optionMap.D || fromLegacy.D,
  }

  const explanation = composeStoredExplanation({
    explanation: legacyExp,
    explainA: merged.A,
    explainB: merged.B,
    explainC: merged.C,
    explainD: merged.D,
  })

  const orderIndex =
    typeof raw.orderIndex === 'number' && Number.isFinite(raw.orderIndex) ? raw.orderIndex : index + 1

  return {
    questionText: raw.questionText,
    optionA: raw.optionA,
    optionB: raw.optionB,
    optionC: raw.optionC,
    optionD: raw.optionD,
    correctOption: String(raw.correctOption ?? '').trim().toUpperCase(),
    explanation,
    explainA: merged.A ?? null,
    explainB: merged.B ?? null,
    explainC: merged.C ?? null,
    explainD: merged.D ?? null,
    solutionImageUrl: raw.solutionImageUrl ?? null,
    topic: typeof raw.topic === 'string' ? raw.topic.trim().toUpperCase() : raw.topic,
    topicTag: raw.topicTag ?? null,
    orderIndex,
  }
}

function validateQuestions(questions: unknown[]): { warnings: string[]; errors: string[] } {
  const warnings: string[] = []
  const errors: string[] = []

  if (questions.length === 0) {
    errors.push('The "questions" array is empty.')
    return { warnings, errors }
  }

  questions.forEach((raw, i) => {
    const q = raw as Record<string, unknown>
    const n = i + 1
    if (!q.questionText || String(q.questionText).trim().length < 5) {
      errors.push(`Question ${n}: missing or too short "questionText".`)
    }
    for (const key of ['optionA', 'optionB', 'optionC', 'optionD'] as const) {
      if (!q[key] || !String(q[key]).trim()) errors.push(`Question ${n}: missing "${key}".`)
    }
    const co = String(q.correctOption ?? '').trim().toUpperCase()
    if (!['A', 'B', 'C', 'D'].includes(co)) {
      errors.push(`Question ${n}: correctOption must be A, B, C, or D.`)
    }
    const topic = String(q.topic ?? '').trim().toUpperCase()
    if (!topic) errors.push(`Question ${n}: "topic" is required.`)
    else if (!VALID_TOPICS.has(topic)) warnings.push(`Question ${n}: topic "${topic}" may be rejected by server.`)

    const optionMap = readOptionMap(q)
    const legacyExp = String(q.explanation ?? '')
    const merged = {
      A: optionMap.A || extractOptionExplains(legacyExp).A,
      B: optionMap.B || extractOptionExplains(legacyExp).B,
      C: optionMap.C || extractOptionExplains(legacyExp).C,
      D: optionMap.D || extractOptionExplains(legacyExp).D,
    }
    const main = legacyExp.trim()
    if (!main && !hasAllOptionExplains(merged)) {
      errors.push(`Question ${n}: add "explanation" plus explainA–explainD (or optionExplanations).`)
    } else if (!hasAllOptionExplains(merged)) {
      errors.push(`Question ${n}: need explainA, explainB, explainC, and explainD (one short reason each).`)
    } else if (!main) {
      warnings.push(`Question ${n}: missing short "explanation" — using option reasons only.`)
    }
  })

  return { warnings, errors }
}

export function normalizeQuestionOrder(questions: Record<string, unknown>[]): Record<string, unknown>[] {
  return questions.map((q, i) => normalizeImportQuestion(q, i))
}

export function parseMockImportJson(raw: string): ParseImportResult {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { ok: false, message: 'Paste the JSON from Claude first.', hint: 'Copy prompt → paste in Claude → copy only the JSON output.' }
  }

  if (looksLikeChatProse(trimmed)) {
    return {
      ok: false,
      message: 'This looks like Claude’s chat text, not import JSON.',
      hint: 'In Claude, ask it to output ONLY the JSON object (no intro). Or click “Copy code” on the JSON block if shown.',
    }
  }

  const candidates = extractJsonCandidates(trimmed)
  let lastSyntax: string | undefined

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>
      const questions = parsed.questions
      if (!questions || !Array.isArray(questions)) {
        return {
          ok: false,
          message: 'JSON must contain a "questions" array.',
          hint: 'Use the Copy Claude prompt button — do not paste partial snippets.',
        }
      }
      const { warnings, errors } = validateQuestions(questions)
      if (errors.length > 0) {
        return {
          ok: false,
          message: errors[0],
          hint: errors.length > 1 ? `${errors.length - 1} more issue(s) — fix and try again.` : undefined,
        }
      }
      const normalized = normalizeQuestionOrder(questions as Record<string, unknown>[])

      return {
        ok: true,
        data: {
          title: typeof parsed.title === 'string' ? parsed.title : undefined,
          description: typeof parsed.description === 'string' ? parsed.description : undefined,
          difficulty: typeof parsed.difficulty === 'string' ? parsed.difficulty : undefined,
          questions: normalized,
          mockCategory: typeof parsed.mockCategory === 'string' ? parsed.mockCategory : undefined,
          examTarget: typeof parsed.examTarget === 'string' ? parsed.examTarget : undefined,
          seriesDay: typeof parsed.seriesDay === 'number' ? parsed.seriesDay : null,
          questionCount: typeof parsed.questionCount === 'number' ? parsed.questionCount : undefined,
          timeLimitMinutes: typeof parsed.timeLimitMinutes === 'number' ? parsed.timeLimitMinutes : undefined,
        },
        warnings,
      }
    } catch (e) {
      lastSyntax = e instanceof Error ? e.message : 'Invalid JSON'
    }
  }

  return {
    ok: false,
    message: lastSyntax ?? 'Could not parse JSON.',
    hint: 'Remove markdown fences. Output must start with { and include "questions": [...].',
  }
}
