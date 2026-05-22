import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Award,
  BookMarked,
  CheckCircle2,
  Copy,
  Share2,
  Target,
  ChevronUp,
  Mail,
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

interface TopicBreakdown {
  topic: string
  shortLabel: string
  fullLabel: string
  total: number
  correct: number
  wrong: number
  unattempted: number
  accuracyPercent: number
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
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${sec}s`
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
  const [result, setResult] = useState<Result | null>(null)
  const [showSolutions, setShowSolutions] = useState(false)
  const [showCompetitive, setShowCompetitive] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loadError, setLoadError] = useState('')
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

  const copyShare = () => {
    if (result?.shareMessage) {
      navigator.clipboard.writeText(result.shareMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const nativeShare = async () => {
    if (!result?.shareMessage || !navigator.share) {
      copyShare()
      return
    }
    try {
      await navigator.share({
        title: `ItOfficerHub — ${result.mockTitle}`,
        text: result.shareMessage,
        url: window.location.origin,
      })
    } catch {
      /* user cancelled */
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 pb-32">
      <h1 className="text-3xl font-bold text-center mb-1">Performance Report</h1>
      <p className="text-center text-slate-400 mb-6">{result.mockTitle}</p>

      <Card
        className={cn(
          'mb-6 border',
          result.clearedCutoff ? 'border-green-600/40 bg-green-950/20' : 'border-amber-600/40 bg-amber-950/15'
        )}
      >
        <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Target className={cn('h-9 w-9', result.clearedCutoff ? 'text-green-400' : 'text-amber-400')} />
            <div>
              <p className="font-semibold text-lg">
                {result.clearedCutoff ? 'Cleared cutoff' : 'Below cutoff'}
              </p>
              <p className="text-sm text-slate-400">
                Qualifying: <strong className="text-white">{result.cutoffMarks}</strong> marks · Net:{' '}
                <strong className={result.clearedCutoff ? 'text-green-400' : 'text-amber-300'}>
                  {result.netScore.toFixed(2)}
                </strong>
              </p>
            </div>
          </div>
          {!result.clearedCutoff && result.marksToCutoff > 0 && (
            <p className="text-amber-300 text-sm">Need +{result.marksToCutoff.toFixed(2)} marks</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6 border-cyber-600">
        <CardContent className="pt-8 pb-8 text-center">
          <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">Net score</p>
          <p className="text-5xl font-bold text-neon-cyan tabular-nums">
            {result.netScore.toFixed(2)}
            <span className="text-2xl text-slate-500 font-normal"> / {result.maxMarks}</span>
          </p>
          <p className="text-slate-400 mt-2">{result.percentage}% of maximum</p>
        </CardContent>
      </Card>

      {result.topicBreakdown && result.topicBreakdown.length > 0 && (
        <Card className="mb-6 border-cyber-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Subject-wise breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-cyber-800">
                    <th className="py-2 pr-4">Subject</th>
                    <th className="py-2 pr-3">Q</th>
                    <th className="py-2 pr-3 text-green-400">✓</th>
                    <th className="py-2 pr-3 text-red-400">✗</th>
                    <th className="py-2">Acc %</th>
                  </tr>
                </thead>
                <tbody>
                  {result.topicBreakdown.map((t) => (
                    <tr key={t.topic} className="border-b border-cyber-800/60">
                      <td className="py-2 pr-4 font-mono text-neon-cyan">{t.shortLabel}</td>
                      <td className="py-2 pr-3 tabular-nums">{t.total}</td>
                      <td className="py-2 pr-3 tabular-nums text-green-400">{t.correct}</td>
                      <td className="py-2 pr-3 tabular-nums text-red-400">{t.wrong}</td>
                      <td className="py-2 tabular-nums">{Math.round(t.accuracyPercent)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
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

      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-5xl mx-auto px-4 pointer-events-auto">
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
                        'grid grid-cols-[3rem_1fr_auto_auto] items-center gap-2 px-4 py-3 text-sm',
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
                      <span className="text-xs text-slate-500 tabular-nums w-14 text-right">
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

      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <Link to={`/community?shareAttempt=${result.attemptId}`}>
          <Button variant="outline" className="cursor-pointer">
            <Mail className="h-4 w-4" /> Share in Prep Mail
          </Button>
        </Link>
        <Button variant="outline" className="cursor-pointer" onClick={nativeShare}>
          <Share2 className="h-4 w-4" /> Share score
        </Button>
        <Button variant="outline" className="cursor-pointer" onClick={copyShare}>
          <Copy className="h-4 w-4" /> {copied ? 'Copied!' : 'Copy text'}
        </Button>
        <Link to="/revision">
          <Button variant="outline" className="cursor-pointer">
            <BookMarked className="h-4 w-4" /> Revision bucket
          </Button>
        </Link>
        {result.allowRetake && (
          <Link to={`/mock/${result.mockTestId}`}>
            <Button variant="outline" className="cursor-pointer">Retake</Button>
          </Link>
        )}
        <Link to="/dashboard">
          <Button className="cursor-pointer">More mocks</Button>
        </Link>
      </div>

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
                  <div className="p-5 rounded-xl bg-cyber-800/60 border border-cyber-700 text-base leading-relaxed text-slate-200">
                    <p className="text-sm font-semibold text-neon-purple mb-2 uppercase tracking-wide">Solution</p>
                    {r.explanation}
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
