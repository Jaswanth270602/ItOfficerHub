import {
  PRACTICE_INITIAL_TARGET_PER_SUBTOPIC,
  practiceImportBatchSize,
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

  if (batchSize === 0) {
    return `This subtopic already has ${PRACTICE_INITIAL_TARGET_PER_SUBTOPIC} questions. No further imports needed unless you delete some first.`
  }

  return `You are a senior IBPS Specialist Officer (IT Officer) content author for ItOfficerHub Study Q&A.

TASK: Generate exactly ${batchSize} MCQs for ONE subtopic. Output ONLY valid JSON (no markdown fences, no commentary).

SUBTOPIC (use exactly):
- sectionId: "${sectionId}"
- subtopicSlug: "${subtopicSlug}"
- sectionTitle: "${sectionTitle}"
- subtopicTitle: "${subtopicTitle}"

EXISTING CONTENT: ${existingCount} question(s) already live — your batch APPENDS new questions only.

RULES:
- Exactly ${batchSize} questions in the "questions" array
- 4 options A–D; exactly one correct (correctOption: "A"|"B"|"C"|"D")
- questionNumber: ${startNum} through ${endNum} on each item (do NOT restart at 1)
- IBPS SO IT / PSU IT style; varied difficulty; no duplicate stems
- Every explanation: ≥300 characters, "Option breakdown:" with Option A, B, C, D individually, ✓ CORRECT marked
- For numerical questions include "Solution steps:" with numbered working
- Use \\n for line breaks in JSON explanations

JSON SCHEMA:

{
  "sectionId": "${sectionId}",
  "subtopicSlug": "${subtopicSlug}",
  "questions": [
    {
      "sectionId": "${sectionId}",
      "subtopicSlug": "${subtopicSlug}",
      "questionNumber": ${startNum},
      "topic": "NETWORKING",
      "questionText": "...",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "correctOption": "C",
      "explanation": "Core concept:\\n• ...\\n\\nOption breakdown:\\n• Option A — ...\\n• Option B — ...\\n• Option C — ✓ CORRECT — ...\\n• Option D — ...\\n\\nExam tip:\\n• ...",
      "solutionImageUrl": null,
      "published": true
    }
  ]
}

Before output, self-check: ${batchSize} questions; questionNumber ${startNum}–${endNum}; same sectionId and subtopicSlug on every row; each explanation has full option breakdown.

Admin import: paste JSON at ItOfficerHub → Admin → Practice Q&A → Import on subtopic "${subtopicTitle}".
`
}
