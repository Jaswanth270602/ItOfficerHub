import { Bookmark, Circle, HelpCircle } from 'lucide-react'
import type { ExamLanguage } from '@/lib/examPreferences'

const COPY = {
  en: {
    marking: (c: number, w: number) => `+${c} correct · −${w} wrong · 0 unattempted`,
    answered: 'Answered',
    notAnswered: 'Not answered',
    marked: 'Marked for review',
    markedAnswered: 'Answered + marked',
    tip: 'Mark for review to revisit before submit — does not lock your answer.',
  },
  hi: {
    marking: (c: number, w: number) => `+${c} सही · −${w} गलत · 0 छूटा`,
    answered: 'हल किया',
    notAnswered: 'अनुत्तरित',
    marked: 'समीक्षा के लिए',
    markedAnswered: 'हल + समीक्षा',
    tip: 'समीक्षा चिह्न लगाएँ — जमा करने से पहले दोबारा देख सकते हैं।',
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
    <div className="shrink-0 border-b border-amber-500/20 bg-amber-950/25 px-3 py-2 text-[11px] md:text-xs text-amber-100/90">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-4 gap-y-1 justify-between">
        <span className="font-medium text-amber-200/90 flex items-center gap-1">
          <HelpCircle className="h-3.5 w-3.5" />
          {t.marking(marksCorrect, marksWrong)}
        </span>
        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> {t.answered}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-600" /> {t.notAnswered}
          </span>
          <span className="flex items-center gap-1">
            <Bookmark className="h-3 w-3 text-violet-400" /> {t.marked}
          </span>
          <span className="flex items-center gap-1">
            <Circle className="h-3 w-3 text-violet-300 fill-violet-500" /> {t.markedAnswered}
          </span>
        </div>
        <span className="text-amber-200/70 hidden lg:inline">{t.tip}</span>
      </div>
    </div>
  )
}
