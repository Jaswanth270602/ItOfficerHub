import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { SolutionExplanation } from '@/components/exam/SolutionExplanation'
import { ShareMockButton } from '@/components/exam/ShareMockButton'
import { ScoreShareCard } from '@/components/exam/ScoreShareCard'
import { toast } from '@/components/ui/toast'
import { copyScoreShareText, shareScoreScreenshot } from '@/lib/shareScoreCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  Award,
  BookMarked,
  CheckCircle2,
  Copy,
  Share2,
  Target,
  ChevronUp,
  Mail,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  XCircle,
} from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  displayName: string
  netScore: number
  correctCount: number
  timeTakenSeconds: number
  currentUser: boolean
}

interface Review {
  questionId: number
  orderIndex: number
  questionText: string
  selectedOption: string | null
  correctOption: string
  correct: boolean
  attempted: boolean
  explanation: string
  solutionImageUrl: string | null
  topic: string
}

interface TopicTagBreakdown {
  tag: string
  total: number
  correct: number
  wrong: number
  unattempted: number
  accuracyPercent: number
}

interface TopicBreakdown {
  topic: string
  shortLabel: string
  fullLabel: string
  total: number
  correct: number
  wrong: number
  unattempted: number
  accuracyPercent: number
  tags?: TopicTagBreakdown[]
}

