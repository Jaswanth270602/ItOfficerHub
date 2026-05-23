import { Bookmark, Circle, HelpCircle } from 'lucide-react'
import type { ExamLanguage } from '@/lib/examPreferences'

const COPY = {
  en: {
    marking: (c: number, w: number) => `+${c} / −${w} · 0 skip`,
    markingLong: (c: number, w: number) => `+${c} correct · −${w} wrong · 0 unattempted`,
    answered: 'Answered',
    notAnswered: 'Skipped',
    marked: 'Marked',
    markedAnswered: 'Ans+Mark',
    tip: 'Mark for review to revisit before submit.',
  },
  hi: {
    marking: (c: number, w: number) => `+${c} / −${w}`,
    markingLong: (c: number, w: number) => `+${c} सही · −${w} गलत`,
    answered: 'हल',
    notAnswered: 'छूटा',
    marked: 'समीक्षा',
    markedAnswered: 'हल+चिह्न',
    tip: 'समीक्षा चिह्न लगाएँ।',
  },
} as const

export function ExamDisclaimerStrip({
  lang,
  marksCorrect,
  marksWrong,
}: {
  lang: ExamLanguage
  marksCorrect: number
  marksWrong: number
}) {
  const t = COPY[lang]
  return (
    <div className="shrink-0 border-b border-amber-500/20 bg-amber-950/25 px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-amber-100/90">
      <div className="max-w-7xl mx-auto space-y-1.5 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1 sm:justify-between">
        <span className="font-medium text-amber-200/90 flex items-center gap-1">
          <HelpCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
          <span className="sm:hidden">{t.marking(marksCorrect, marksWrong)}</span>
          <span className="hidden sm:inline">{t.markingLong(marksCorrect, marksWrong)}</span>
        </span>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded bg-emerald-500 shrink-0" /> {t.answered}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded bg-slate-600 shrink-0" /> {t.notAnswered}
          </span>
          <span className="flex items-center gap-1">
            <Bookmark className="h-3 w-3 text-violet-400 shrink-0" /> {t.marked}
          </span>
          <span className="flex items-center gap-1">
            <Circle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-violet-300 fill-violet-500 shrink-0" /> {t.markedAnswered}
          </span>
        </div>
        <span className="text-amber-200/70 text-[10px] sm:text-xs block sm:inline">{t.tip}</span>
      </div>
    </div>
  )
}
