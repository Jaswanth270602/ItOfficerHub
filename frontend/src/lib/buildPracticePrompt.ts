export const PRACTICE_BATCH_SIZE = 20

export function buildPracticePrompt(sectionId: string, subtopicSlug: string, sectionTitle: string, subtopicTitle: string): string {
  return `You are a senior IBPS Specialist Officer (IT Officer) content author for ItOfficerHub Study Q&A.

TASK: Generate exactly ${PRACTICE_BATCH_SIZE} MCQs for ONE subtopic. Output ONLY valid JSON (no markdown fences, no commentary).

SUBTOPIC (use exactly):
- sectionId: "${sectionId}"
- subtopicSlug: "${subtopicSlug}"
- sectionTitle: "${sectionTitle}"
- subtopicTitle: "${subtopicTitle}"

RULES:
- Exactly ${PRACTICE_BATCH_SIZE} questions in the "questions" array
- 4 options A–D; exactly one correct (correctOption: "A"|"B"|"C"|"D")
- questionNumber: 1 through ${PRACTICE_BATCH_SIZE} on each item
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
      "questionNumber": 1,
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

Before output, self-check: ${PRACTICE_BATCH_SIZE} questions; questionNumber 1–${PRACTICE_BATCH_SIZE}; same sectionId and subtopicSlug on every row; each explanation has full option breakdown.

Admin import: paste JSON at ItOfficerHub → Admin → Practice Q&A → Import on subtopic "${subtopicTitle}".
`
}
