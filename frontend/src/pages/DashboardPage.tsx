import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { MockExamCard } from '@/components/MockExamCard'
import { PrepStatsCard } from '@/components/PrepStatsCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { normalizeMock, type MockExam } from '@/types/mock'
import {
  Award,
  ArrowRight,
  Calendar,
  Clock,
  Crown,
  FileQuestion,
  Flame,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'

interface HallEntry {
  rank: number
  userId: number
  displayName: string
  avatarEmoji: string
  aggregateScore: number
  mocksContributed: number
  totalCorrect: number
  totalTimeSeconds: number
}

interface LeaderRow {
  rank: number
  userId: number
  displayName: string
  netScore: number
  correctCount: number
  timeTakenSeconds: number
  currentUser: boolean
}

interface ProfileOfDay {
  userId: number
  displayName: string
  avatarEmoji: string
  headline: string
  featuredNetScore: number
  featuredRank: number
  featuredMockId: number
  featuredMockTitle: string
  mocksAttempted: number
  aggregateScore: number
}

interface MockOfDay {
  id: number
  title: string
  description: string
  difficulty: string
  questionCount: number
  timeLimitMinutes: number
  attemptsCount: number
  allowRetake: boolean
  cutoffMarks: number
  publishedAt: string
  marksPerCorrect: number
  marksPerWrong: number
}

interface Overview {
  mockOfTheDay: MockOfDay | null
  profileOfTheDay: ProfileOfDay | null
  hallOfFameTop10: HallEntry[]
  todaysMockLeaderboard: LeaderRow[]
  platformStats: {
    totalMocks: number
    totalUsers: number
    totalAttempts: number
    averageScorePercent: number
  }
  marksPerCorrect: number
  marksPerWrong: number
}

function formatReleaseDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function MarkingPill({ label, value, tone }: { label: string; value: string; tone: 'green' | 'red' }) {
  return (
    <div className="rounded-lg border border-cyber-700 bg-cyber-900/60 px-3 py-2 text-center min-w-[88px]">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className={cn('text-sm font-semibold tabular-nums', tone === 'green' ? 'text-green-400' : 'text-red-400')}>
        {value}
      </p>
    </div>
  )
}

export function DashboardPage() {
  const [mocks, setMocks] = useState<MockExam[]>([])
  const [overview, setOverview] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    setError('')
    const mocksUrl = isAuthenticated ? '/attempts/my-mocks' : '/public/mocks'
    Promise.all([api.get('/public/dashboard'), api.get(mocksUrl)])
      .then(([dash, mocksRes]) => {
        setOverview(dash.data)
        setMocks(mocksRes.data.map((m: MockExam) => normalizeMock(m)))
      })
      .catch((e) => setError(apiErrorMessage(e, 'Could not load dashboard')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [isAuthenticated])

  const featured = overview?.mockOfTheDay
  const otherMocks = useMemo(
    () => mocks.filter((m) => !featured || m.id !== featured.id),
    [mocks, featured]
  )
  const previewMocks = useMemo(() => otherMocks.slice(0, 4), [otherMocks])
  const featuredMockState = featured ? mocks.find((m) => m.id === featured.id) : undefined

  const startMock = (mockId: number) => {
    const target = `/mock/${mockId}`
    if (isAuthenticated) navigate(target)
    else navigate(`/login?redirect=${encodeURIComponent(target)}`)
  }

  const pMark = overview?.marksPerCorrect ?? 1
  const nMark = overview?.marksPerWrong ?? 0.25

  return (
    <div className="page-container py-8 pb-16">
      {/* Hero */}
      <section className="relative mb-10 overflow-hidden rounded-2xl border border-cyber-600/80 bg-gradient-to-br from-cyber-900 via-cyber-950 to-cyber-900 p-6 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.12),transparent_45%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neon-cyan mb-3">
              <Sparkles className="h-3.5 w-3.5" /> IBPS SO IT Officer · Free mock tests
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
              Your daily mock test arena
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Practice with a new full-length mock every day — real exam timing, P/N marking, cutoff, rank and
              percentile. Compete with fellow aspirants and sharpen your score before the actual IBPS SO IT exam.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              <MarkingPill label="P marks" value={`+${pMark}`} tone="green" />
              <MarkingPill label="N marks" value={`-${nMark}`} tone="red" />
              <MarkingPill label="Duration" value="15 min" tone="green" />
              <MarkingPill label="Questions" value="20" tone="green" />
            </div>
          </div>
          {overview?.platformStats && (
            <div className="grid grid-cols-2 gap-3 min-w-[200px]">
              {[
                { label: 'Active mocks', value: overview.platformStats.totalMocks, icon: Zap },
                { label: 'Aspirants', value: overview.platformStats.totalUsers, icon: Users },
                { label: 'Attempts', value: overview.platformStats.totalAttempts, icon: TrendingUp },
                { label: 'Avg score', value: `${overview.platformStats.averageScorePercent}%`, icon: Target },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-xl border border-cyber-700/80 bg-cyber-950/70 px-3 py-3 backdrop-blur-sm"
                >
                  <Icon className="h-4 w-4 text-neon-purple mb-1" />
                  <p className="text-lg font-bold tabular-nums">{value}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Rankings refresh as more aspirants complete mocks</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={load} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </Button>
          {isAuthenticated && (
            <Link to="/history">
              <Button variant="outline" size="sm" className="cursor-pointer">
                My attempts
              </Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <p className="mb-6 text-sm text-red-400 bg-red-950/30 border border-red-800/50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {loading && <p className="text-slate-400 text-center py-16">Loading your mocks...</p>}

      {!loading && (
        <>
          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            {/* Mock of the day */}
            <Card className="lg:col-span-2 border-neon-cyan/30 bg-gradient-to-br from-cyber-900/90 to-cyber-950 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-neon-cyan/10 blur-3xl rounded-full" />
              <CardHeader className="relative">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30">
                    <Flame className="h-3 w-3" /> Today&apos;s mock
                  </span>
                  {featured?.publishedAt && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-cyber-800 text-slate-300 border border-cyber-600">
                      <Calendar className="h-3 w-3" />
                      Live since {formatReleaseDate(featured.publishedAt)}
                    </span>
                  )}
                </div>
                {featured ? (
                  <>
                    <CardTitle className="text-2xl pr-4">{featured.title}</CardTitle>
                    <CardDescription className="text-slate-400">{featured.description}</CardDescription>
                  </>
                ) : (
                  <>
                    <CardTitle className="text-xl text-slate-300">Today&apos;s mock coming soon</CardTitle>
                    <CardDescription>
                      A new IBPS SO IT practice set will be available here shortly. Check back later today.
                    </CardDescription>
                  </>
                )}
              </CardHeader>
              {featured && (
                <CardContent className="relative space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileQuestion className="h-4 w-4" /> {featured.questionCount} Qs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {featured.timeLimitMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {featured.attemptsCount} attempts
                    </span>
                    <span className="flex items-center gap-1 text-amber-300">
                      <Target className="h-4 w-4" /> Cutoff {featured.cutoffMarks} marks
                    </span>
                  </div>
                  {featuredMockState?.attempted && featuredMockState.bestNetScore != null && (
                    <p className="text-sm">
                      Your best:{' '}
                      <strong className="text-neon-cyan">{featuredMockState.bestNetScore.toFixed(2)}</strong>
                      {featuredMockState.latestClearedCutoff ? (
                        <span className="text-green-400 ml-2">· Cleared</span>
                      ) : (
                        <span className="text-amber-400 ml-2">· Below cutoff</span>
                      )}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {featuredMockState?.attempted && featuredMockState.latestAttemptId && (
                      <Link to={`/result/${featuredMockState.latestAttemptId}`}>
                        <Button variant="outline" className="cursor-pointer">
                          View report
                        </Button>
                      </Link>
                    )}
                    {(!featuredMockState?.attempted || featured.allowRetake) && (
                      <Button className="cursor-pointer gap-2" onClick={() => startMock(featured.id)}>
                        {featuredMockState?.attempted ? (
                          <>
                            <RotateCcw className="h-4 w-4" /> Retake today&apos;s mock
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" /> Attempt today&apos;s mock
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Profile of the day */}
            <Card className="border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-cyber-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Crown className="h-5 w-5 text-amber-400" /> Aspirant of the day
                </CardTitle>
              </CardHeader>
              <CardContent>
                {overview?.profileOfTheDay ? (
                  <div className="text-center space-y-4">
                    <div className="text-5xl">{overview.profileOfTheDay.avatarEmoji}</div>
                    <div>
                      <p className="text-xl font-bold">{overview.profileOfTheDay.displayName}</p>
                      {overview.profileOfTheDay.userId === user?.userId && (
                        <span className="text-xs text-neon-cyan">That&apos;s you!</span>
                      )}
                      <p className="text-xs text-amber-300/90 mt-1">{overview.profileOfTheDay.headline}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-cyber-900/80 p-3 border border-cyber-700">
                        <p className="text-slate-500 text-xs">Net score</p>
                        <p className="font-bold text-neon-cyan tabular-nums">
                          {overview.profileOfTheDay.featuredNetScore.toFixed(2)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-cyber-900/80 p-3 border border-cyber-700">
                        <p className="text-slate-500 text-xs">All-India rank</p>
                        <p className="font-bold tabular-nums">#{overview.profileOfTheDay.featuredRank}</p>
                      </div>
                      <div className="rounded-lg bg-cyber-900/80 p-3 border border-cyber-700 col-span-2">
                        <p className="text-slate-500 text-xs">Total across all mocks</p>
                        <p className="font-bold text-green-400 tabular-nums">
                          {overview.profileOfTheDay.aggregateScore.toFixed(2)} pts
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      Top on {overview.profileOfTheDay.featuredMockTitle} ·{' '}
                      {overview.profileOfTheDay.mocksAttempted} mocks completed
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Attempt today&apos;s mock — lead the board to become aspirant of the day.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {isAuthenticated && <PrepStatsCard />}

          {/* Leaderboards row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-10">
            <Card className="border-cyber-600">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  Today&apos;s mock · Top 10
                </CardTitle>
                <CardDescription>All-India rank by best net score on today&apos;s mock (retakes don&apos;t count)</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {overview?.todaysMockLeaderboard && overview.todaysMockLeaderboard.length > 0 ? (
                  <ul className="divide-y divide-cyber-800">
                    {overview.todaysMockLeaderboard.map((e) => (
                      <li
                        key={e.userId}
                        className={cn(
                          'grid grid-cols-[2.5rem_1fr_auto] gap-2 px-4 py-3 text-sm items-center',
                          e.rank <= 3 && 'bg-amber-500/5',
                          e.currentUser && 'bg-neon-blue/10'
                        )}
                      >
                        <span
                          className={cn(
                            'font-mono font-bold tabular-nums',
                            e.rank === 1 && 'text-amber-400',
                            e.rank === 2 && 'text-slate-300',
                            e.rank === 3 && 'text-amber-700'
                          )}
                        >
                          #{e.rank}
                        </span>
                        <span className="truncate font-medium">
                          {e.displayName}
                          {e.currentUser && <span className="text-neon-cyan text-xs ml-1">you</span>}
                        </span>
                        <span className="font-semibold text-neon-cyan tabular-nums">{e.netScore.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 px-4 py-10 text-center">
                    No scores yet — be the first to attempt today&apos;s mock.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-cyber-600">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-neon-purple" />
                  All-India hall of fame
                </CardTitle>
                <CardDescription>Top aspirants by combined best net scores across all live mocks</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {overview?.hallOfFameTop10 && overview.hallOfFameTop10.length > 0 ? (
                  <ul className="divide-y divide-cyber-800">
                    {overview.hallOfFameTop10.map((e) => (
                      <li
                        key={e.userId}
                        className={cn(
                          'grid grid-cols-[2.5rem_1fr_auto] gap-2 px-4 py-3 text-sm items-center',
                          e.rank <= 3 && 'bg-neon-purple/5',
                          user?.userId === e.userId && 'bg-neon-blue/10'
                        )}
                      >
                        <span className="font-mono font-bold text-slate-400 tabular-nums">#{e.rank}</span>
                        <span className="truncate">
                          <span className="mr-1.5">{e.avatarEmoji}</span>
                          {e.displayName}
                        </span>
                        <span className="text-right">
                          <span className="font-semibold text-green-400 tabular-nums block">
                            {e.aggregateScore.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500">{e.mocksContributed} mocks</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 px-4 py-10 text-center">
                    Complete a few mocks to appear on the all-India leaderboard.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent mocks preview */}
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileQuestion className="h-5 w-5 text-neon-blue" /> More practice mocks
              </h2>
              <p className="text-sm text-slate-500 mt-1">Recent exams — browse all subjects on the Mocks tab</p>
            </div>
            {(otherMocks.length > 0 || mocks.length > 0) && (
              <Link to="/mocks">
                <Button variant="outline" size="sm" className="cursor-pointer gap-2">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {previewMocks.map((m) => (
              <MockExamCard key={m.id} mock={m} onStart={startMock} compact />
            ))}
            {previewMocks.length === 0 && !featured && !error && (
              <Card className="col-span-2 border-dashed border-cyber-700">
                <CardContent className="py-16 text-center text-slate-400">
                  <Sparkles className="h-10 w-10 mx-auto mb-3 text-slate-600" />
                  <p className="mb-4">No extra mocks yet. Today&apos;s mock is above when live.</p>
                  <Link to="/mocks">
                    <Button variant="outline" className="cursor-pointer">
                      Browse mocks
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
          {otherMocks.length > 4 && (
            <p className="text-center mt-6">
              <Link to="/mocks" className="text-neon-cyan text-sm hover:underline inline-flex items-center gap-1">
                +{otherMocks.length - 4} more mocks — view all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  )
}
