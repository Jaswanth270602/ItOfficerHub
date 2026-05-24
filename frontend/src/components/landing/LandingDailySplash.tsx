import { useCallback, useEffect, useRef, useState } from 'react'
import {
  LANDING_SPLASH_MS,
  markLandingSplashSeen,
  shouldShowLandingSplash,
} from '@/lib/landingSplash'
import { cn } from '@/lib/utils'

type Phase = 'hidden' | 'visible' | 'exiting'

export function LandingDailySplash() {
  const [phase, setPhase] = useState<Phase>(() => (shouldShowLandingSplash() ? 'visible' : 'hidden'))
  const dismissed = useRef(false)

  const dismiss = useCallback(() => {
    if (dismissed.current || phase === 'hidden') return
    dismissed.current = true
    markLandingSplashSeen()
    setPhase('exiting')
  }, [phase])

  useEffect(() => {
    if (phase !== 'visible') return
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(dismiss, LANDING_SPLASH_MS)
    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [phase, dismiss])

  useEffect(() => {
    if (phase !== 'exiting') return
    const timer = window.setTimeout(() => {
      setPhase('hidden')
      document.body.style.overflow = ''
    }, 350)
    return () => window.clearTimeout(timer)
  }, [phase])

  if (phase === 'hidden') return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to ItOfficerHub"
      className={cn(
        'fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 cursor-pointer',
        'bg-gradient-to-br from-cyber-950 via-cyber-900 to-cyber-950',
        phase === 'exiting' && 'landing-splash-exit'
      )}
      onClick={dismiss}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') dismiss()
      }}
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(34,211,238,0.12),transparent_55%)] pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none"
        aria-hidden
      />

      <div className="relative text-center max-w-lg pointer-events-none select-none">
        <div className="flex flex-col items-center gap-4 mb-8">
          <img
            src="/logo.png"
            alt=""
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover ring-2 ring-cyan-500/40 shadow-[0_0_24px_rgba(34,211,238,0.25)]"
            width={80}
            height={80}
          />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            ItOfficerHub
          </h1>
        </div>

        <p className="text-lg sm:text-xl md:text-2xl text-slate-200 font-medium leading-relaxed">
          A Mock Test a Day Keeps Exam Fear Away{' '}
          <span className="landing-splash-smiley text-2xl sm:text-3xl md:text-4xl align-middle" aria-hidden>
            😊
          </span>
        </p>

        <p className="mt-8 text-xs sm:text-sm text-slate-500 animate-pulse">
          Tap anywhere to continue · New mock every day at midnight IST
        </p>
      </div>
    </div>
  )
}
