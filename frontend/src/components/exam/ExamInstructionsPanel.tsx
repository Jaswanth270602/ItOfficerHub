import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ExamLanguage } from '@/lib/examPreferences'
import { Bookmark, Clock, Flag, Lock, Maximize2, ShieldAlert } from 'lucide-react'
import { ShareMockButton } from '@/components/exam/ShareMockButton'

interface Props {
  title: string
  questionCount: number
  timeLimitMinutes: number
  marksCorrect: number
  marksWrong: number
  lang: ExamLanguage
  onLangChange: (lang: ExamLanguage) => void
  rulesAcknowledged: boolean
  onRulesAckChange: (v: boolean) => void
  submitError?: string
  onStart: () => void
  mockId?: number
}

const TEXT = {
  en: {
    heading: 'Instructions & exam pattern',
    secure: 'Secure exam mode',
    start: 'I have read the instructions — enter fullscreen & start',
    lang: 'Question language',
    ack: 'I understand the marking scheme, palette colours, and auto-submit rules.',
    sections: [
      {
        title: 'Marking scheme',
        icon: 'flag' as const,
        items: [
          'Each correct answer earns positive marks (+P).',
          'Each wrong answer loses negative marks (−N).',
          'Unattempted questions score zero — no negative marking.',
        ],
      },
      {
        title: 'Question palette',
        icon: 'palette' as const,
        items: [
          'Green — answered',
          'Grey — not answered',
          'Purple — marked for review (you can still change the answer)',
          'Mark for review does NOT submit the question; use it to revisit before final submit.',
          '"Mark & next" saves the flag and moves to the next question.',
        ],
      },
      {
        title: 'Timer & submission',
        icon: 'clock' as const,
        items: [
          'Timer starts when you enter fullscreen.',
          'You may submit anytime from the top-right Submit button.',
          'When time ends, the test auto-submits with saved answers.',
        ],
      },
      {
        title: 'Proctoring (strict)',
        icon: 'lock' as const,
        items: [
          'Fullscreen is required. Exiting fullscreen auto-submits your test.',
          'Switching tabs or minimizing the window auto-submits your test.',
          'Rankings use your best score; retakes do not replace leaderboard best.',
        ],
      },
    ],
  },
  hi: {
    heading: 'निर्देश और परीक्षा पैटर्न',
    secure: 'सुरक्षित परीक्षा मोड',
    start: 'मैंने निर्देश पढ़ लिए — फुलस्क्रीन में शुरू करें',
    lang: 'प्रश्न भाषा',
    ack: 'मैं अंकन, पैलेट रंग और ऑटो-सबमिट नियम समझता/समझती हूँ।',
    sections: [
      {
        title: 'अंकन',
        icon: 'flag' as const,
        items: [
          'सही उत्तर पर + अंक।',
          'गलत उत्तर पर − अंक (नकारात्मक अंकन)।',
          'छूटे प्रश्न पर 0 अंक।',
        ],
      },
      {
        title: 'प्रश्न पैलेट',
        icon: 'palette' as const,
        items: [
          'हरा — उत्तर दिया',
          'धूसर — अनुत्तरित',
          'बैंगनी — समीक्षा के लिए चिह्नित',
          'समीक्षा चिह्न उत्तर लॉक नहीं करता।',
        ],
      },
      {
        title: 'समय',
        icon: 'clock' as const,
        items: ['फुलस्क्रीन के बाद टाइमर शुरू।', 'कभी भी Submit से जमा करें।', 'समय समाप्त पर ऑटो-सबमिट।'],
      },
      {
        title: 'नियम',
        icon: 'lock' as const,
        items: ['फुलस्क्रीन छोड़ने पर ऑटो-सबमिट।', 'टैब बदलने पर ऑटो-सबमिट।'],
      },
    ],
  },
} as const

