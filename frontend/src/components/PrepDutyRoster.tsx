import { useMemo } from 'react'
import { ActivityHeatmap, type HeatmapCell } from '@/components/ActivityHeatmap'
import type { DailyActivity } from '@/lib/practiceCatalog'
import { CalendarDays, Target } from 'lucide-react'

type Props = {
  log: DailyActivity[]
  activeDaysLast365: number
  longestStreakDays: number
  consistencyPercent: number
  currentStreakDays: number
}

const WEEKS_SHOWN = 12

export function PrepDutyRoster({
  log,
  activeDaysLast365,
  longestStreakDays,
  consistencyPercent,
  currentStreakDays,
}: Props) {
  const weeks = useMemo(() => {
    const activityMap = new Map<string, DailyActivity>()
    for (const d of log) activityMap.set(d.date, d)

    const today = new Date()
    today.setHours(12, 0, 0, 0)
    const now = new Date()
    const cols: HeatmapCell[][] = []
    const start = new Date(today)
    start.setDate(start.getDate() - WEEKS_SHOWN * 7 + 1)
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))

    const cursor = new Date(start)
    while (cursor <= today) {
      const week: HeatmapCell[] = []
      for (let i = 0; i < 7; i++) {
        const iso = cursor.toISOString().slice(0, 10)
        const entry = activityMap.get(iso)
        week.push({
          date: iso,
          count: entry?.attemptCount ?? 0,
          best: entry?.bestNetScore,
          future: cursor > now,
        })
        cursor.setDate(cursor.getDate() + 1)
      }
      cols.push(week)
    }
    return cols.slice(-WEEKS_SHOWN)
  }, [log])

  return (
    <div className="rounded-xl border border-cyber-700/80 bg-gradient-to-br from-cyber-950/80 to-cyber-900/40 p-4 sm:p-5">
      <div className="mb-4">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neon-purple mb-1">
          <CalendarDays className="h-3.5 w-3.5" /> Mock activity heatmap
        </p>
        <p className="text-sm text-slate-400 max-w-xl">
          Last 12 weeks — each square is one day. Brighter = more mocks submitted that day.
        </p>
      </div>

      <ActivityHeatmap
        weeks={weeks}
        stats={[
          { label: '12-wk consistency', value: `${consistencyPercent}%`, accentClass: 'text-neon-cyan' },
          { label: 'Active days', value: activeDaysLast365, accentClass: 'text-white' },
          { label: 'Best streak', value: longestStreakDays, accentClass: 'text-amber-400' },
          { label: 'Current streak', value: currentStreakDays, accentClass: 'text-emerald-400' },
        ]}
      />

      {activeDaysLast365 === 0 && (
        <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
          <Target className="h-3.5 w-3.5" /> Complete a mock to light up your first square.
        </p>
      )}
    </div>
  )
}
