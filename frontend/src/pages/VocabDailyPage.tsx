import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '@/components/Seo'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  BookOpen,
  Download,
  Gift,
  Smartphone,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const SCREENSHOTS = [
  {
    src: '/vocab-daily/widget.png',
    label: 'Home widget',
    caption: 'One new word on your home screen every day',
  },
  {
    src: '/vocab-daily/home.png',
    label: 'Today’s word',
    caption: 'Meaning, root, and example — same as the widget',
  },
  {
    src: '/vocab-daily/practice.png',
    label: 'Exam bank',
    caption: 'Idioms, phrasal verbs & one-word substitutes',
  },
] as const

const EXAMS = [
  'SBI PO / Clerk',
  'IBPS PO / Clerk',
  'IBPS SO / All SO',
  'SSC CGL',
  'SSC CHSL',
  'SSC MTS',
  'Other bank & SSC exams',
] as const

function downloadApk() {
  // Same-origin API — increments download count, then streams the APK
  window.location.assign('/api/public/vocab-daily/download')
}

export function VocabDailyPage() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setActive((i) => (i + 1) % SCREENSHOTS.length)
  }, [])

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + SCREENSHOTS.length) % SCREENSHOTS.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(next, 3200)
    return () => window.clearInterval(id)
  }, [next, paused])

  return (
    <>
      <Seo
        path="/vocab-daily"
        title="Vocab Daily — Free English Vocabulary Widget APK"
        description="Free English vocabulary home-widget app. One word a day plus idioms, phrasal verbs and one-word substitutes. Built for SBI, IBPS, SSC and more. Download the free APK."
        keywords="Vocab Daily, free vocabulary app, English word of the day, IBPS vocabulary, SSC CGL English, phrasal verbs, idioms, one word substitution, free APK"
      />

      <div className="relative min-h-[calc(100dvh-3.5rem)] overflow-hidden">
        {/* Atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#061018] via-cyber-950 to-[#0a1210]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(52,211,153,0.18),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(251,146,60,0.12),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_90%,rgba(34,211,238,0.1),transparent_50%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 3px)',
          }}
        />

        <div className="relative page-container py-6 sm:py-10 pb-16">
          {/* Top bar */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-300 mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to dashboard
              </Link>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/90 mb-2">
                <Gift className="h-3.5 w-3.5" /> 100% free · no ads · no login wall
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                Vocab Daily
              </h1>
              <p className="mt-2 text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
                Free English vocabulary widget — one fresh word every day on your home screen, plus
                meanings, idioms, phrasal verbs and one-word substitutes inside the app.
              </p>
            </div>

            {/* Fancy download CTA — top right */}
            <button
              type="button"
              onClick={downloadApk}
              className="group relative w-full sm:w-auto shrink-0 overflow-hidden rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-cyber-900/80 to-orange-500/15 px-5 py-4 text-left shadow-[0_0_40px_-12px_rgba(52,211,153,0.55)] hover:border-emerald-300/60 hover:shadow-[0_0_50px_-8px_rgba(52,211,153,0.7)] transition-all cursor-pointer"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)] animate-pulse" />
              <div className="relative flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-cyber-950 shadow-lg shadow-emerald-500/30">
                  <Download className="h-6 w-6" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-widest text-emerald-300/90 font-semibold">
                    Free APK
                  </span>
                  <span className="block text-lg font-bold text-white leading-tight">Download the app</span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">Install on Android · ~5 MB</span>
                </span>
              </div>
            </button>
          </div>

          {/* Hologram carousel */}
          <section
            className="mb-10 sm:mb-14"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-label="Vocab Daily app screenshots"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-300" />
                See how it works
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prev}
                  className="h-9 w-9 rounded-full border border-emerald-500/30 bg-cyber-900/70 text-emerald-200 hover:bg-emerald-500/15 transition-colors cursor-pointer inline-flex items-center justify-center"
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="h-9 w-9 rounded-full border border-emerald-500/30 bg-cyber-900/70 text-emerald-200 hover:bg-emerald-500/15 transition-colors cursor-pointer inline-flex items-center justify-center"
                  aria-label="Next screenshot"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative h-[380px] sm:h-[460px] md:h-[520px] flex items-center justify-center vocab-carousel-stage">
              {/* Hologram glow plate */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-8 rounded-[100%] bg-emerald-400/25 blur-2xl vocab-holo-pulse" />
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[70%] rounded-[40%] border border-emerald-400/10 bg-gradient-to-b from-emerald-400/5 to-transparent blur-sm" />

              {SCREENSHOTS.map((shot, i) => {
                const offset = (i - active + SCREENSHOTS.length) % SCREENSHOTS.length
                let pos = offset
                if (offset === SCREENSHOTS.length - 1) pos = -1
                const isCenter = pos === 0
                const isSide = Math.abs(pos) === 1
                if (!isCenter && !isSide) return null

                return (
                  <button
                    key={shot.src}
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      'absolute transition-all duration-500 ease-out cursor-pointer focus:outline-none will-change-transform',
                      isCenter ? 'z-20' : 'z-10',
                      pos === -1 && 'vocab-shot-left',
                      pos === 0 && 'vocab-shot-center',
                      pos === 1 && 'vocab-shot-right',
                    )}
                    aria-label={shot.label}
                    aria-current={isCenter ? 'true' : undefined}
                  >
                    <div
                      className={cn(
                        'relative rounded-[1.4rem] p-[2px] transition-shadow duration-500',
                        isCenter
                          ? 'shadow-[0_0_50px_-8px_rgba(52,211,153,0.65),0_20px_40px_-20px_rgba(0,0,0,0.8)] vocab-holo-ring'
                          : 'shadow-xl shadow-black/40',
                      )}
                    >
                      <div className="rounded-[1.35rem] overflow-hidden border border-white/15 bg-cyber-900/40 backdrop-blur-sm">
                        <img
                          src={shot.src}
                          alt={shot.caption}
                          className="block w-[200px] sm:w-[240px] md:w-[280px] h-auto select-none"
                          draggable={false}
                        />
                      </div>
                      {isCenter && (
                        <div className="pointer-events-none absolute inset-0 rounded-[1.4rem] bg-gradient-to-tr from-emerald-300/10 via-transparent to-orange-300/10 mix-blend-screen" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="text-center mt-2">
              <p className="text-sm font-semibold text-white">{SCREENSHOTS[active].label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{SCREENSHOTS[active].caption}</p>
              <div className="flex justify-center gap-1.5 mt-3">
                {SCREENSHOTS.map((s, i) => (
                  <button
                    key={s.src}
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all cursor-pointer',
                      i === active ? 'w-6 bg-emerald-400' : 'w-1.5 bg-slate-600 hover:bg-slate-400',
                    )}
                    aria-label={`Show ${s.label}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Why free / APK note */}
          <section className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-cyber-900/50 to-cyber-950 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-emerald-300 mb-3">
                <Gift className="h-5 w-5" />
                <h2 className="text-lg font-semibold text-white">Absolutely free</h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Vocab Daily was developed{' '}
                <strong className="text-white">absolutely for free</strong> for aspirants — no
                subscription, no paid unlocks. A daily English word on your home screen, with practice
                decks for meanings, idioms, one-word substitutes (OWS) and phrasal verbs inside the app.
              </p>
            </div>
            <div className="rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 via-cyber-900/50 to-cyber-950 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-orange-300 mb-3">
                <Smartphone className="h-5 w-5" />
                <h2 className="text-lg font-semibold text-white">APK download (for now)</h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Because this app is free and we are not monetising it, we cannot publish it on the Play
                Store yet. We are proceeding with a direct{' '}
                <strong className="text-white">Android APK</strong> so you can install it today. After
                download, open the file and allow install from this source if Android asks.
              </p>
            </div>
          </section>

          {/* Exams */}
          <section className="rounded-2xl border border-cyber-600/80 bg-cyber-900/40 p-5 sm:p-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-neon-cyan" />
              <h2 className="text-lg font-semibold text-white">Built for every exam aspirant</h2>
            </div>
            <p className="text-sm text-slate-400 mb-4 max-w-2xl leading-relaxed">
              Strong English vocabulary helps across bank and SSC papers — use Vocab Daily alongside your
              mocks on ItOfficerHub.
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMS.map((exam) => (
                <span
                  key={exam}
                  className="rounded-lg border border-cyber-600 bg-cyber-950/70 px-3 py-1.5 text-xs font-medium text-slate-300"
                >
                  {exam}
                </span>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section className="rounded-2xl border border-cyber-600/80 bg-cyber-950/50 p-5 sm:p-6 mb-10">
            <h2 className="text-lg font-semibold text-white mb-4">How it works</h2>
            <ol className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  1
                </span>
                <span>
                  <strong className="text-white">Home widget</strong> — one new word each day from day 1,
                  then loops. Advances at local midnight.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  2
                </span>
                <span>
                  <strong className="text-white">Left swipe</strong> — random vocabulary from the full bank
                  (not daily order).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  3
                </span>
                <span>
                  <strong className="text-white">Right swipe</strong> — idioms, phrasal verbs and one-word
                  substitutes for exam practice.
                </span>
              </li>
            </ol>
          </section>

          {/* Bottom CTA */}
          <div className="text-center">
            <button
              type="button"
              onClick={downloadApk}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-cyber-950 font-bold px-8 py-3.5 text-base shadow-[0_0_30px_-6px_rgba(52,211,153,0.7)] transition-colors cursor-pointer"
            >
              <Download className="h-5 w-5" />
              Download Vocab Daily APK
            </button>
            <p className="text-xs text-slate-500 mt-3">
              Free forever · Android APK · Developed for aspirants by ItOfficerHub
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
