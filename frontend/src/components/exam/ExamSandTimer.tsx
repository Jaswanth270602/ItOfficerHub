import { cn } from '@/lib/utils'

interface Props {
  secondsLeft: number
  totalSeconds: number
  className?: string
}

export function ExamSandTimer({ secondsLeft, totalSeconds, className }: Props) {
  const pct = totalSeconds > 0 ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)) : 0
  const urgent = secondsLeft <= 60
  const critical = secondsLeft <= 30

  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60
  const display = `${m}:${s.toString().padStart(2, '0')}`

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div
        className={cn(
          'relative w-14 h-[4.5rem] flex-shrink-0',
          urgent && 'animate-[pulse_1.2s_ease-in-out_infinite]'
        )}
        aria-hidden
      >
        {/* Hourglass frame */}
        <div
          className={cn(
            'absolute inset-0 border-2 rounded-sm',
            critical ? 'border-red-400/80' : urgent ? 'border-amber-400/70' : 'border-neon-cyan/50'
          )}
          style={{
            clipPath: 'polygon(8% 0%, 92% 0%, 58% 50%, 92% 100%, 8% 100%, 42% 50%)',
            background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.4) 50%, rgba(15,23,42,0.9) 100%)',
          }}
        />
        {/* Top sand (depletes) */}
        <div
          className="absolute left-[22%] right-[22%] top-[6%] h-[42%] overflow-hidden rounded-t-sm"
          style={{ clipPath: 'polygon(0 0, 100% 0, 72% 100%, 28% 100%)' }}
        >
          <div
            className={cn(
              'w-full bg-gradient-to-b transition-all duration-1000 ease-linear',
              critical ? 'from-red-500 to-amber-600' : urgent ? 'from-amber-400 to-orange-500' : 'from-neon-cyan to-neon-blue'
            )}
            style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
          />
        </div>
        {/* Bottom sand (fills as time runs) */}
        <div
          className="absolute left-[22%] right-[22%] bottom-[6%] h-[42%] overflow-hidden rounded-b-sm"
          style={{ clipPath: 'polygon(28% 0, 72% 0, 100% 100%, 0 100%)' }}
        >
          <div
            className={cn(
              'w-full bg-gradient-to-t transition-all duration-1000 ease-linear opacity-90',
              critical ? 'from-red-600 to-amber-500' : urgent ? 'from-orange-600 to-amber-400' : 'from-neon-blue to-neon-cyan'
            )}
            style={{ height: `${100 - pct}%` }}
          />
        </div>
        {/* Falling grain animation */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-3 overflow-hidden">
          <div
            className={cn(
              'w-full h-full rounded-full animate-[sandFall_1s_linear_infinite]',
              critical ? 'bg-red-400' : 'bg-amber-300/80'
            )}
          />
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Time left</p>
        <p
          className={cn(
            'text-3xl font-mono font-bold tabular-nums leading-none',
            critical ? 'text-red-400' : urgent ? 'text-amber-300' : 'text-neon-cyan'
          )}
        >
          {display}
        </p>
      </div>
      <style>{`
        @keyframes sandFall {
          0% { transform: translateY(-8px); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
