import { cn } from '@/lib/utils'
import { Activity, BarChart3, Trophy } from 'lucide-react'

const LEADERBOARD = [
  { rank: 1, name: 'Priya S.', score: '18.75' },
  { rank: 2, name: 'Rahul K.', score: '17.50' },
  { rank: 3, name: 'Ananya M.', score: '16.25' },
  { rank: 4, name: 'You?', score: '—', highlight: true },
]

const WEAK_TOPICS = [
  { topic: 'Computer Networks', pct: 78, tone: 'strong' as const },
  { topic: 'DBMS', pct: 62, tone: 'mid' as const },
  { topic: 'Security', pct: 41, tone: 'weak' as const },
  { topic: 'Data Structures', pct: 35, tone: 'weak' as const },
]

/** Decorative previews — illustrates real dashboard features (leaderboard, analytics, activity). */
export function LandingPlatformShowcase() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-10 sm:mb-12">
      <div className="rounded-xl border border-neon-cyan/25 bg-gradient-to-br from-cyber-900/90 to-cyber-950 p-4 sm:p-5 shadow-lg shadow-black/20">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-4 w-4 text-amber-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neon-cyan">All-India rank</p>
        </div>
        <p className="text-sm font-medium text-white mb-3">Today&apos;s mock leaderboard</p>
        <ul className="space-y-2">
          {LEADERBOARD.map((row) => (
            <li
              key={row.rank}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm',
                row.highlight
                  ? 'border border-dashed border-neon-purple/40 bg-neon-purple/5'
                  : 'bg-cyber-800/40'
              )}
            >
              <span
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                  row.rank === 1 && 'bg-amber-500/20 text-amber-300',
                  row.rank === 2 && 'bg-slate-400/20 text-slate-300',
                  row.rank === 3 && 'bg-orange-600/20 text-orange-300',
                  row.highlight && 'bg-neon-purple/20 text-neon-purple'
                )}
              >
                {row.highlight ? '?' : row.rank}
              </span>
              <span className={cn('flex-1 truncate', row.highlight ? 'text-neon-purple' : 'text-slate-200')}>
                {row.name}
              </span>
              <span className="tabular-nums text-slate-400 text-xs">{row.score}</span>
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-slate-500 mt-3">Fair rank — best unique score per aspirant</p>
      </div>

      <div className="rounded-xl border border-neon-purple/25 bg-gradient-to-br from-cyber-900/90 to-cyber-950 p-4 sm:p-5 shadow-lg shadow-black/20">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-neon-purple" />
          <p className="text-xs font-semibold uppercase tracking-widest text-neon-purple">Chapter analytics</p>
        </div>
        <p className="text-sm font-medium text-white mb-3">Know your weak spots</p>
        <ul className="space-y-3">
          {WEAK_TOPICS.map(({ topic, pct, tone }) => (
            <li key={topic}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 truncate pr-2">{topic}</span>
                <span
                  className={cn(
                    'tabular-nums shrink-0',
                    tone === 'strong' && 'text-emerald-400',
                    tone === 'mid' && 'text-neon-cyan',
                    tone === 'weak' && 'text-amber-400'
                  )}
                >
                  {pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-cyber-800 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    tone === 'strong' && 'bg-emerald-500',
                    tone === 'mid' && 'bg-neon-cyan',
                    tone === 'weak' && 'bg-amber-500'
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-slate-500 mt-3">Auto-tagged from mock attempts — revise what hurts</p>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-cyber-900/90 to-cyber-950 p-4 sm:p-5 shadow-lg shadow-black/20 md:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-emerald-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Prep streak</p>
        </div>
        <p className="text-sm font-medium text-white mb-3">Daily mock activity</p>
        <LandingActivityPreview />
        <div className="flex flex-wrap gap-3 mt-3 text-[10px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-cyber-700" /> Rest day
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-neon-cyan/50" /> 1 mock
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-amber-400/70" /> 2+ mocks
          </span>
        </div>
      </div>
    </div>
  )
}

function LandingActivityPreview() {
  const pattern = [
    [0, 1, 2, 1, 0, 3, 0],
    [1, 0, 2, 0, 1, 0, 2],
    [0, 2, 1, 3, 2, 1, 0],
    [2, 1, 0, 1, 0, 2, 1],
    [1, 0, 3, 2, 1, 0, 0],
    [0, 1, 1, 0, 2, 3, 1],
    [2, 0, 1, 2, 0, 1, 3],
    [1, 2, 0, 1, 3, 0, 2],
  ]
  const levelClass: Record<number, string> = {
    0: 'bg-cyber-800/90',
    1: 'bg-neon-cyan/45',
    2: 'bg-neon-cyan/65',
    3: 'bg-amber-400/75 shadow-[0_0_6px_rgba(251,191,36,0.3)]',
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-flex gap-[3px] min-w-0">
        {pattern.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((lvl, di) => (
              <div
                key={`${wi}-${di}`}
                className={cn('w-[10px] h-[18px] sm:w-[11px] sm:h-[20px] rounded-[3px]', levelClass[lvl])}
                aria-hidden
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
