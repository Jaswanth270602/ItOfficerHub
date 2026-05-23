import { useEffect, useState } from 'react'
import { CalendarClock } from 'lucide-react'

interface Upcoming {
  id: number
  title: string
  mockCode?: string | null
  goLiveAt: string
  goLiveDateLabel: string
}

function msUntil(iso: string) {
  return Math.max(0, new Date(iso).getTime() - Date.now())
}

function formatCountdown(ms: number) {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 48) return null
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${s}s`
}

export function UpcomingMockBanner({ upcoming }: { upcoming: Upcoming }) {
  const [left, setLeft] = useState(() => formatCountdown(msUntil(upcoming.goLiveAt)))

  useEffect(() => {
    const t = setInterval(() => {
      setLeft(formatCountdown(msUntil(upcoming.goLiveAt)))
    }, 1000)
    return () => clearInterval(t)
  }, [upcoming.goLiveAt])

  return (
    <div className="mb-6 sm:mb-8 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 to-cyber-900/60 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <CalendarClock className="h-9 w-9 sm:h-10 sm:w-10 text-violet-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-violet-300 mb-1">Next daily mock</p>
            <p className="font-semibold text-white text-base sm:text-lg leading-snug break-words">{upcoming.title}</p>
            {upcoming.mockCode && (
              <p className="text-xs font-mono text-neon-cyan mt-0.5">{upcoming.mockCode}</p>
            )}
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Goes live <strong className="text-slate-200">{upcoming.goLiveDateLabel}</strong> at 12:00 AM IST · refresh
              after midnight
            </p>
          </div>
        </div>
        {left && (
          <div className="w-full sm:w-auto text-center px-4 py-3 rounded-lg bg-violet-500/15 border border-violet-500/25 shrink-0">
            <p className="text-[10px] uppercase text-slate-500">Starts in</p>
            <p className="text-xl sm:text-2xl font-bold text-violet-300 tabular-nums">{left}</p>
          </div>
        )}
      </div>
    </div>
  )
}
