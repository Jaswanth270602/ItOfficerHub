import { cn } from '@/lib/utils'

export type HeatmapCell = {
  date: string
  count: number
  best?: number
  future?: boolean
}

export type HeatmapStat = {
  label: string
  value: string | number
  accentClass?: string
}

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'] as const

function level(count: number): 0 | 1 | 2 | 3 {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count === 2) return 2
  return 3
}

const LEVEL_CLASS: Record<number, string> = {
  0: 'bg-cyber-800 border-cyber-700/60',
  1: 'bg-cyan-500/70 border-cyan-400/50 shadow-[0_0_6px_rgba(34,211,238,0.35)]',
  2: 'bg-cyan-400/85 border-cyan-300/60 shadow-[0_0_8px_rgba(34,211,238,0.45)]',
  3: 'bg-amber-400/90 border-amber-300/70 shadow-[0_0_10px_rgba(251,191,36,0.45)]',
}

type Props = {
  weeks: HeatmapCell[][]
  stats?: HeatmapStat[]
  compact?: boolean
  className?: string
}

export function ActivityHeatmap({ weeks, stats, compact, className }: Props) {
  const todayIso = new Date().toISOString().slice(0, 10)
  const cellSize = compact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'

  return (
    <div className={cn('space-y-4', className)}>
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-cyber-700/70 bg-cyber-900/40 px-3 py-2 text-center"
            >
              <p className={cn('text-lg font-bold tabular-nums', s.accentClass ?? 'text-white')}>{s.value}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="inline-flex gap-2 min-w-0">
          <div className={cn('flex flex-col justify-between shrink-0 text-[10px] text-slate-500 py-0.5', compact ? 'gap-[6px]' : 'gap-[7px] sm:gap-[8px]')}>
            {DAY_LABELS.map((label, i) => (
              <span key={i} className={cn('h-3.5 sm:h-4 flex items-center leading-none', !label && 'invisible')}>
                {label || '·'}
              </span>
            ))}
          </div>
          <div className="flex gap-1 sm:gap-1.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1 sm:gap-1.5">
                {week.map((day) => {
                  const lv = day.future ? 0 : level(day.count)
                  const isToday = day.date === todayIso
                  return (
                    <div
                      key={day.date}
                      title={
                        day.future
                          ? `${day.date}: upcoming`
                          : day.count > 0
                            ? `${day.date}: ${day.count} mock(s)${day.best != null ? `, best ${day.best.toFixed(2)}` : ''}`
                            : `${day.date}: rest day`
                      }
                      className={cn(
                        cellSize,
                        'rounded-[4px] border transition-transform hover:scale-110',
                        day.future ? 'bg-cyber-900/50 border-cyber-800/40 opacity-40' : LEVEL_CLASS[lv],
                        isToday && !day.future && 'ring-2 ring-white/80 ring-offset-1 ring-offset-cyber-950'
                      )}
                      aria-label={`${day.date} ${day.count} attempts`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400">
        <span className="text-slate-500 font-medium">Legend:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className={cn(cellSize, 'rounded-[4px] border', LEVEL_CLASS[0])} /> Rest day
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={cn(cellSize, 'rounded-[4px] border', LEVEL_CLASS[1])} /> 1 mock
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={cn(cellSize, 'rounded-[4px] border', LEVEL_CLASS[2])} /> 2 mocks
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className={cn(cellSize, 'rounded-[4px] border', LEVEL_CLASS[3])} /> 3+ mocks
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-500">
          <span className={cn(cellSize, 'rounded-[4px] ring-2 ring-white/80 ring-offset-1 ring-offset-cyber-950 bg-cyan-500/70 border border-cyan-400/50')} /> Today
        </span>
      </div>
    </div>
  )
}

/** Demo pattern for landing page — last 12 weeks with realistic activity. */
export function buildDemoHeatmapWeeks(): HeatmapCell[][] {
  const pattern = [
    [0, 1, 0, 2, 1, 0, 1],
    [1, 0, 2, 0, 1, 3, 0],
    [0, 2, 1, 1, 0, 2, 1],
    [2, 1, 0, 3, 2, 0, 1],
    [1, 0, 1, 0, 2, 1, 0],
    [0, 3, 2, 1, 0, 2, 2],
    [1, 2, 0, 1, 3, 1, 0],
    [0, 1, 2, 0, 1, 0, 3],
    [2, 0, 1, 2, 0, 1, 1],
    [1, 1, 0, 0, 2, 3, 0],
    [0, 2, 3, 1, 1, 0, 2],
    [1, 0, 1, 2, 0, 2, 1],
  ]
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const cols: HeatmapCell[][] = []
  const start = new Date(today)
  start.setDate(start.getDate() - pattern.length * 7 + 1)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))

  const cursor = new Date(start)
  for (let w = 0; w < pattern.length; w++) {
    const week: HeatmapCell[] = []
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10)
      const count = pattern[w][d]
      week.push({
        date: iso,
        count: cursor > today ? 0 : count,
        future: cursor > today,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    cols.push(week)
  }
  return cols
}


