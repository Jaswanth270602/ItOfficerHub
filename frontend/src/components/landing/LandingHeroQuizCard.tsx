import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DailyQuizPlayer } from '@/components/quiz/DailyQuizPlayer'
import { DailyQuizCountdown } from '@/components/quiz/DailyQuizCountdown'
import { Button } from '@/components/ui/button'
import {
  activeFriendChallenge,
  istTodayIso,
  loadDailyQuizProgress,
  type DailyQuizChallenge,
} from '@/lib/dailyQuiz'
import { BookOpenCheck, Flame, Play, Trophy, Zap } from 'lucide-react'

type Props = {
  questionCountHint?: number
  challenge?: DailyQuizChallenge | null
}

/** Interactive hero card — starts Daily 10 instantly without scrolling. */
export function LandingHeroQuizCard({ questionCountHint = 10, challenge = null }: Props) {
  const [playing, setPlaying] = useState(false)
  const [progressTick, setProgressTick] = useState(0)

  const progress = useMemo(() => {
    void progressTick
    return loadDailyQuizProgress()
  }, [progressTick])

  const doneToday = progress?.lastDate === istTodayIso()
  const friendChallenge = activeFriendChallenge(challenge, progress)

  if (playing) {
    return (
      <div
        id="daily10"
        className="hero-quiz-card w-full max-w-lg mx-auto rounded-2xl border border-neon-cyan/35 bg-cyber-950/90 backdrop-blur-md p-4 sm:p-5 shadow-[0_0_40px_rgba(34,211,238,0.12)] text-left"
      >
        <DailyQuizPlayer
          embedded
          challenge={friendChallenge}
          onClose={() => {
            setPlaying(false)
            setProgressTick((t) => t + 1)
          }}
          onCompleted={() => setProgressTick((t) => t + 1)}
        />
      </div>
    )
  }

  if (doneToday && progress) {
    return (
      <div
        id="daily10"
        className="hero-quiz-card group relative w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-cyber-900/95 via-cyber-950/95 to-[#10201a]/95 p-5 sm:p-6 text-left"
      >
        <div className="relative flex items-start gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Trophy className="h-6 w-6 text-amber-300" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-semibold">Done for today</p>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">Daily 10 complete</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {progress.correctCount}/{progress.totalQuestions} · {progress.scorePercent}%
              {progress.streak > 1 ? ` · ${progress.streak}-day streak` : ''}
            </p>
          </div>
        </div>
        <DailyQuizCountdown className="relative mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 tabular-nums" />
        <div className="relative flex flex-col sm:flex-row gap-2">
          <Link to="/daily-quiz" className="w-full sm:flex-1">
            <Button size="lg" className="cursor-pointer w-full min-h-[48px]">
              View &amp; share
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="cursor-pointer w-full sm:w-auto min-h-[48px]"
            onClick={() => setPlaying(true)}
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      id="daily10"
      className="hero-quiz-card group relative w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-neon-cyan/30 bg-gradient-to-br from-cyber-900/95 via-cyber-950/95 to-[#1a1030]/95 p-5 sm:p-6 shadow-[0_0_48px_rgba(59,130,246,0.18)] text-left"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-neon-cyan/10 blur-2xl transition-opacity group-hover:opacity-100 opacity-70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-neon-purple/15 blur-2xl"
        aria-hidden
      />

      {friendChallenge && (
        <div className="relative mb-3 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Friend scored <strong>{friendChallenge.beat}/{friendChallenge.of}</strong>
          {friendChallenge.date ? ` on ${friendChallenge.date}` : ''} — beat them!
        </div>
      )}

      <div className="relative flex items-start gap-3 mb-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-neon-blue/30 to-neon-purple/30 border border-neon-cyan/40 flex items-center justify-center shrink-0 hero-quiz-icon">
          <Flame className="h-6 w-6 text-amber-300" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neon-cyan font-semibold">Test only · no login</p>
          <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">Daily 10 Quiz</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {questionCountHint} random Study Q&A · refreshes midnight IST
          </p>
        </div>
      </div>

      <ul className="relative space-y-2 mb-5 text-sm text-slate-300">
        <li className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-neon-cyan shrink-0" />
          Instant start — no scroll, no account
        </li>
        <li className="flex items-center gap-2">
          <BookOpenCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          Score card you can share with friends
        </li>
      </ul>

      <div className="relative flex flex-col sm:flex-row gap-2">
        <Button
          size="lg"
          className="cursor-pointer w-full min-h-[48px] gap-2 hero-quiz-cta"
          onClick={() => setPlaying(true)}
        >
          <Play className="h-5 w-5 fill-current" /> Start Daily 10
        </Button>
        <Link to="/daily-quiz" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="cursor-pointer w-full min-h-[48px]">
            Open full page
          </Button>
        </Link>
      </div>
    </div>
  )
}
