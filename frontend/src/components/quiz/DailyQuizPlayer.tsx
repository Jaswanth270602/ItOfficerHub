import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import {
  buildDailyQuizShareText,
  copyDailyQuizShareText,
  isDailyQuizDoneToday,
  loadDailyQuizProgress,
  progressToShareData,
  saveDailyQuizCompletion,
  shareDailyQuizCard,
  type DailyQuiz,
  type DailyQuizChallenge,
  type DailyQuizLocalProgress,
  type DailyQuizResult,
  type DailyQuizShareData,
} from '@/lib/dailyQuiz'
import { DailyQuizCountdown } from '@/components/quiz/DailyQuizCountdown'
import { DailyQuizShareCard } from '@/components/quiz/DailyQuizShareCard'
import { SolutionExplanation } from '@/components/exam/SolutionExplanation'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { whatsAppShareUrl } from '@/lib/shareSite'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Flame,
  Loader2,
  Share2,
  Sparkles,
  XCircle,
} from 'lucide-react'

type Choice = 'A' | 'B' | 'C' | 'D'

type Props = {
  /** Compact mode for hero embed */
  embedded?: boolean
  challenge?: DailyQuizChallenge | null
  onClose?: () => void
  onCompleted?: (progress: DailyQuizLocalProgress) => void
}