interface Result {
  attemptId: number
  mockTestId: number
  mockTitle: string
  correctCount: number
  wrongCount: number
  unattemptedCount: number
  positiveMarks: number
  negativeMarks: number
  netScore: number
  maxMarks: number
  marksPerCorrect: number
  negativePerWrong: number
  percentage: number
  accuracy: number
  timeTakenSeconds: number
  rank: number
  percentile: number
  totalTestTakers: number
  uniqueRank: number
  uniquePercentile: number
  uniqueStudents: number
  totalAttemptsAll: number
  cutoffMarks: number
  clearedCutoff: boolean
  marksToCutoff: number
  leaderboard: LeaderboardEntry[]
  reviews: Review[]
  allowRetake: boolean
  shareMessage: string
  topicBreakdown?: TopicBreakdown[]
  bookmarkedQuestionIds?: number[]
  firstAttemptOnMock?: boolean
  pointsEarned?: number
  totalPrepPoints?: number
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${sec}s`
}

function TopicTagChips({
  tags,
  filter,
}: {
  tags?: TopicTagBreakdown[]
  filter: 'weak' | 'strong' | 'all'
}) {
  if (!tags?.length) return null
  const shown =
    filter === 'weak'
      ? tags.filter((t) => t.wrong > 0 || t.accuracyPercent < 60)
      : filter === 'strong'
        ? tags.filter((t) => t.correct + t.wrong > 0 && t.accuracyPercent >= 70)
        : tags
  if (!shown.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {shown.map((t) => (
        <span
          key={t.tag}
          className={cn(
            'text-[11px] px-2 py-0.5 rounded-full border tabular-nums',
            t.accuracyPercent >= 70
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : t.accuracyPercent >= 40
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-red-500/40 bg-red-500/10 text-red-300'
          )}
        >
          {t.tag} · {Math.round(t.accuracyPercent)}%
        </span>
      ))}
    </div>
  )
}

function StatCell({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <div className="rounded-lg border border-cyber-700 bg-cyber-900/50 p-4 text-center">
      <p className={cn('text-2xl font-semibold tabular-nums', accent ?? 'text-white')}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export function ResultPage() {
  const { attemptId } = useParams()
  const location = useLocation()
  const violationNote = (location.state as { violationNote?: string | null } | null)?.violationNote
  const [result, setResult] = useState<Result | null>(null)
  const [showSolutions, setShowSolutions] = useState(false)
  const [showCompetitive, setShowCompetitive] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [loadError, setLoadError] = useState('')
  const shareCardRef = useRef<HTMLDivElement>(null)
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set())
  const [bookmarkBusy, setBookmarkBusy] = useState<number | null>(null)

  useEffect(() => {
    if (!attemptId) return
    setLoadError('')
    setResult(null)
    api
      .get(`/attempts/${attemptId}/result`)
      .then((r) => {
        setResult(r.data)
        setBookmarked(new Set(r.data.bookmarkedQuestionIds ?? []))
      })
      .catch((e) => setLoadError(apiErrorMessage(e, 'Could not load your report. Try again from Dashboard.')))
  }, [attemptId])

  const myLeaderboard = useMemo(
    () => result?.leaderboard.find((e) => e.currentUser),
    [result]
  )
  const displayRank = myLeaderboard?.rank ?? result?.uniqueRank ?? result?.rank ?? '—'
  const displayPercentile = result?.uniquePercentile ?? result?.percentile

  const shareCardData = useMemo(() => {
    if (!result) return null
    return {
      mockTitle: result.mockTitle,
      netScore: result.netScore,
      maxMarks: result.maxMarks,
      cutoffMarks: result.cutoffMarks,
      clearedCutoff: result.clearedCutoff,
      correctCount: result.correctCount,
      wrongCount: result.wrongCount,
      unattemptedCount: result.unattemptedCount,
      rank: myLeaderboard?.rank ?? result.uniqueRank ?? result.rank,
      percentile: displayPercentile ?? null,
      uniqueStudents: result.uniqueStudents,
      timeTakenSeconds: result.timeTakenSeconds,
      accuracy: result.accuracy,
    }
  }, [result, myLeaderboard, displayPercentile])

  const { strongTopics, weakTopics } = useMemo(() => {
    const rows = result?.topicBreakdown ?? []
    const withAttempts = rows.filter((t) => t.correct + t.wrong > 0)
    const strong = [...withAttempts]
      .filter((t) => t.accuracyPercent >= 70)
      .sort((a, b) => b.accuracyPercent - a.accuracyPercent)
    const weak = [...withAttempts]
      .filter((t) => t.accuracyPercent < 60 || t.wrong >= 2)
      .sort((a, b) => a.accuracyPercent - b.accuracyPercent)
    return { strongTopics: strong, weakTopics: weak }
  }, [result?.topicBreakdown])

  const copyShare = async () => {
    if (!shareCardData) return
    try {
      await copyScoreShareText(shareCardData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Score text copied — attach your score card image when sharing')
    } catch {
      toast.error('Could not copy')
    }
  }

  const shareScore = async () => {
    if (!shareCardRef.current || !shareCardData) return
    setSharing(true)
    try {
      const outcome = await shareScoreScreenshot(shareCardRef.current, shareCardData)
      if (outcome === 'shared') toast.success('Score card shared')
      else if (outcome === 'saved') {
        toast.success('Score card saved — attach the PNG in WhatsApp. Text copied too.')
      } else if (outcome === 'text-only') {
        toast.success('Score text copied — paste in WhatsApp (image could not be generated here)')
      }
    } catch {
      try {
        await copyScoreShareText(shareCardData)
        toast.success('Score text copied to clipboard')
      } catch {
        toast.error('Could not share — try Copy score text')
      }
    } finally {
      setSharing(false)
    }
  }

  const toggleBookmark = async (questionId: number) => {
    if (!attemptId) return
    setBookmarkBusy(questionId)
    const saved = bookmarked.has(questionId)
    try {
      if (saved) {
        await api.delete(`/attempts/revision/${questionId}`)
        setBookmarked((prev) => {
          const next = new Set(prev)
          next.delete(questionId)
          return next
        })
      } else {
        await api.post(`/attempts/revision/${questionId}?attemptId=${attemptId}`)
        setBookmarked((prev) => new Set(prev).add(questionId))
      }
    } catch {
      /* ignore */
    } finally {
      setBookmarkBusy(null)
    }
  }

  if (loadError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-red-400">{loadError}</p>
        <Link to="/dashboard">
          <Button className="cursor-pointer">Back to dashboard</Button>
        </Link>
      </div>
    )
  }

  if (!result) return <div className="text-center py-20 text-slate-400">Loading results...</div>

  const ringPct = result.maxMarks > 0 ? (result.netScore / result.maxMarks) * 100 : 0

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-[calc(11rem+env(safe-area-inset-bottom))] lg:pb-32">
      {shareCardData && (
        <div className="fixed left-0 top-0 -z-10 opacity-0 pointer-events-none" aria-hidden>
          <ScoreShareCard ref={shareCardRef} data={shareCardData} />
        </div>
      )}
      {violationNote && (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-200 flex gap-2 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          {violationNote}
        </div>
      )}

      {/* Hero */}
      <section className="relative mb-6 sm:mb-8 overflow-hidden rounded-xl sm:rounded-2xl border border-cyber-600/80 bg-gradient-to-br from-cyber-900 via-cyber-950 to-cyber-900 p-4 sm:p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.12),transparent_50%)]" />
        <ShareMockButton
          mockId={result.mockTestId}
          mockTitle={result.mockTitle}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10"
        />
        <div className="relative text-center">
          <p className="text-xs uppercase tracking-widest text-neon-cyan mb-2">Performance report</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 break-words px-2">{result.mockTitle}</h1>
          <p className="text-slate-500 text-sm mb-8">Time taken · {formatTime(result.timeTakenSeconds)}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <div className="relative">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(30,41,59)" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="url(#scoreGrad)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(ringPct / 100) * 327} 327`}
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white tabular-nums">{result.netScore.toFixed(1)}</span>
                <span className="text-xs text-slate-500">/ {result.maxMarks}</span>
              </div>
            </div>
            <div className="text-left space-y-3">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-amber-400" />
                <div>
                  <p className="text-xs text-slate-500">All-India rank</p>
                  <p className="text-2xl font-bold text-neon-cyan">#{displayRank}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-xs text-slate-500">Percentile</p>
                  <p className="text-2xl font-bold text-green-400">
                    {displayPercentile != null ? Math.round(displayPercentile) : '—'}
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border',
                  result.clearedCutoff
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                )}
              >
                <Target className="h-4 w-4" />
                {result.clearedCutoff ? 'Cleared cutoff' : `Need +${result.marksToCutoff.toFixed(2)} for cutoff`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {(result.pointsEarned != null && result.pointsEarned > 0) || (result.totalPrepPoints != null && result.totalPrepPoints > 0) ? (
        <div className="mb-6 rounded-xl border border-neon-purple/30 bg-gradient-to-r from-violet-950/40 to-cyber-900/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Sparkles className="h-8 w-8 text-neon-purple shrink-0" />
            <div>
              <p className="text-sm text-slate-400">Prep Points (first attempt only)</p>
              {result.firstAttemptOnMock && (result.pointsEarned ?? 0) > 0 ? (
                <p className="text-xl font-bold text-white">
                  +{result.pointsEarned} earned this mock
                </p>
              ) : (
                <p className="text-sm text-slate-500">Retake — no extra points (best score still counts for rank)</p>
              )}
            </div>
          </div>
          <p className="text-2xl font-bold text-neon-cyan tabular-nums">
            {result.totalPrepPoints ?? 0} <span className="text-sm font-normal text-slate-500">total balance</span>
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCell
          label="P marks"
          value={`+${result.positiveMarks.toFixed(2)}`}
          sub={`${result.correctCount} correct`}
          accent="text-green-400"
        />
        <StatCell
          label="N marks"
          value={`−${result.negativeMarks.toFixed(2)}`}
          sub={`${result.wrongCount} wrong`}
          accent="text-red-400"
        />
        <StatCell label="Unattempted" value={String(result.unattemptedCount)} sub="0 marks" accent="text-amber-300" />
        <StatCell label="Accuracy" value={`${result.accuracy}%`} />
      </div>

      {result.topicBreakdown && result.topicBreakdown.length > 0 && (
        <div className="mb-8 space-y-6">
          {(weakTopics.length > 0 || strongTopics.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {weakTopics.length > 0 && (
                <Card className="border-red-500/30 bg-red-950/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-red-300">
                      <TrendingDown className="h-5 w-5" /> Needs revision
                    </CardTitle>
                    <p className="text-xs text-slate-500">Chapters where you lost marks — topic tags show weak sub-areas</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {weakTopics.map((t) => (
                      <div key={t.topic} className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-white">{t.fullLabel}</span>
                          <span className="text-red-400">{Math.round(t.accuracyPercent)}%</span>
                        </div>
                        <TopicTagChips tags={t.tags} filter="weak" />
                        <p className="text-xs text-slate-500 mt-1">
                          {t.correct} correct · {t.wrong} wrong · {t.unattempted} skipped
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {strongTopics.length > 0 && (
                <Card className="border-emerald-500/30 bg-emerald-950/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-emerald-300">
                      <TrendingUp className="h-5 w-5" /> Strong areas
                    </CardTitle>
                    <p className="text-xs text-slate-500">Strong chapters — tags show sub-topics you nailed</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {strongTopics.map((t) => (
                      <div key={t.topic} className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-white">{t.fullLabel}</span>
                          <span className="text-emerald-400">{Math.round(t.accuracyPercent)}%</span>
                        </div>
                        <TopicTagChips tags={t.tags} filter="strong" />
                        <p className="text-xs text-slate-500 mt-1">
                          {t.correct}/{t.total} questions
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Card className="border-cyber-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Chapter-wise breakdown</CardTitle>
              <p className="text-xs text-slate-500">Based on topic tags from your mock import</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.topicBreakdown.map((t) => (
                <div key={t.topic} className="pb-1">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-200">{t.fullLabel}</span>
                    <span className="text-slate-400">
                      {t.correct}/{t.total} · <strong className="text-white">{Math.round(t.accuracyPercent)}%</strong>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        t.accuracyPercent >= 70 ? 'bg-emerald-500' : t.accuracyPercent >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      )}
                      style={{ width: `${t.accuracyPercent}%` }}
                    />
                  </div>
                  <TopicTagChips tags={t.tags} filter="all" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[env(safe-area-inset-bottom)] lg:pb-0">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 pointer-events-auto mb-[calc(4rem+env(safe-area-inset-bottom))] lg:mb-0">
          <button
            type="button"
            onClick={() => setShowCompetitive(!showCompetitive)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-t-xl border border-b-0 border-cyber-600 bg-cyber-900/95 backdrop-blur-md cursor-pointer text-sm font-medium text-slate-200"
          >
            <TrendingUp className="h-4 w-4 text-neon-purple" />
            {showCompetitive ? 'Hide rank & leaderboard' : 'Rank & leaderboard'}
            <ChevronUp className={cn('h-4 w-4 transition-transform', showCompetitive && 'rotate-180')} />
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300 border border-cyber-600 rounded-t-xl bg-cyber-950/98 backdrop-blur-lg shadow-xl',
              showCompetitive ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0 border-transparent'
            )}
          >
            <div className="p-4 md:p-6 space-y-4 overflow-y-auto max-h-[65vh]">
              <p className="text-xs text-slate-500 text-center">
                Best score per student · retakes excluded · {result.uniqueStudents ?? result.totalTestTakers} unique
                students
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCell label="All-India rank" value={`#${displayRank}`} accent="text-neon-cyan" />
                <StatCell
                  label="Percentile"
                  value={displayPercentile != null ? String(Math.round(displayPercentile)) : '—'}
                  accent="text-green-400"
                />
                <StatCell
                  label="Unique students"
                  value={String(result.uniqueStudents ?? result.totalTestTakers)}
                />
                <StatCell
                  label="Total attempts"
                  value={result.totalAttemptsAll != null ? String(result.totalAttemptsAll) : '—'}
                  sub="incl. retakes"
                />
              </div>

              <div className="rounded-lg border border-cyber-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-cyber-700 bg-cyber-900/60 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium">Top 10 (unique best scores)</span>
                </div>
                <ul className="divide-y divide-cyber-800">
                  {result.leaderboard.map((e) => (
                    <li
                      key={`${e.rank}-${e.displayName}`}
                      className={cn(
                        'grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[3rem_1fr_auto_auto] items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 text-sm',
                        e.currentUser && 'bg-neon-blue/10'
                      )}
                    >
                      <span className="font-mono text-slate-400 tabular-nums">#{e.rank}</span>
                      <span className="font-medium truncate">
                        {e.displayName}
                        {e.currentUser && (
                          <span className="ml-2 text-xs text-neon-cyan font-normal">You</span>
                        )}
                      </span>
                      <span className="font-semibold text-neon-cyan tabular-nums">{e.netScore.toFixed(2)}</span>
                      <span className="hidden sm:block text-xs text-slate-500 tabular-nums w-14 text-right">
                        {formatTime(e.timeTakenSeconds)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="mb-8 border-cyber-600/80">
        <CardContent className="pt-5 pb-5 space-y-4">
          <p className="text-sm text-slate-400 text-center">
            Share a score card image — no private report link is included.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="default"
              className="cursor-pointer min-h-[44px] gap-2"
              disabled={sharing}
              onClick={() => void shareScore()}
            >
              <Share2 className="h-4 w-4 shrink-0" /> {sharing ? 'Preparing…' : 'Share score card'}
            </Button>
            <Button variant="outline" className="cursor-pointer min-h-[44px] gap-2" onClick={() => void copyShare()}>
              <Copy className="h-4 w-4 shrink-0" /> {copied ? 'Copied' : 'Copy score text'}
            </Button>
            <ShareMockButton mockId={result.mockTestId} mockTitle={result.mockTitle} variant="pill" />
            <Link to={`/community?shareAttempt=${result.attemptId}`}>
              <Button variant="outline" className="cursor-pointer min-h-[44px] gap-2">
                <Mail className="h-4 w-4 shrink-0" /> Prep Mail
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 justify-center pt-1 border-t border-cyber-800">
            <Link to="/revision">
              <Button variant="outline" className="cursor-pointer min-h-[44px] gap-2">
                <BookMarked className="h-4 w-4 shrink-0" /> Revision
              </Button>
            </Link>
            {result.allowRetake && (
              <Link to={`/mock/${result.mockTestId}`}>
                <Button variant="outline" className="cursor-pointer min-h-[44px]">Retake</Button>
              </Link>
            )}
            <Link to="/dashboard">
              <Button className="cursor-pointer min-h-[44px]">More mocks</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="ghost"
        className="w-full mb-6 cursor-pointer text-lg py-6"
        onClick={() => setShowSolutions(!showSolutions)}
      >
        <Award className="h-5 w-5 mr-2" />
        {showSolutions ? 'Hide' : 'View'} detailed solutions ({result.reviews.length})
      </Button>

      {showSolutions && (
        <div className="space-y-8">
          {result.reviews.map((r, i) => (
            <Card
              key={r.questionId}
              className={cn(
                'overflow-hidden',
                !r.attempted && 'border-slate-600/50',
                r.attempted && r.correct && 'border-green-600/50',
                r.attempted && !r.correct && 'border-red-600/50'
              )}
            >
              <CardHeader className="bg-cyber-900/60 pb-4">
                <CardTitle className="text-lg leading-relaxed flex items-start gap-3">
                  {!r.attempted ? (
                    <span className="mt-1 h-6 w-6 rounded-full bg-slate-600 shrink-0" />
                  ) : r.correct ? (
                    <CheckCircle2 className="h-6 w-6 text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <span>
                    <span className="text-neon-cyan font-mono text-sm block mb-1">Question {i + 1}</span>
                    {r.questionText}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="flex flex-wrap gap-4 text-base">
                  <span>
                    You:{' '}
                    <strong className={r.correct ? 'text-green-400' : r.attempted ? 'text-red-400' : 'text-slate-500'}>
                      {r.selectedOption || 'Skipped'}
                    </strong>
                  </span>
                  <span>
                    Correct: <strong className="text-green-400">{r.correctOption}</strong>
                  </span>
                  <span className="text-slate-500">{r.topic?.replace(/_/g, ' ')}</span>
                  <span>
                    Marks:{' '}
                    {r.correct ? (
                      <strong className="text-green-400">P +{result.marksPerCorrect}</strong>
                    ) : r.attempted ? (
                      <strong className="text-red-400">N −{result.negativePerWrong}</strong>
                    ) : (
                      <strong>0</strong>
                    )}
                  </span>
                </div>

                {r.solutionImageUrl && (
                  <div className="rounded-xl overflow-hidden border border-cyber-700 bg-black/40">
                    <img
                      src={r.solutionImageUrl}
                      alt={`Solution diagram for question ${i + 1}`}
                      className="w-full max-h-80 object-contain"
                      loading="lazy"
                    />
                  </div>
                )}

                {r.explanation && (
                  <div className="p-5 md:p-6 rounded-xl bg-cyber-800/60 border border-cyber-700">
                    <p className="text-sm font-semibold text-neon-purple mb-4 uppercase tracking-wide">Detailed solution</p>
                    <SolutionExplanation text={r.explanation} correctOption={r.correctOption} />
                  </div>
                )}

                {r.attempted && !r.correct && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    disabled={bookmarkBusy === r.questionId}
                    onClick={() => toggleBookmark(r.questionId)}
                  >
                    <BookMarked className="h-4 w-4" />
                    {bookmarked.has(r.questionId) ? 'Saved for revision' : 'Save for revision'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
