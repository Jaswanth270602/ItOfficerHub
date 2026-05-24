import html2canvas from 'html2canvas'
import { shareSitePath } from '@/lib/siteUrl'
import { whatsAppShareUrl } from '@/lib/shareSite'
import type { ScoreShareCardData } from '@/components/exam/ScoreShareCard'

export function buildScoreShareText(data: ScoreShareCardData): string {
  const site = shareSitePath('/')
  const cutoffLine = data.clearedCutoff
    ? `✅ Cutoff ${data.cutoffMarks} — CLEARED`
    : `📌 Cutoff ${data.cutoffMarks} — keep pushing`
  const pct = data.percentile != null ? Math.round(data.percentile) : '—'

  return [
    '━━━━━━━━━━━━━━━━━━━━━━━━',
    '🎯  ItOfficerHub · Mock Result',
    '━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    `📋  ${data.mockTitle}`,
    '',
    `📊  Net score: ${data.netScore.toFixed(2)} / ${data.maxMarks}`,
    `     ${cutoffLine}`,
    '',
    `✓  Correct: ${data.correctCount}   ✗  Wrong: ${data.wrongCount}   ○  Skipped: ${data.unattemptedCount}`,
    `⏱  Time: ${formatTime(data.timeTakenSeconds)}   ·   Accuracy: ${data.accuracy}%`,
    '',
    `🏆  Rank #${data.rank} of ${data.uniqueStudents} aspirants`,
    `📈  Percentile: ${pct}`,
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━',
    'Free daily IBPS SO IT mocks (no private report link):',
    site,
    '━━━━━━━━━━━━━━━━━━━━━━━━',
  ].join('\n')
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${sec}s`
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
  if (!blob) throw new Error('Could not create score image')
  return blob
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export type ShareScoreOutcome = 'shared' | 'saved' | 'text-only' | 'cancelled'

async function shareTextFallback(data: ScoreShareCardData): Promise<ShareScoreOutcome> {
  const text = buildScoreShareText(data)
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    /* clipboard optional */
  }
  window.open(whatsAppShareUrl(text), '_blank', 'noopener,noreferrer')
  return 'text-only'
}

/** Share score as PNG when possible — never includes /result/ attempt URLs. */
export async function shareScoreScreenshot(
  element: HTMLElement,
  data: ScoreShareCardData
): Promise<ShareScoreOutcome> {
  const text = buildScoreShareText(data)

  try {
    const blob = await captureElement(element)
    const file = new File([blob], 'itofficerhub-score.png', { type: 'image/png' })

    if (navigator.canShare?.({ files: [file], text })) {
      try {
        await navigator.share({
          title: 'ItOfficerHub mock score',
          text,
          files: [file],
        })
        return 'shared'
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
      }
    }

    downloadBlob(blob, `itofficerhub-score-${Date.now()}.png`)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* ignore */
    }
    window.open(whatsAppShareUrl(text), '_blank', 'noopener,noreferrer')
    return 'saved'
  } catch {
    return shareTextFallback(data)
  }
}

export async function copyScoreShareText(data: ScoreShareCardData): Promise<void> {
  await navigator.clipboard.writeText(buildScoreShareText(data))
}
