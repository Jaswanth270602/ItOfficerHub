/** Client-side exam draft — avoids per-answer DB calls during the mock. */

export type ExamDraft = {
  attemptId: number
  mockId: number
  answers: Record<number, string>
  marked: Record<number, boolean>
  secondsLeft: number
  current: number
  savedAt: number
}

const key = (attemptId: number) => `itoh_exam_draft_${attemptId}`

export function loadExamDraft(attemptId: number): ExamDraft | null {
  try {
    const raw = localStorage.getItem(key(attemptId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ExamDraft
    if (parsed.attemptId !== attemptId) return null
    return parsed
  } catch {
    return null
  }
}

export function saveExamDraft(draft: ExamDraft): void {
  try {
    localStorage.setItem(key(draft.attemptId), JSON.stringify({ ...draft, savedAt: Date.now() }))
  } catch {
    /* quota / private mode */
  }
}

export function clearExamDraft(attemptId: number): void {
  try {
    localStorage.removeItem(key(attemptId))
  } catch {
    /* ignore */
  }
}
