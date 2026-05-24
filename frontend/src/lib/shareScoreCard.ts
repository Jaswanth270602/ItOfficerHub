import html2canvas from 'html2canvas'
import { shareSitePath } from '@/lib/siteUrl'
import { whatsAppShareUrl } from '@/lib/shareSite'
import type { ScoreShareCardData } from '@/components/exam/ScoreShareCard'

export function buildScoreShareText(data: ScoreShareCardData): string {
  const site = shareSitePath('/')
  const cutoffLine = data.clearedCutoff
    ? `Cutoff ${data.cutoffMarks} ✅ cleared`
    : `Cutoff ${data.cutoffMarks} — keep practicing`
  const pct = data.percentile != null ? Math.round(data.percentile) : '—'

  return [
    '🎯 IBPS SO IT Officer Mock Result',
    '',
    data.mockTitle,
    `Net score: ${data.netScore.toFixed(2)} / ${data.maxMarks}`,
    cutoffLine,
    `Correct ${data.correctCount} · Wrong ${data.wrongCount} · Skipped ${data.unattemptedCount}`,
    `Rank #${data.rank} of ${data.uniqueStudents} · Percentile ${pct}`,
    '',
    'Score card image attached — no private report link.',
    `Free daily mocks: ${site}`,
  ].join('\n')
}

async function captureElement(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    backgroundColor: '#070b14',
    scale: 2,
    logging: false,
    useCORS: true,
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

export type ShareScoreOutcome = 'shared' | 'saved' | 'cancelled'

/** Share score as PNG only — never includes /result/ attempt URLs. */
export async function shareScoreScreenshot(
  element: HTMLElement,
  data: ScoreShareCardData
): Promise<ShareScoreOutcome> {
  const text = buildScoreShareText(data)
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
  window.open(whatsAppShareUrl(text), '_blank', 'noopener,noreferrer')
  return 'saved'
}

export async function copyScoreShareText(data: ScoreShareCardData): Promise<void> {
  await navigator.clipboard.writeText(buildScoreShareText(data))
}

export async function copyScoreScreenshot(element: HTMLElement): Promise<void> {
  const blob = await captureElement(element)
  if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      return
    } catch {
      /* fall through to download */
    }
  }
  downloadBlob(blob, `itofficerhub-score-${Date.now()}.png`)
}