export function DailyQuizPlayer({ embedded, challenge = null, onClose, onCompleted }: Props) {
  const [quiz, setQuiz] = useState<DailyQuiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Choice | null>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<DailyQuizResult | null>(null)
  const [localProgress, setLocalProgress] = useState<DailyQuizLocalProgress | null>(() =>
    loadDailyQuizProgress()
  )
  const [retrying, setRetrying] = useState(false)
  const [sharing, setSharing] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)

  const doneToday = isDailyQuizDoneToday() && !retrying

  useEffect(() => {
    setLoading(true)
    api
      .get<DailyQuiz>('/public/practice/daily-quiz')
      .then((r) => {
        setQuiz(r.data)
        const init: Record<number, Choice | null> = {}
        r.data.questions.forEach((q) => {
          init[q.id] = null
        })
        setAnswers(init)
      })
      .catch((e) => setError(apiErrorMessage(e, 'Daily quiz unavailable')))
      .finally(() => setLoading(false))
  }, [])

  const question = quiz?.questions[index]
  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a != null).length,
    [answers]
  )

  const shareData: DailyQuizShareData | null = result
    ? {
        quizDate: result.quizDate,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        scorePercent: result.scorePercent,
        shareHeadline: result.shareHeadline,
      }
    : doneToday && localProgress
      ? progressToShareData(localProgress)
      : null

  const submit = async () => {
    if (!quiz) return
    setSubmitting(true)
    try {
      const payload = {
        answers: quiz.questions.map((q) => ({
          questionId: q.id,
          selectedOption: answers[q.id] ?? null,
        })),
      }
      const { data } = await api.post<DailyQuizResult>('/public/practice/daily-quiz/submit', payload)
      setResult(data)
      const saved = saveDailyQuizCompletion(data)
      setLocalProgress(saved)
      onCompleted?.(saved)
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Could not submit quiz'))
    } finally {
      setSubmitting(false)
    }
  }

  const share = async () => {
    if (!shareRef.current || !shareData) return
    setSharing(true)
    try {
      const outcome = await shareDailyQuizCard(shareRef.current, shareData)
      if (outcome === 'shared') toast.success('Daily 10 card shared')
      else if (outcome === 'saved') toast.success('Card saved — attach PNG in WhatsApp')
      else if (outcome === 'text-only') toast.success('Share text ready in WhatsApp')
    } catch {
      toast.error('Could not share')
    } finally {
      setSharing(false)
    }
  }

  // Show today's saved score immediately (even while quiz loads / on reload).
  const showSavedResult = Boolean(shareData && (result || doneToday))

  if (loading && !showSavedResult) {
    return (
      <div className={cn('flex items-center justify-center gap-2 text-slate-400', embedded ? 'py-16' : 'py-24')}>
        <Loader2 className="h-5 w-5 animate-spin text-neon-cyan" />
        Loading today&apos;s Daily 10…
      </div>
    )
  }

  if (showSavedResult && shareData) {
    const scoreCorrect = result?.correctCount ?? shareData.correctCount
    const scoreTotal = result?.totalQuestions ?? shareData.totalQuestions
    const scorePct = result?.scorePercent ?? shareData.scorePercent
    const headline = result?.shareHeadline ?? shareData.shareHeadline

    return (
      <div className="space-y-5">
        <div className="fixed left-0 top-0 -z-10 opacity-0 pointer-events-none" aria-hidden>
          <DailyQuizShareCard ref={shareRef} data={shareData} />
        </div>

        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-neon-cyan mb-2">Daily 10 result</p>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{headline}</h2>
          <p className="text-slate-400 text-sm">{shareData.quizDate}</p>
          {localProgress && localProgress.streak > 1 && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-300">
              <Flame className="h-3.5 w-3.5" /> {localProgress.streak}-day streak — come back tomorrow
            </p>
          )}
          <div className="mt-2 flex justify-center">
            <DailyQuizCountdown />
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(30,41,59)" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(scorePct / 100) * 327} 327`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tabular-nums text-white">
                {scoreCorrect}/{scoreTotal}
              </span>
              <span className="text-xs text-slate-500">{scorePct}%</span>
            </div>
          </div>
        </div>

        {result ? (
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-emerald-950/40 border border-emerald-800/40 py-2">
              <p className="font-bold text-emerald-400 tabular-nums">{result.correctCount}</p>
              <p className="text-[10px] text-slate-500">Correct</p>
            </div>
            <div className="rounded-lg bg-red-950/40 border border-red-800/40 py-2">
              <p className="font-bold text-red-400 tabular-nums">{result.wrongCount}</p>
              <p className="text-[10px] text-slate-500">Wrong</p>
            </div>
            <div className="rounded-lg bg-amber-950/30 border border-amber-800/30 py-2">
              <p className="font-bold text-amber-300 tabular-nums">{result.skippedCount}</p>
              <p className="text-[10px] text-slate-500">Skipped</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-slate-400">
            Your best today — share it and challenge a friend.
          </p>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          <Button className="cursor-pointer gap-2 min-h-[44px]" disabled={sharing} onClick={() => void share()}>
            <Share2 className="h-4 w-4" /> {sharing ? 'Preparing…' : 'Share score card'}
          </Button>
          <Button
            variant="outline"
            className="cursor-pointer gap-2 min-h-[44px]"
            onClick={() =>
              window.open(whatsAppShareUrl(buildDailyQuizShareText(shareData)), '_blank', 'noopener,noreferrer')
            }
          >
            WhatsApp
          </Button>
          <Button
            variant="outline"
            className="cursor-pointer gap-2 min-h-[44px]"
            onClick={() =>
              void copyDailyQuizShareText(shareData).then(() => toast.success('Challenge link copied'))
            }
          >
            <Copy className="h-4 w-4" /> Copy challenge
          </Button>
        </div>

        {result && (
          <div className={cn('space-y-3 overflow-y-auto pr-1', embedded ? 'max-h-[32vh]' : 'max-h-[50vh]')}>
            {result.reviews.map((r) => (
              <details
                key={r.questionId}
                className="rounded-lg border border-cyber-700 bg-cyber-900/50 px-3 py-2"
              >
                <summary className="cursor-pointer flex items-center gap-2 text-sm list-none">
                  {r.correct ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                  )}
                  <span className="text-slate-300 truncate flex-1">
                    Q{r.orderIndex}. {r.questionText}
                  </span>
                </summary>
                <div className="mt-2 text-xs text-slate-400 space-y-2">
                  <p>
                    Your answer: {r.selectedOption ?? '—'} · Correct: {r.correctOption}
                  </p>
                  {r.explanation ? (
                    <SolutionExplanation text={r.explanation} correctOption={r.correctOption} />
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center pt-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              setRetrying(true)
              setResult(null)
              setIndex(0)
              if (quiz) {
                const init: Record<number, Choice | null> = {}
                quiz.questions.forEach((q) => {
                  init[q.id] = null
                })
                setAnswers(init)
              }
            }}
          >
            Retry for practice
          </Button>
          <Link to="/study">
            <Button variant="outline" className="cursor-pointer">
              More Study Q&A
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" className="cursor-pointer">
              Full mock
            </Button>
          </Link>
          {onClose && (
            <Button variant="ghost" className="cursor-pointer" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6 text-center">
        <p className="text-amber-200 mb-3">{error || 'No questions published yet'}</p>
        <Link to="/study">
          <Button variant="outline" className="cursor-pointer">
            Browse Study Q&A
          </Button>
        </Link>
      </div>
    )
  }

  const options: { label: Choice; text: string }[] = question
    ? [
        { label: 'A', text: question.optionA },
        { label: 'B', text: question.optionB },
        { label: 'C', text: question.optionC },
        { label: 'D', text: question.optionD },
      ]
    : []

  const progress = ((index + 1) / quiz.questionCount) * 100

  return (
    <div className="space-y-4">
      {challenge && (
        <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Challenge: beat <strong>{challenge.beat}/{challenge.of}</strong>
          {challenge.date ? ` (${challenge.date})` : ''}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-neon-cyan flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> {quiz.title}
          </p>
          <p className="text-sm text-slate-400">
            Q{index + 1} of {quiz.questionCount}
            <span className="text-slate-600"> · </span>
            {answeredCount} answered
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" className="cursor-pointer" onClick={onClose}>
            Exit
          </Button>
        )}
      </div>

      <div className="h-1.5 rounded-full bg-cyber-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {question && (
        <>
          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
            <span className="px-2 py-0.5 rounded bg-cyber-800 text-neon-cyan border border-cyber-600">
              {question.topic.replace(/_/g, ' ')}
            </span>
            <span className="px-2 py-0.5 rounded bg-cyber-800 text-slate-400 border border-cyber-700">
              {question.sectionTitle}
            </span>
          </div>

          <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-medium">
            {question.questionText}
          </p>

          <div className="space-y-2">
            {options.map(({ label, text }) => {
              const selected = answers[question.id] === label
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: label }))}
                  className={cn(
                    'w-full text-left rounded-xl border px-3.5 py-3 text-sm transition-all cursor-pointer',
                    selected
                      ? 'border-neon-cyan/60 bg-neon-cyan/10 text-white shadow-[0_0_20px_rgba(34,211,238,0.12)]'
                      : 'border-cyber-700 bg-cyber-900/50 text-slate-300 hover:border-cyber-500'
                  )}
                >
                  <span className="font-semibold text-neon-cyan mr-2">{label}.</span>
                  {text}
                </button>
              )
            })}
          </div>
        </>
      )}

      <div className="flex items-center justify-between gap-2 pt-2">
        <Button
          variant="outline"
          className="cursor-pointer gap-1 min-h-[44px]"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>

        {index < quiz.questionCount - 1 ? (
          <Button
            className="cursor-pointer gap-1 min-h-[44px]"
            onClick={() => setIndex((i) => Math.min(quiz.questionCount - 1, i + 1))}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="cursor-pointer min-h-[44px]"
            disabled={submitting}
            onClick={() => void submit()}
          >
            {submitting ? 'Submitting…' : 'Submit Daily 10'}
          </Button>
        )}
      </div>
    </div>
  )
}
