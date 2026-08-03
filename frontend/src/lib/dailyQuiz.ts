import html2canvas from 'html2canvas'
import { shareSitePath } from '@/lib/siteUrl'
import { whatsAppShareUrl } from '@/lib/shareSite'

export type DailyQuizQuestion = {
  id: number
  orderIndex: number
  topic: string
  sectionTitle: string
  subtopicTitle: string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
}

export type DailyQuiz = {
  quizDate: string
  title: string
  questionCount: number
  questions: DailyQuizQuestion[]
}

export type DailyQuizReview = {
  questionId: number
  orderIndex: number
  questionText: string
  selectedOption: string | null
  correctOption: string
  correct: boolean
  attempted: boolean
  explanation: string | null
  topic: string
}

export type DailyQuizResult = {
  quizDate: string
  correctCount: number
  wrongCount: number
  skippedCount: number
  totalQuestions: number
  scorePercent: number
  shareHeadline: string
  reviews: DailyQuizReview[]
}

export type DailyQuizShareData = {
  quizDate: string
  correctCount: number
  totalQuestions: number
  scorePercent: number
  shareHeadline: string
}

export type DailyQuizLocalProgress = {
  lastDate: string
  correctCount: number
  totalQuestions: number
  scorePercent: number
  streak: number
}

const PROGRESS_KEY = 'ioh_daily10_progress_v1'
const IST_MS = 5.5 * 60 * 60 * 1000

function istParts(now = Date.now()) {
  const ist = new Date(now + IST_MS)
  return {
    y: ist.getUTCFullYear(),
    m: ist.getUTCMonth(),
    d: ist.getUTCDate(),
  }
}

/** Today's calendar date in Asia/Kolkata as YYYY-MM-DD. */
export function istTodayIso(now = Date.now()): string {
  const { y, m, d } = istParts(now)
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function msUntilNextIstMidnight(now = Date.now()): number {
  const { y, m, d } = istParts(now)
  const nextMidnightUtc = Date.UTC(y, m, d + 1, 0, 0, 0) - IST_MS
  return Math.max(0, nextMidnightUtc - now)
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const min = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function prevIsoDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const utc = Date.UTC(y, m - 1, d) - 24 * 60 * 60 * 1000
  const dt = new Date(utc)
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`
}

export function loadDailyQuizProgress(): DailyQuizLocalProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DailyQuizLocalProgress
  } catch {
    return null
  }
}

export function saveDailyQuizCompletion(result: DailyQuizResult): DailyQuizLocalProgress {
  const prev = loadDailyQuizProgress()
  let streak = 1
  if (prev?.lastDate === result.quizDate) {
    streak = prev.streak
  } else if (prev && prev.lastDate === prevIsoDate(result.quizDate)) {
    streak = prev.streak + 1
  }
  const next: DailyQuizLocalProgress = {
    lastDate: result.quizDate,
    correctCount: result.correctCount,
    totalQuestions: result.totalQuestions,
    scorePercent: result.scorePercent,
    streak,
  }
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event('ioh-daily10-updated'))
  } catch {
    /* ignore quota */
  }
  return next
}

export function isDailyQuizDoneToday(quizDate?: string): boolean {
  const progress = loadDailyQuizProgress()
  if (!progress) return false
  return progress.lastDate === (quizDate ?? istTodayIso())
}

export function dailyQuizChallengePath(data: DailyQuizShareData): string {
  const params = new URLSearchParams({
    beat: String(data.correctCount),
    of: String(data.totalQuestions),
    date: data.quizDate,
  })
  return `/daily-quiz?${params.toString()}`
}

export type DailyQuizChallenge = {
  beat: number
  of: number
  date: string
}

export function parseDailyQuizChallenge(search: string): DailyQuizChallenge | null {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`)
  const beat = Number(params.get('beat'))
  const of = Number(params.get('of') ?? 10)
  const date = params.get('date') ?? ''
  if (!Number.isFinite(beat) || beat < 0 || !Number.isFinite(of) || of <= 0) return null
  return { beat, of, date }
}

export function buildDailyQuizShareText(data: DailyQuizShareData): string {
  const site = shareSitePath(dailyQuizChallengePath(data))
  return [
    '━━━━━━━━━━━━━━━━━━━━━━━━',
    '⚡  ItOfficerHub · Daily 10',
    '━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    data.shareHeadline,
    '',
    `📊  Score: ${data.correctCount}/${data.totalQuestions}  (${data.scorePercent}%)`,
    `📅  ${data.quizDate}`,
    '',
    '🔥  Can you beat my Daily 10?',
    'Free · no login · fresh questions every day',
    '',
    site,
    '━━━━━━━━━━━━━━━━━━━━━━━━',
  ].join('\n')
}

async function captureElement(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    backgroundColor: '#070b14',
    scale: 2,
    logging: false,
    useCORS: true,
    allowTaint: true,
    foreignObjectRendering: false,
  })
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.94))
  if (!blob) throw new Error('Could not create quiz image')
  return blob
}

export type ShareOutcome = 'shared' | 'saved' | 'text-only' | 'cancelled'

export async function shareDailyQuizCard(
  element: HTMLElement,
  data: DailyQuizShareData
): Promise<ShareOutcome> {
  const text = buildDailyQuizShareText(data)
  try {
    const blob = await captureElement(element)
    const file = new File([blob], 'itofficerhub-daily10.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file], text })) {
      try {
        await navigator.share({ title: 'ItOfficerHub Daily 10', text, files: [file] })
        return 'shared'
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
      }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `itofficerhub-daily10-${Date.now()}.png`
    a.click()
    URL.revokeObjectURL(url)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* ignore */
    }
    window.open(whatsAppShareUrl(text), '_blank', 'noopener,noreferrer')
    return 'saved'
  } catch {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* ignore */
    }
    window.open(whatsAppShareUrl(text), '_blank', 'noopener,noreferrer')
    return 'text-only'
  }
}

export async function copyDailyQuizShareText(data: DailyQuizShareData): Promise<void> {
  await navigator.clipboard.writeText(buildDailyQuizShareText(data))
}
