import { useEffect, useState } from 'react'
import { formatCountdown, msUntilNextIstMidnight } from '@/lib/dailyQuiz'
import { Clock } from 'lucide-react'

export function DailyQuizCountdown({ className }: { className?: string }) {
  const [ms, setMs] = useState(() => msUntilNextIstMidnight())

  useEffect(() => {
    const id = window.setInterval(() => setMs(msUntilNextIstMidnight()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <p className={className ?? 'inline-flex items-center gap-1.5 text-xs text-slate-400 tabular-nums'}>
      <Clock className="h-3.5 w-3.5 text-neon-cyan shrink-0" />
      Next Daily 10 in <span className="text-neon-cyan font-semibold">{formatCountdown(ms)}</span>
    </p>
  )
}
