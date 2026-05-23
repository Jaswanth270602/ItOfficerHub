import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { DailyActivity } from '@/lib/practiceCatalog'
import { CalendarDays, Flame, Target } from 'lucide-react'

type Props = {
  log: DailyActivity[]
  activeDaysLast365: number
  longestStreakDays: number
  consistencyPercent: number
  currentStreakDays: number
}

function level(count: number): 0 | 1 | 2 | 3 {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  return 3
}

const LEVEL_CLASS: Record<number, string> = {
  0: 'bg-cyber-800/80 border-cyber-700/50',
  1: 'bg-neon-cyan/40 border-neon-cyan/30 shadow-[0_0_8px_rgba(34,211,238,0.15)]',
  2: 'bg-neon-cyan/60 border-neon-cyan/50 shadow-[0_0_10px_rgba(34,211,238,0.25)]',
  3: 'bg-amber-400/70 border-amber-300/60 shadow-[0_0_12px_rgba(251,191,36,0.35)]',
}

/** Vertical shift pills per week — daily mock activity grid. */
export function PrepDutyRoster({
  log,
  activeDaysLast365,
  longestStreakDays,
  consistencyPercent,
  currentStreakDays,
}: Props) {
  const activityMap = useMemo(() => {
    const m = new Map<string, DailyActivity>()
    for (const d of log) m.set(d.date, d)
    return m
  }, [log])

  const weeks = useMemo(() => {
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    const cols: { date: Date; count: number; best: number }[][] = []
    const start = new Date(today)
    start.setDate(start.getDate() - 26 * 7 + 1)
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))

    const cursor = new Date(start)
    while (cursor <= today) {
      const week: { date: Date; count: number; best: number }[] = []
      for (let i = 0; i < 7; i++) {
        const iso = cursor.toISOString().slice(0, 10)
        const entry = activityMap.get(iso)
        week.push({
          date: new Date(cursor),
          count: entry?.attemptCount ?? 0,
          best: entry?.bestNetScore ?? 0,
        })
        cursor.setDate(cursor.getDate() + 1)
      }
      cols.push(week)
    }
    return cols.slice(-26)
  }, [activityMap])

  const now = new Date()

  return (
    <div className="rounded-xl border border-cyber-700/80 bg-cyber-950/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neon-purple mb-1">
            <CalendarDays className="h-3.5 w-3.5" /> Officer duty roster
          </p>
          <p className="text-sm text-slate-400 max-w-md">
            Your mock submission log — each pill is a day on duty. Brighter = more attempts that day.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-center text-xs">
          <div>
            <p className="text-lg font-bold text-neon-cyan tabular-nums">{consistencyPercent}%</p>
            <p className="text-slate-500">Consistency</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums text-white">{activeDaysLast365}</p>
            <p className="text-slate-500">Active days</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums text-amber-400">{longestStreakDays}</p>
            <p className="text-slate-500">Best streak</p>
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums text-emerald-400 flex items-center justify-center gap-1">
              <Flame className="h-4 w-4" /> {currentStreakDays}
            </p>
            <p className="text-slate-500">Current</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1 min-w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => {
                const lv = level(day.count)
                const iso = day.date.toISOString().slice(0, 10)
                const future = day.date > now
                return (
                  <div
                    key={iso}
                    title={
                      day.count > 0
                        ? `${iso}: ${day.count} mock(s), best ${day.best.toFixed(2)}`
                        : `${iso}: off duty`
                    }
                    className={cn(
                      'w-3 sm:w-3.5 h-7 sm:h-8 rounded-full border transition-all',
                      future ? 'opacity-20 bg-cyber-900 border-cyber-800' : LEVEL_CLASS[lv]
                    )}
                    aria-label={`${iso} ${day.count} attempts`}
                  />
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-3 rounded-full bg-cyber-800 border border-cyber-700" /> Off duty
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-3 rounded-full bg-neon-cyan/50" /> 1 mock
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-3 rounded-full bg-neon-cyan/70" /> 2 mocks
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-3 rounded-full bg-amber-400/70" /> 3+ mocks
          </span>
        </div>
      </div>

      {activeDaysLast365 === 0 && (
        <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
          <Target className="h-3.5 w-3.5" /> Complete a mock to start your duty roster.
        </p>
      )}
    </div>
  )
}
