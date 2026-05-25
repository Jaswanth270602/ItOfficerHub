import {
  PRACTICE_INITIAL_TARGET_PER_SUBTOPIC,
  practiceImportBatchSize,
  practiceSectionTopicEnum,
} from '@/lib/practiceCatalog'

/** Max questions per Claude import batch (same as subtopic goal). */
export const PRACTICE_IMPORT_BATCH_SIZE = PRACTICE_INITIAL_TARGET_PER_SUBTOPIC

export function buildPracticePrompt(
  sectionId: string,
  subtopicSlug: string,
  sectionTitle: string,
  subtopicTitle: string,
  existingCount = 0
): string {
  const batchSize = practiceImportBatchSize(existingCount)
  const startNum = existingCount + 1
  const endNum = existingCount + batchSize
  const syllabusTopic = practiceSectionTopicEnum(sectionId)

  if (batchSize === 0) {
    return `This subtopic already has ${PRACTICE_INITIAL_TARGET_PER_SUBTOPIC} questions. No further imports needed unless you delete some first.`
  }

  return `You are a senior IBPS Specialist Officer (IT Officer) content author for ItOfficerHub Study Q&A.

CRITICAL: Reply with ONE raw JSON object only — first character { last character }. No markdown fences. No text before or after JSON.

TASK: Generate exactly ${batchSize} MCQs for ONE subtopic. Output ONLY valid JSON.

SUBTOPIC (use exactly):
- sectionId: "${sectionId}"
- subtopicSlug: "${subtopicSlug}"
- sectionTitle: "${sectionTitle}"
- subtopicTitle: "${subtopicTitle}" (display label only — do NOT put this in "topic")

SYLLABUS TOPIC (required on every question):
- "topic": "${syllabusTopic}" (uppercase enum for this section — same on all ${batchSize} rows)
- NEVER use subtopicTitle ("${subtopicTitle}") or sectionTitle as topic — import will fail
- You may omit "topic" entirely; the server defaults to ${syllabusTopic} for sectionId "${sectionId}"

EXISTING CONTENT: ${existingCount} question(s) already live — your batch APPENDS new questions only.

RULES:
- Exactly ${batchSize} questions in the "questions" array
- 4 options A–D; exactly one correct (correctOption: "A"|"B"|"C"|"D")
- questionNumber: ${startNum} through ${endNum} on each item (do NOT restart at 1)
- IBPS SO IT / PSU IT style; varied difficulty; no duplicate stems
- Every explanation: ≥300 characters, "Option breakdown:" with Option A, B, C, D individually, ✓ CORRECT marked
- For numerical questions include "Solution steps:" with numbered working
- Use \\n for line breaks in JSON explanations
- Flowchart optional; if used, keep all Mermaid lines under "Flowchart:" before References (or end with Exam tip only)

JSON SCHEMA:

{
  "sectionId": "${sectionId}",
  "subtopicSlug": "${subtopicSlug}",
  "questions": [
    {
      "sectionId": "${sectionId}",
      "subtopicSlug": "${subtopicSlug}",
      "questionNumber": ${startNum},
      "topic": "${syllabusTopic}",
      "questionText": "...",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctOption": "C",
      "explanation": "Core concept:\\n• ...\\n\\nOption breakdown:\\n• Option A — ...\\n• Option B — ...\\n• Option C — ✓ CORRECT — ...\\n• Option D — ...\\n\\nExam tip:\\n• ...\\n\\nReferences: IBPS SO IT — ${subtopicTitle}",
      "solutionImageUrl": null,
      "published": true
    }
  ]
}

SELF-CHECK before sending:
[ ] ${batchSize} questions; questionNumber ${startNum}–${endNum}
[ ] Every row: sectionId "${sectionId}", subtopicSlug "${subtopicSlug}"
[ ] Every row: topic is "${syllabusTopic}" (or field omitted) — NOT "${subtopicTitle}"
[ ] Option breakdown with A, B, C, D and one ✓ CORRECT
[ ] Valid JSON only

Admin import: paste JSON at ItOfficerHub → Admin → Practice Q&A → Import on "${subtopicTitle}".
`
}
