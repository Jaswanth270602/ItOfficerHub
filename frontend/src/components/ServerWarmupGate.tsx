import { useCallback, useEffect, useRef, useState } from 'react'
import { AppLogo } from '@/components/AppLogo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  isServerWarmInSession,
  markServerWarmInSession,
  waitForServer,
  WARMUP_SLOW_UI_MS,
  WARMUP_TARGET_SEC,
} from '@/lib/serverHealth'
import { RefreshCw, Server } from 'lucide-react'

type GatePhase = 'checking' | 'warming' | 'ready' | 'failed'

export function ServerWarmupGate({ children }: { children: React.ReactNode }) {
  const skipInitial = isServerWarmInSession()
  const [passed, setPassed] = useState(skipInitial)
  const [phase, setPhase] = useState<GatePhase>(skipInitial ? 'ready' : 'checking')
  const [progress, setProgress] = useState(skipInitial ? 100 : 0)
  const [showDetail, setShowDetail] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const progressRef = useRef(skipInitial ? 100 : 0)

  const secondsLeft = Math.max(1, Math.ceil(WARMUP_TARGET_SEC * (1 - progress / 92)))

  const finish = useCallback(() => {
    progressRef.current = 100
    setProgress(100)
    setPhase('ready')
    markServerWarmInSession()
    window.setTimeout(() => setPassed(true), 450)
  }, [])

  useEffect(() => {
    if (skipInitial) return

    setPhase('checking')
    setShowDetail(false)
    progressRef.current = 0
    setProgress(0)

    const ac = new AbortController()

    const slowTimer = window.setTimeout(() => {
      setShowDetail(true)
      setPhase('warming')
    }, WARMUP_SLOW_UI_MS)

    const progressTimer = window.setInterval(() => {
      if (progressRef.current >= 88) return
      progressRef.current = Math.min(88, progressRef.current + 0.45)
      setProgress(progressRef.current)
    }, 150)

    void waitForServer(ac.signal).then((ok) => {
      window.clearTimeout(slowTimer)
      window.clearInterval(progressTimer)
      if (ac.signal.aborted) return
      if (ok) finish()
      else setPhase('failed')
    })

    return () => {
      ac.abort()
      window.clearTimeout(slowTimer)
      window.clearInterval(progressTimer)
    }
  }, [attempt, finish, skipInitial])

  if (passed) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070b14] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(34,211,238,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_90%,rgba(139,92,246,0.1),transparent_50%)]" />

      <div className="relative z-10 w-full max-w-md mx-auto px-6 text-center">
        <div className="flex flex-col items-center gap-4 mb-8">
          <AppLogo showText={false} to={undefined} iconClassName="h-20 w-20 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/20" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple bg-clip-text text-transparent">
              ItOfficerHub
            </h1>
            <p className="text-sm text-slate-500 mt-1 tracking-wide uppercase">IT Officer mock test arena</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-cyber-950/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-2 text-neon-cyan mb-4">
            <Server className={cn('h-5 w-5', phase !== 'failed' && 'animate-pulse')} />
            <span className="text-sm font-semibold uppercase tracking-wider">
              {phase === 'failed'
                ? 'Connection timed out'
                : phase === 'ready'
                  ? 'Ready'
                  : showDetail
                    ? 'Starting server'
                    : 'Connecting'}
            </span>
          </div>

          {phase !== 'failed' && (
            <>
              <p className="text-slate-300 text-base sm:text-lg font-medium mb-1">
                {phase === 'ready'
                  ? 'You’re all set — loading your hub…'
                  : showDetail
                    ? `Preparing your session — about ${secondsLeft}s`
                    : 'Establishing secure connection…'}
              </p>
              <p className="text-slate-500 text-sm mb-6 min-h-[2.5rem]">
                {showDetail
                  ? 'We’re bringing the exam engine online. Startup usually completes within 30 seconds.'
                  : 'Please wait a moment.'}
              </p>

              <div className="h-2.5 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/50">
                <div
                  className={cn(
                    'h-full rounded-full transition-[width] duration-300 ease-out',
                    'bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple',
                    phase === 'ready' && 'shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                  )}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-2 tabular-nums">{Math.round(progress)}%</p>
            </>
          )}

          {phase === 'failed' && (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">
                The server didn’t respond in time. Check your network and try again.
              </p>
              <Button className="cursor-pointer gap-2 w-full" onClick={() => setAttempt((a) => a + 1)}>
                <RefreshCw className="h-4 w-4" /> Try again
              </Button>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-600 mt-6">IBPS SO IT Officer · PSU IT · TCS NQT practice</p>
      </div>
    </div>
  )
}