function SectionIcon({ type }: { type: 'flag' | 'palette' | 'clock' | 'lock' }) {
  if (type === 'flag') return <Flag className="h-4 w-4 text-amber-400 shrink-0" />
  if (type === 'palette') return <Bookmark className="h-4 w-4 text-violet-400 shrink-0" />
  if (type === 'clock') return <Clock className="h-4 w-4 text-neon-cyan shrink-0" />
  return <Lock className="h-4 w-4 text-red-400 shrink-0" />
}

export function ExamInstructionsPanel({
  title,
  questionCount,
  timeLimitMinutes,
  marksCorrect,
  marksWrong,
  lang,
  onLangChange,
  rulesAcknowledged,
  onRulesAckChange,
  submitError,
  onStart,
  mockId,
}: Props) {
  const t = TEXT[lang]

  return (
    <div className="fixed inset-0 z-50 bg-[#070b14] overflow-y-auto overscroll-y-contain">
      <div className="min-h-dvh flex flex-col items-center px-3 sm:px-6 py-4 sm:py-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-4xl w-full rounded-2xl border border-cyber-600 bg-gradient-to-b from-cyber-900 to-cyber-950 shadow-2xl relative">
          {mockId != null && (
            <ShareMockButton mockId={mockId} mockTitle={title} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10" />
          )}

          <header className="p-5 sm:p-6 md:p-8 border-b border-cyber-700 text-center pr-14 sm:pr-16">
            <ShieldAlert className="h-11 w-11 sm:h-12 sm:w-12 text-neon-cyan mx-auto mb-3" />
            <p className="text-xs uppercase tracking-widest text-neon-cyan">{t.secure}</p>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-2">{t.heading}</h1>
            <p className="text-slate-400 text-sm mt-2 break-words px-1">
              {title} · {questionCount} Q · {timeLimitMinutes} min · P +{marksCorrect} / N −{marksWrong}
            </p>
          </header>

          <div className="px-5 sm:px-6 md:px-8 py-4 sm:py-5 border-b border-cyber-800">
            <p className="text-xs font-medium text-slate-400 mb-2">{t.lang}</p>
            <div className="flex flex-wrap gap-2">
              {(['en', 'hi'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onLangChange(code)}
                  className={cn(
                    'px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer border transition-colors min-h-[44px]',
                    lang === code
                      ? 'border-neon-cyan bg-neon-cyan/15 text-neon-cyan'
                      : 'border-cyber-600 text-slate-400 hover:border-slate-500'
                  )}
                >
                  {code === 'en' ? 'English' : 'हिंदी'}
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6 sm:space-y-7">
            {t.sections.map((sec) => (
              <section
                key={sec.title}
                className="rounded-xl border border-cyber-700/80 bg-cyber-950/40 p-4 sm:p-5"
              >
                <h2 className="font-semibold text-white mb-3 flex items-center gap-2 text-base sm:text-lg">
                  <SectionIcon type={sec.icon} />
                  {sec.title}
                </h2>
                <ul className="space-y-2.5 text-sm sm:text-base text-slate-400 leading-relaxed">
                  {sec.items.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="text-neon-cyan/80 shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-neon-cyan/60" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <footer className="sticky bottom-0 px-5 sm:px-6 md:px-8 py-5 border-t border-cyber-700 space-y-4 bg-cyber-950/95 backdrop-blur-md pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <label className="flex items-start gap-3 text-sm cursor-pointer text-slate-300 leading-relaxed">
              <input
                type="checkbox"
                className="mt-1 shrink-0 h-4 w-4"
                checked={rulesAcknowledged}
                onChange={(e) => onRulesAckChange(e.target.checked)}
              />
              {t.ack}
            </label>
            {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
            <Button
              size="lg"
              className="w-full cursor-pointer gap-2 min-h-[48px] text-base"
              disabled={!rulesAcknowledged}
              onClick={onStart}
            >
              <Maximize2 className="h-5 w-5 shrink-0" /> {t.start}
            </Button>
          </footer>
        </div>
      </div>
    </div>
  )
}
