import { useEffect, useRef, useState } from 'react'
import { AppLogo } from '@/components/AppLogo'
import { cn } from '@/lib/utils'
import {
  isServerWarmInSession,
  markServerWarmInSession,
  pingHealth,
  WARMUP_SLOW_UI_MS,
  WARMUP_TARGET_SEC,
} from '@/lib/serverHealth'

/**
 * Non-blocking warm-up overlay — app always renders underneath.
 * Shown only on first visit when /health is slow (cold start).
 */
export function ServerWarmupGate({ children }: { children: React.ReactNode }) {
  const skip = isServerWarmInSession()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'connecting' | 'starting' | 'ready'>('connecting')
  const progressRef = useRef(0)
  const doneRef = useRef(skip)

  const secondsLeft = Math.max(1, Math.ceil(WARMUP_TARGET_SEC * (1 - progress / 92)))

  useEffect(() => {
    if (skip || doneRef.current) return

    let cancelled = false

    const slowTimer = window.setTimeout(() => {
      if (!cancelled && !doneRef.current) {
        setVisible(true)
        setPhase('starting')
      }
    }, WARMUP_SLOW_UI_MS)

    const progressTimer = window.setInterval(() => {
      if (progressRef.current >= 88 || doneRef.current) return
      progressRef.current = Math.min(88, progressRef.current + 0.5)
      setProgress(progressRef.current)
    }, 150)

    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      markServerWarmInSession()
      progressRef.current = 100
      setProgress(100)
      setPhase('ready')
      window.setTimeout(() => setVisible(false), 400)
    }

    const run = async () => {
      if (await pingHealth()) {
        if (cancelled) return
        window.clearTimeout(slowTimer)
        doneRef.current = true
        markServerWarmInSession()
        return
      }

      while (!cancelled && !doneRef.current) {
        await new Promise((r) => window.setTimeout(r, 2000))
        if (cancelled || doneRef.current) return
        if (await pingHealth()) {
          finish()
          return
        }
      }
    }

    void run()

    const failOpen = window.setTimeout(() => {
      if (!doneRef.current) finish()
    }, 90_000)

    return () => {
      cancelled = true
      window.clearTimeout(slowTimer)
      window.clearInterval(progressTimer)
      window.clearTimeout(failOpen)
    }
  }, [skip])

  return (
    <>
      {children}
      {visible && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070b14]/95 backdrop-blur-sm"
          role="dialog"
          aria-label="Starting server"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(34,211,238,0.12),transparent_55%)]" />
          <div className="relative z-10 w-full max-w-md mx-auto px-6 text-center">
            <div className="flex flex-col items-center gap-4 mb-8">
              <AppLogo
                showText={false}
                to={undefined}
                iconClassName="h-20 w-20 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/20"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple bg-clip-text text-transparent">
                  ItOfficerHub
                </h1>
                <p className="text-sm text-slate-500 mt-1 tracking-wide uppercase">IT Officer mock test arena</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-cyber-950/90 p-6 sm:p-8 shadow-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-neon-cyan mb-3">
                {phase === 'ready' ? 'Ready' : phase === 'starting' ? 'Starting server' : 'Connecting'}
              </p>
              <p className="text-slate-300 text-base font-medium mb-1">
                {phase === 'ready'
                  ? 'Loading your hub…'
                  : phase === 'starting'
                    ? `Preparing your session — about ${secondsLeft}s`
                    : 'Establishing secure connection…'}
              </p>
              <p className="text-slate-500 text-sm mb-6">
                {phase === 'starting'
                  ? 'Bringing the exam engine online. Usually ready within 30 seconds.'
                  : 'Please wait a moment.'}
              </p>
              <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
                <div
                  className={cn(
                    'h-full rounded-full bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple transition-[width] duration-300'
                  )}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-2 tabular-nums">{Math.round(progress)}%</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
