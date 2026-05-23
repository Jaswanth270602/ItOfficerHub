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
        items: [
          'Each correct answer earns positive marks (+P).',
          'Each wrong answer loses negative marks (−N).',
          'Unattempted questions score zero — no negative marking.',
        ],
      },
      {
        title: 'Question palette',
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
        items: [
          'Timer starts when you enter fullscreen.',
          'You may submit anytime from the top-right Submit button.',
          'When time ends, the test auto-submits with saved answers.',
        ],
      },
      {
        title: 'Proctoring (strict)',
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
        items: [
          'सही उत्तर पर + अंक।',
          'गलत उत्तर पर − अंक (नकारात्मक अंकन)।',
          'छूटे प्रश्न पर 0 अंक।',
        ],
      },
      {
        title: 'प्रश्न पैलेट',
        items: [
          'हरा — उत्तर दिया',
          'धूसर — अनुत्तरित',
          'बैंगनी — समीक्षा के लिए चिह्नित',
          'समीक्षा चिह्न उत्तर लॉक नहीं करता।',
        ],
      },
      {
        title: 'समय',
        items: ['फुलस्क्रीन के बाद टाइमर शुरू।', 'कभी भी Submit से जमा करें।', 'समय समाप्त पर ऑटो-सबमिट।'],
      },
      {
        title: 'नियम',
        items: ['फुलस्क्रीन छोड़ने पर ऑटो-सबमिट।', 'टैब बदलने पर ऑटो-सबमिट।'],
      },
    ],
  },
} as const

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
      <div className="min-h-full flex items-start justify-center p-3 sm:p-6 md:p-8 py-4 sm:py-8">
        <div className="max-w-4xl w-full rounded-2xl border border-cyber-600 bg-gradient-to-b from-cyber-900 to-cyber-950 shadow-2xl flex flex-col max-h-none sm:max-h-[calc(100dvh-4rem)] my-auto relative">
          {mockId != null && (
            <ShareMockButton mockId={mockId} mockTitle={title} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10" />
          )}
          <div className="p-5 sm:p-6 md:p-8 border-b border-cyber-700 text-center shrink-0 pr-14">
            <ShieldAlert className="h-12 w-12 text-neon-cyan mx-auto mb-3" />
            <p className="text-xs uppercase tracking-widest text-neon-cyan">{t.secure}</p>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-2">{t.heading}</h1>
            <p className="text-slate-400 text-sm mt-2 break-words px-2">
              {title} · {questionCount} Q · {timeLimitMinutes} min · P +{marksCorrect} / N −{marksWrong}
            </p>
          </div>

          <div className="px-5 sm:px-6 md:px-8 py-4 border-b border-cyber-800 shrink-0">
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

          <div className="px-5 sm:px-6 md:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 flex-1 min-h-[12rem] overflow-y-auto text-sm sm:text-base text-slate-300 overscroll-contain">
            {t.sections.map((sec) => (
              <section key={sec.title}>
                <h2 className="font-semibold text-white mb-2 flex items-center gap-2 text-base">
                  {sec.title === 'Marking scheme' || sec.title === 'अंकन' ? (
                    <Flag className="h-4 w-4 text-amber-400 shrink-0" />
                  ) : sec.title.includes('palette') || sec.title.includes('पैलेट') ? (
                    <Bookmark className="h-4 w-4 text-violet-400 shrink-0" />
                  ) : sec.title.includes('Timer') || sec.title.includes('समय') ? (
                    <Clock className="h-4 w-4 text-neon-cyan shrink-0" />
                  ) : (
                    <Lock className="h-4 w-4 text-red-400 shrink-0" />
                  )}
                  {sec.title}
                </h2>
                <ul className="space-y-2 list-disc list-outside ml-5 text-slate-400 leading-relaxed">
                  {sec.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div className="px-5 sm:px-6 md:px-8 py-5 border-t border-cyber-700 space-y-4 shrink-0 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-cyber-950/80">
            <label className="flex items-start gap-3 text-sm cursor-pointer text-slate-300 leading-relaxed">
              <input
                type="checkbox"
                className="mt-1 shrink-0"
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
              <Maximize2 className="h-5 w-5" /> {t.start}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
