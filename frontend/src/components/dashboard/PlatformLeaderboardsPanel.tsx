import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Award, BarChart3, Crown, ExternalLink, RefreshCw, Trophy } from 'lucide-react'

export interface HallEntry {
  rank: number
  userId: number
  displayName: string
  avatarEmoji: string
  aggregateScore: number
  mocksContributed: number
}

export interface LeaderRow {
  rank: number
  userId: number
  displayName: string
  netScore: number
  currentUser?: boolean
}

export interface ProfileOfDay {
  userId: number
  displayName: string
  avatarEmoji: string
  headline: string
  featuredNetScore: number
  featuredRank: number
  featuredMockTitle: string
  aggregateScore: number
  spotlightExpiresAt?: string
}

export interface PlatformOverview {
  profileOfTheDay: ProfileOfDay | null
  hallOfFameTop10: HallEntry[]
  todaysMockLeaderboard: LeaderRow[]
  mockOfTheDay?: { id: number; title: string } | null
  upcomingMock?: { title: string; goLiveDateLabel: string } | null
}

type Props = {
  overview: PlatformOverview | null
  loading?: boolean
  onRefresh?: () => void
  adminView?: boolean
  highlightUserId?: number
}

function AggregateBarChart({ entries }: { entries: HallEntry[] }) {
  if (!entries.length) return null
  const max = Math.max(...entries.map((e) => e.aggregateScore), 1)

  return (
    <div className="mt-4 pt-4 border-t border-cyber-800 space-y-2.5">
      <p className="text-xs font-medium uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
        <BarChart3 className="h-3.5 w-3.5 text-neon-purple" /> Aggregate score chart
      </p>
      {entries.slice(0, 10).map((e) => (
        <div key={e.userId} className="grid grid-cols-[2rem_1fr_auto] gap-2 items-center text-xs">
          <span className="font-mono text-slate-500 tabular-nums">#{e.rank}</span>
          <div className="min-w-0">
            <div className="flex justify-between gap-2 mb-1">
              <span className="truncate text-slate-300">
                {e.avatarEmoji} {e.displayName}
              </span>
              <span className="tabular-nums text-green-400 shrink-0">{e.aggregateScore.toFixed(2)}</span>
            </div>
            <div className="h-2 rounded-full bg-cyber-800 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  e.rank === 1 && 'bg-amber-400',
                  e.rank === 2 && 'bg-slate-400',
                  e.rank === 3 && 'bg-orange-600',
                  e.rank > 3 && 'bg-neon-purple/70'
                )}
                style={{ width: `${Math.max(4, (e.aggregateScore / max) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-slate-500 tabular-nums w-12 text-right">{e.mocksContributed}m</span>
        </div>
      ))}
    </div>
  )
}

export function PlatformLeaderboardsPanel({
  overview,
  loading,
  onRefresh,
  adminView,
  highlightUserId,
}: Props) {
  const featured = overview?.mockOfTheDay
  const upcoming = overview?.upcomingMock

  return (
    <section className="mb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            {adminView ? 'Live platform rankings' : 'Rankings'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {adminView
              ? 'Same view students see on the dashboard — daily mock board & all-time aggregate.'
              : 'Daily mock champions and all-time aggregate leaders'}
          </p>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
            </Button>
          )}
          {adminView && (
            <Link to="/dashboard" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="cursor-pointer gap-1">
                Student view <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-cyber-950 lg:col-span-1">
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
                  {overview.profileOfTheDay.featuredMockTitle} · submitted today
                </p>
                {overview.profileOfTheDay.spotlightExpiresAt && (
                  <p className="text-[11px] text-amber-400/80">
                    Featured until{' '}
                    {new Date(overview.profileOfTheDay.spotlightExpiresAt).toLocaleString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                )}
              </div>
            ) : featured ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No aspirant yet — top scorer among today&apos;s submissions wins for 24h.
              </p>
            ) : upcoming ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Unlocks when today&apos;s mock goes live ({upcoming.goLiveDateLabel}).
              </p>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No daily mock scheduled for today.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-cyber-600 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-amber-400" />
              Daily champions · Top 10
            </CardTitle>
            <CardDescription>
              {featured
                ? `Today's mock: ${featured.title} — best score among attempts submitted today (IST).`
                : 'Today\'s mock leaderboard — best score per aspirant submitted today.'}
            </CardDescription>
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
                      (e.currentUser || highlightUserId === e.userId) && 'bg-neon-blue/10'
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
                    <span className="truncate font-medium">{e.displayName}</span>
                    <span className="font-semibold text-neon-cyan tabular-nums">{e.netScore.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : featured ? (
              <p className="text-sm text-slate-500 px-4 py-10 text-center">
                No scores yet — waiting for first submission on today&apos;s mock.
              </p>
            ) : (
              <p className="text-sm text-slate-500 px-4 py-10 text-center">
                Daily board unlocks when today&apos;s mock is live.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-cyber-600">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="h-5 w-5 text-neon-purple" />
            All-time aggregate leaderboard
          </CardTitle>
          <CardDescription>
            Sum of best net score on each live mock — higher total = stronger overall prep.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pb-4">
          {overview?.hallOfFameTop10 && overview.hallOfFameTop10.length > 0 ? (
            <>
              <ul className="divide-y divide-cyber-800">
                {overview.hallOfFameTop10.map((e) => (
                  <li
                    key={e.userId}
                    className={cn(
                      'grid grid-cols-[2.5rem_1fr_auto] gap-2 px-4 py-3 text-sm items-center',
                      e.rank <= 3 && 'bg-neon-purple/5',
                      highlightUserId === e.userId && 'bg-neon-blue/10'
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
              <div className="px-4">
                <AggregateBarChart entries={overview.hallOfFameTop10} />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 px-4 py-10 text-center">
              No aggregate rankings yet — students need to complete mocks first.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
