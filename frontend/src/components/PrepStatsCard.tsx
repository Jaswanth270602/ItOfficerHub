import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { topicShort } from '@/lib/topics'
import { BookMarked, Flame, Sparkles, Target, TrendingDown } from 'lucide-react'

interface TopicRow {
  topic: string
  shortLabel: string
  fullLabel: string
  total: number
  correct: number
  wrong: number
  unattempted: number
  accuracyPercent: number
}

interface PrepStats {
  totalAttempts: number
  uniqueMocksAttempted: number
  currentStreakDays: number
  bestNetScore: number
  revisionBookmarkCount: number
  prepPoints: number
  lifetimeTopicBreakdown: TopicRow[]
  challengePlan: { day: number; mockId: number | null; title: string; published: boolean; attempted: boolean }[]
}

export function PrepStatsCard() {
  const [stats, setStats] = useState<PrepStats | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/attempts/me/stats')
      .then((r) => {
        setStats(r.data)
        setError('')
      })
      .catch((e) => setError(apiErrorMessage(e, 'Could not load prep stats')))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (error || !stats) return null
  if (stats.totalAttempts === 0) return null

  const weakTopics = [...stats.lifetimeTopicBreakdown]
    .filter((t) => t.total >= 3)
    .sort((a, b) => a.accuracyPercent - b.accuracyPercent)
    .slice(0, 3)

  const nextChallenge = stats.challengePlan.find((d) => d.published && !d.attempted)

  return (
    <Card className="mb-10 border-neon-purple/25 bg-gradient-to-r from-cyber-950 to-cyber-900/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-neon-cyan" /> Your prep pulse
        </CardTitle>
        <CardDescription>Streak, weak topics, and revision bucket — all from your attempts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-lg border border-neon-purple/30 bg-violet-950/20 p-3 text-center">
            <Sparkles className="h-4 w-4 text-neon-purple mx-auto mb-1" />
            <p className="text-xl font-bold tabular-nums text-neon-purple">{stats.prepPoints ?? 0}</p>
            <p className="text-[10px] text-slate-500 uppercase">Prep points</p>
          </div>
          <div className="rounded-lg border border-cyber-700 bg-cyber-900/60 p-3 text-center">
            <Flame className="h-4 w-4 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold tabular-nums">{stats.currentStreakDays}</p>
            <p className="text-[10px] text-slate-500 uppercase">Day streak</p>
          </div>
          <div className="rounded-lg border border-cyber-700 bg-cyber-900/60 p-3 text-center">
            <p className="text-xl font-bold tabular-nums text-neon-cyan">{stats.uniqueMocksAttempted}</p>
            <p className="text-[10px] text-slate-500 uppercase">Mocks done</p>
          </div>
          <div className="rounded-lg border border-cyber-700 bg-cyber-900/60 p-3 text-center">
            <p className="text-xl font-bold tabular-nums text-green-400">{stats.bestNetScore.toFixed(2)}</p>
            <p className="text-[10px] text-slate-500 uppercase">Best net</p>
          </div>
          <div className="rounded-lg border border-cyber-700 bg-cyber-900/60 p-3 text-center">
            <BookMarked className="h-4 w-4 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-bold tabular-nums">{stats.revisionBookmarkCount}</p>
            <p className="text-[10px] text-slate-500 uppercase">Revision saved</p>
          </div>
        </div>

        {weakTopics.length > 0 && (
          <div>
            <p className="text-sm font-medium flex items-center gap-2 mb-2 text-slate-300">
              <TrendingDown className="h-4 w-4 text-red-400" /> Focus subjects
            </p>
            <div className="flex flex-wrap gap-2">
              {weakTopics.map((t) => (
                <span
                  key={t.topic}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full border font-mono',
                    t.accuracyPercent < 50
                      ? 'bg-red-950/40 text-red-300 border-red-800/50'
                      : 'bg-amber-950/30 text-amber-300 border-amber-800/40'
                  )}
                  title={t.fullLabel}
                >
                  {t.shortLabel || topicShort(t.topic)} · {Math.round(t.accuracyPercent)}%
                </span>
              ))}
            </div>
          </div>
        )}

        {nextChallenge && nextChallenge.mockId && (
          <p className="text-sm text-slate-400">
            30-day plan · Day {nextChallenge.day}:{' '}
            <Link to={`/mock/${nextChallenge.mockId}`} className="text-neon-cyan hover:underline">
              {nextChallenge.title}
            </Link>
          </p>
        )}

        <Link to="/revision">
          <Button variant="outline" size="sm" className="cursor-pointer">
            <BookMarked className="h-4 w-4" /> Open revision bucket
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
