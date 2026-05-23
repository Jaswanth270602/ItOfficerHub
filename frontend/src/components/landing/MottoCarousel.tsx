import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MottoSlide {
  quote: string
  tag: string
  accent: 'cyan' | 'purple' | 'amber' | 'emerald'
}

const ACCENT_STYLES = {
  cyan: {
    border: 'border-neon-cyan/40',
    glow: 'shadow-[0_0_60px_-12px_rgba(34,211,238,0.35)]',
    text: 'text-neon-cyan',
    bg: 'from-neon-cyan/10 to-transparent',
  },
  purple: {
    border: 'border-neon-purple/40',
    glow: 'shadow-[0_0_60px_-12px_rgba(139,92,246,0.35)]',
    text: 'text-neon-purple',
    bg: 'from-neon-purple/10 to-transparent',
  },
  amber: {
    border: 'border-amber-400/40',
    glow: 'shadow-[0_0_60px_-12px_rgba(251,191,36,0.3)]',
    text: 'text-amber-400',
    bg: 'from-amber-500/10 to-transparent',
  },
  emerald: {
    border: 'border-emerald-400/40',
    glow: 'shadow-[0_0_60px_-12px_rgba(52,211,153,0.3)]',
    text: 'text-emerald-400',
    bg: 'from-emerald-500/10 to-transparent',
  },
} as const

const AUTO_MS = 5500

export function MottoCarousel({ slides }: { slides: MottoSlide[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + count) % count)
    },
    [count]
  )

  useEffect(() => {
    if (paused || count <= 1) return
    const t = setInterval(() => go(1), AUTO_MS)
    return () => clearInterval(t)
  }, [paused, go, count])

  const slide = slides[index]
  const style = ACCENT_STYLES[slide.accent]

  return (
    <div
      className="w-full max-w-4xl mx-auto px-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className={cn(
          'relative rounded-2xl border bg-gradient-to-br to-cyber-950/90 p-8 sm:p-12 md:p-14 transition-shadow duration-500',
          style.border,
          style.glow,
          style.bg
        )}
      >
        <Quote className={cn('h-10 w-10 sm:h-12 sm:w-12 mb-6 opacity-80', style.text)} aria-hidden />

        <div className="relative min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
          {slides.map((s, i) => (
            <blockquote
              key={s.tag}
              className={cn(
                'absolute inset-x-0 top-0 transition-all duration-700 ease-out',
                i === index
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 translate-y-4 pointer-events-none'
              )}
              aria-hidden={i !== index}
            >
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white leading-snug tracking-tight">
                {s.quote}
              </p>
              <footer className={cn('mt-6 text-sm sm:text-base font-medium uppercase tracking-widest', style.text)}>
                {s.tag}
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="flex gap-2" role="tablist" aria-label="Motto slides">
            {slides.map((s, i) => (
              <button
                key={s.tag}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show motto: ${s.tag}`}
                className={cn(
                  'h-2.5 rounded-full transition-all cursor-pointer min-w-[10px]',
                  i === index ? 'w-8 bg-white' : 'w-2.5 bg-slate-600 hover:bg-slate-400'
                )}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              className="h-11 w-11 rounded-lg border border-cyber-600 bg-cyber-900/80 flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors"
              onClick={() => go(-1)}
              aria-label="Previous motto"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="h-11 w-11 rounded-lg border border-cyber-600 bg-cyber-900/80 flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors"
              onClick={() => go(1)}
              aria-label="Next motto"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {slide.quote} — {slide.tag}
      </p>
    </div>
  )
}
