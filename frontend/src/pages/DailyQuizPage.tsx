import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Seo } from '@/components/Seo'
import { DailyQuizPlayer } from '@/components/quiz/DailyQuizPlayer'
import { DailyQuizCountdown } from '@/components/quiz/DailyQuizCountdown'
import { Button } from '@/components/ui/button'
import { SITE_URL } from '@/lib/seo'
import {
  activeFriendChallenge,
  istTodayIso,
  loadDailyQuizProgress,
  parseDailyQuizChallenge,
  progressToShareData,
  syncDailyQuizShareUrl,
  type DailyQuizLocalProgress,
} from '@/lib/dailyQuiz'
import { ArrowLeft, Flame } from 'lucide-react'

export function DailyQuizPage() {
  const { search } = useLocation()
  const [progress, setProgress] = useState<DailyQuizLocalProgress | null>(() => loadDailyQuizProgress())

  const rawChallenge = useMemo(() => parseDailyQuizChallenge(search), [search])
  const friendChallenge = useMemo(
    () => activeFriendChallenge(rawChallenge, progress),
    [rawChallenge, progress]
  )

  const doneToday = progress?.lastDate === istTodayIso()

  // After finishing, keep the URL on YOUR score (not a stale friend beat=0 link).
  useEffect(() => {
    if (doneToday && progress) {
      syncDailyQuizShareUrl(progressToShareData(progress))
    }
  }, [doneToday, progress])

  useEffect(() => {
    const refresh = () => setProgress(loadDailyQuizProgress())
    window.addEventListener('ioh-daily10-updated', refresh)
    return () => window.removeEventListener('ioh-daily10-updated', refresh)
  }, [])

  return (
    <>
      <Seo
        path="/daily-quiz"
        title="Daily 10 Quiz — Free IT Officer Practice"
        description="10 random Study Q&A questions every day. No login. Share your score and challenge friends on ItOfficerHub."
        keywords="daily quiz, IBPS SO IT practice, free IT officer MCQ, study Q&A, Daily 10"
        image={`${SITE_URL}/og-daily10.png`}
      />
      <div className="page-container max-w-2xl py-8 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-neon-cyan mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 border border-neon-cyan/40 flex items-center justify-center">
            <Flame className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Daily 10 Quiz</h1>
            <p className="text-sm text-slate-400">From Study Q&A · free · no login</p>
          </div>
        </div>

        {friendChallenge && (
          <div className="mb-4 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            A friend scored <strong>{friendChallenge.beat}/{friendChallenge.of}</strong>
            {friendChallenge.date ? ` on ${friendChallenge.date}` : ''}. Can you beat them?
          </div>
        )}

        {doneToday && progress && !friendChallenge && (
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span className="text-emerald-300">
              Your best today: {progress.correctCount}/{progress.totalQuestions}
              {progress.streak > 1 ? ` · ${progress.streak}-day streak` : ''}
            </span>
            <DailyQuizCountdown />
          </div>
        )}

        <div className="rounded-2xl border border-neon-cyan/25 bg-cyber-900/60 p-4 sm:p-6 shadow-lg shadow-black/20">
          <DailyQuizPlayer
            challenge={friendChallenge}
            onCompleted={(p) => setProgress(p)}
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 mb-3">Want the full exam experience?</p>
          <Link to="/dashboard">
            <Button variant="outline" className="cursor-pointer">
              Today&apos;s full mock
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}
