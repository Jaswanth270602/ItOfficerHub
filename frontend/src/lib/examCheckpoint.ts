import api from '@/lib/api'

export type CheckpointPayload = {
  answers: { questionId: number; selectedOption?: string | null; markedForReview?: boolean }[]
}

const CHECKPOINT_DEBOUNCE_MS = 90_000

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let lastCheckpointAt = 0

/** Debounced server checkpoint (optional recovery across devices). */
export function scheduleExamCheckpoint(attemptId: number, payload: CheckpointPayload): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    void flushExamCheckpoint(attemptId, payload, false)
  }, CHECKPOINT_DEBOUNCE_MS)
}

export function cancelExamCheckpointSchedule(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

/** Immediate checkpoint — used on tab hide / unload. */
export async function flushExamCheckpoint(
  attemptId: number,
  payload: CheckpointPayload,
  keepalive: boolean
): Promise<void> {
  const now = Date.now()
  if (!keepalive && now - lastCheckpointAt < 15_000) return
  lastCheckpointAt = now

  const body = JSON.stringify(payload)
  const token = localStorage.getItem('token')
  const base = (import.meta.env.VITE_API_URL?.trim() || '/api').replace(/\/$/, '')
  const url = `${base}/attempts/${attemptId}/checkpoint`

  if (keepalive && typeof fetch !== 'undefined') {
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
        keepalive: true,
      })
    } catch {
      /* best effort */
    }
    return
  }

  try {
    await api.post(`/attempts/${attemptId}/checkpoint`, payload)
  } catch {
    /* ignore — local draft is primary */
  }
}

export function buildCheckpointPayload(
  answers: Record<number, string>,
  marked: Record<number, boolean>
): CheckpointPayload {
  const ids = new Set([...Object.keys(answers), ...Object.keys(marked)].map(Number))
  return {
    answers: [...ids].map((questionId) => ({
      questionId,
      selectedOption: answers[questionId] ?? null,
      markedForReview: !!marked[questionId],
    })),
  }
}
