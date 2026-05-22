import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Award,
  Calendar,
  CheckCircle2,
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

interface Mock {
  id: number
  title: string
  description: string
  difficulty: string
  questionCount: number
  timeLimitMinutes: number
  attemptsCount: number
  allowRetake: boolean
  publishedAt?: string
  featuredToday?: boolean
  attempted: boolean
  userAttemptCount: number
  bestNetScore: number | null
  latestAttemptId: number | null
  latestClearedCutoff: boolean
}

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
  const [mocks, setMocks] = useState<Mock[]>([])
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
        const data = mocksRes.data.map((m: Mock & { attempted?: boolean }) => ({
          ...m,
          attempted: m.attempted ?? false,
          userAttemptCount: m.userAttemptCount ?? 0,
          bestNetScore: m.bestNetScore ?? null,
          latestAttemptId: m.latestAttemptId ?? null,
          latestClearedCutoff: m.latestClearedCutoff ?? false,
          featuredToday: m.featuredToday ?? false,
        }))
        setMocks(data)
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
              <Sparkles className="h-3.5 w-3.5" /> IBPS SO IT Officer · Live arena
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
              Mock Test Command Center
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              One fresh mock drops when admin hits Publish. Climb the hall of fame, own the featured board, and
              share wins in Prep Mail.
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
                { label: 'Live mocks', value: overview.platformStats.totalMocks, icon: Zap },
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
        <p className="text-sm text-slate-500">Refreshes hall of fame &amp; featured mock every minute</p>
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

      {loading && <p className="text-slate-400 text-center py-16">Loading command center...</p>}

      {!loading && (
        <>
          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            {/* Mock of the day */}
            <Card className="lg:col-span-2 border-neon-cyan/30 bg-gradient-to-br from-cyber-900/90 to-cyber-950 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-neon-cyan/10 blur-3xl rounded-full" />
              <CardHeader className="relative">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30">
                    <Flame className="h-3 w-3" /> Mock of the day
                  </span>
                  {featured?.publishedAt && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-cyber-800 text-slate-300 border border-cyber-600">
                      <Calendar className="h-3 w-3" />
                      Released {formatReleaseDate(featured.publishedAt)}
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
                    <CardTitle className="text-xl text-slate-300">No live mock yet</CardTitle>
                    <CardDescription>
                      Admin publishes one mock at a time — check back after the next drop.
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
                            <RotateCcw className="h-4 w-4" /> Retake featured mock
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" /> Start today&apos;s mock
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
                  <Crown className="h-5 w-5 text-amber-400" /> Profile of the day
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
                        <p className="text-slate-500 text-xs">Featured score</p>
                        <p className="font-bold text-neon-cyan tabular-nums">
                          {overview.profileOfTheDay.featuredNetScore.toFixed(2)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-cyber-900/80 p-3 border border-cyber-700">
                        <p className="text-slate-500 text-xs">Rank</p>
                        <p className="font-bold tabular-nums">#{overview.profileOfTheDay.featuredRank}</p>
                      </div>
                      <div className="rounded-lg bg-cyber-900/80 p-3 border border-cyber-700 col-span-2">
                        <p className="text-slate-500 text-xs">Aggregate best (all mocks)</p>
                        <p className="font-bold text-green-400 tabular-nums">
                          {overview.profileOfTheDay.aggregateScore.toFixed(2)} pts
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      Leading on {overview.profileOfTheDay.featuredMockTitle} ·{' '}
                      {overview.profileOfTheDay.mocksAttempted} mocks attempted
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Be the first to attempt today&apos;s mock and claim this spot.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Leaderboards row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-10">
            <Card className="border-cyber-600">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  Today&apos;s mock · Top 10
                </CardTitle>
                <CardDescription>Best unique score on the featured mock only</CardDescription>
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
                  <p className="text-sm text-slate-500 px-4 py-10 text-center">No scores yet — start the featured mock.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-cyber-600">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-neon-purple" />
                  Hall of fame · Aggregate Top 10
                </CardTitle>
                <CardDescription>Sum of your best net scores across every published mock</CardDescription>
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
                  <p className="text-sm text-slate-500 px-4 py-10 text-center">Publish mocks to unlock the hall of fame.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* All mocks library */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-neon-blue" /> Mock library
            </h2>
            <p className="text-sm text-slate-500 mt-1">Every published exam — older drops stay available for practice</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {otherMocks.map((m) => (
              <Card
                key={m.id}
                className={cn(
                  'transition-all hover:shadow-lg hover:shadow-neon-blue/5',
                  m.attempted ? 'border-green-600/30' : 'hover:border-neon-blue/40',
                  m.featuredToday && 'ring-1 ring-neon-cyan/20'
                )}
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="pr-2 text-lg">{m.title}</CardTitle>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs px-2 py-1 rounded bg-neon-purple/20 text-neon-purple">
                        {m.difficulty}
                      </span>
                      {m.publishedAt && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-800 text-slate-400 border border-cyber-700">
                          {formatReleaseDate(m.publishedAt)}
                        </span>
                      )}
                      {m.attempted && (
                        <span className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Done
                        </span>
                      )}
                    </div>
                  </div>
                  <CardDescription>{m.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <FileQuestion className="h-4 w-4" /> {m.questionCount} Qs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {m.timeLimitMinutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {m.attemptsCount}
                    </span>
                  </div>
                  {m.attempted && m.bestNetScore != null && (
                    <p className="text-sm mb-4">
                      Best: <strong className="text-neon-cyan">{m.bestNetScore.toFixed(2)}</strong>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {m.attempted && m.latestAttemptId && (
                      <Link to={`/result/${m.latestAttemptId}`} className="flex-1 min-w-[120px]">
                        <Button variant="outline" className="w-full cursor-pointer">
                          Report
                        </Button>
                      </Link>
                    )}
                    {(!m.attempted || m.allowRetake) && (
                      <Button
                        className={cn('cursor-pointer flex-1 min-w-[120px]', m.attempted && 'gap-2')}
                        onClick={() => startMock(m.id)}
                      >
                        {m.attempted ? (
                          <>
                            <RotateCcw className="h-4 w-4" /> Retake
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" /> Start
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {otherMocks.length === 0 && !featured && !error && (
              <Card className="col-span-2 border-dashed border-cyber-700">
                <CardContent className="py-16 text-center text-slate-400">
                  <Sparkles className="h-10 w-10 mx-auto mb-3 text-slate-600" />
                  No published mocks yet. Import &amp; publish from Admin.
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}
