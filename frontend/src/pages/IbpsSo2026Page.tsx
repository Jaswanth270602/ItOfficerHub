import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '@/components/Seo'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Layers, Timer } from 'lucide-react'
import { PRELIMS_PATTERN } from '@/lib/ibpsSoItOfficerData'
import { cn } from '@/lib/utils'

/** IBPS SO Prelims 2026 — 29 August 2026, 00:00 Asia/Kolkata */
const PRELIMS_TARGET_MS = Date.parse('2026-08-29T00:00:00+05:30')

type Countdown = { days: number; hours: number; minutes: number; seconds: number; done: boolean }

function getCountdown(now = Date.now()): Countdown {
  const diff = Math.max(0, PRELIMS_TARGET_MS - now)
  if (diff === 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1000)
  return { days, hours, minutes, seconds, done: false }
}

function usePrelimsCountdown() {
  const [cd, setCd] = useState(() => getCountdown())
  useEffect(() => {
    const id = window.setInterval(() => setCd(getCountdown()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return cd
}

function CountdownCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[4.25rem] sm:min-w-[5.5rem]">
      <span className="tabular-nums font-bold text-3xl sm:text-5xl md:text-6xl text-white tracking-tight">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-500 mt-1.5">{label}</span>
    </div>
  )
}

export function IbpsSo2026Page() {
  const cd = usePrelimsCountdown()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'IBPS SO IT Officer 2026 — Prelims Countdown & New Exam Pattern',
        description:
          'IBPS SO IT Officer Prelims on 29 August 2026. Paper pattern changed for CRP SPL-XVI. Practice free mocks on ItOfficerHub aligned to the latest 2026 pattern — 25 PK questions, 50 marks.',
        url: 'https://itofficerhub.in/ibps-so-2026',
        inLanguage: 'en-IN',
      },
      {
        '@type': 'Event',
        name: 'IBPS SO IT Officer Prelims 2026',
        startDate: '2026-08-29',
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'VirtualLocation',
          url: 'https://www.ibps.in/',
        },
        description: 'IBPS CRP SPL-XVI Specialist Officer Preliminary Examination for IT Officer Scale I.',
        organizer: {
          '@type': 'Organization',
          name: 'Institute of Banking Personnel Selection',
          url: 'https://www.ibps.in/',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'When is IBPS SO IT Officer Prelims 2026?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The IBPS SO Prelims exam under CRP SPL-XVI is scheduled on 29 August 2026.',
            },
          },
          {
            '@type': 'Question',
            name: 'Has the IBPS SO IT Officer paper pattern changed in 2026?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Prelims now includes Professional Knowledge (25 questions, 50 marks) along with English, Reasoning and Quant. Mains is a multi-section paper; only Professional Knowledge counts for mains merit. ItOfficerHub mocks follow this latest 2026 pattern.',
            },
          },
        ],
      },
    ],
  }

  return (
    <>
      <Seo
        path="/ibps-so-2026"
        title="IBPS SO IT Officer 2026 Prelims Countdown — New Exam Pattern & Free Mocks"
        description="IBPS SO IT Officer Prelims on 29 August 2026. Paper pattern changed (CRP SPL-XVI). Free mocks on ItOfficerHub — 25 PK questions, 50 marks, latest 2026 pattern. Start prep now."
        keywords="IBPS SO 2026, IBPS SO IT Officer 2026, IBPS SO Prelims 2026, IBPS SO exam date 2026, IBPS SO new paper pattern 2026, CRP SPL-XVI, IBPS SO IT mock test 2026, Professional Knowledge IT Officer, IBPS SO countdown"
        jsonLd={jsonLd}
      />

      {/* Full-viewport hero card */}
      <section className="relative min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)] flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-950 via-cyber-900 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(34,211,238,0.18),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_90%,rgba(59,130,246,0.12),transparent_45%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative flex-1 page-container flex flex-col justify-center py-10 sm:py-14">
          <div className="mx-auto w-full max-w-4xl rounded-2xl border border-cyber-600/70 bg-cyber-950/55 backdrop-blur-md shadow-[0_0_80px_-20px_rgba(34,211,238,0.35)] px-5 sm:px-10 py-8 sm:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neon-cyan mb-4 flex items-center gap-2">
              <Timer className="h-3.5 w-3.5" />
              IBPS SO IT · CRP SPL-XVI · 2026
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.15] mb-3">
              Prelims countdown —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-sky-400">
                29 August 2026
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed mb-8">
              The IBPS SO IT Officer paper pattern has changed for 2026. Every mock on ItOfficerHub follows the{' '}
              <strong className="text-slate-200">latest pattern</strong> — so you prepare the way the exam actually is.
            </p>

            {cd.done ? (
              <p className="text-lg sm:text-xl font-semibold text-neon-cyan mb-8">Prelims day is here — give it your best.</p>
            ) : (
              <div
                className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 mb-8 py-5 px-4 rounded-xl border border-cyber-700/80 bg-black/30"
                aria-live="polite"
                aria-label="Countdown to IBPS SO Prelims 2026"
              >
                <CountdownCell value={cd.days} label="Days" />
                <span className="text-2xl sm:text-4xl text-slate-600 self-center pb-5" aria-hidden>
                  :
                </span>
                <CountdownCell value={cd.hours} label="Hours" />
                <span className="text-2xl sm:text-4xl text-slate-600 self-center pb-5" aria-hidden>
                  :
                </span>
                <CountdownCell value={cd.minutes} label="Mins" />
                <span className="text-2xl sm:text-4xl text-slate-600 self-center pb-5" aria-hidden>
                  :
                </span>
                <CountdownCell value={cd.seconds} label="Secs" />
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link to="/mocks">
                <Button size="lg" className="cursor-pointer gap-2">
                  <Layers className="h-4 w-4" /> Practice 2026 mocks
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/ibps-so-it-officer">
                <Button size="lg" variant="outline" className="cursor-pointer">
                  Full syllabus &amp; pattern
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pattern change + hub pitch */}
      <section className="page-container py-14 sm:py-20 space-y-12">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90 mb-2">Pattern update 2026</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Paper pattern changed — old prep is not enough
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Under CRP SPL-XVI, Professional Knowledge is tested in <strong className="text-slate-200">Prelims</strong>{' '}
            (25 Q · 50 marks) and again in <strong className="text-slate-200">Mains</strong> (50 Q · 100 marks, merit-making).
            Speed + depth in IT subjects decide your selection.
          </p>
        </div>

        <div className="rounded-2xl border border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/10 via-cyber-900/80 to-cyber-950 p-6 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            One clear path: ItOfficerHub
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
            Free IBPS SO IT Officer 2026 mocks built for the new pattern — timed sections, All-India rank, detailed
            solutions. No paywall. No outdated 60-mark-only PK format.
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 mb-8">
            {[
              'Mocks = latest 2026 pattern (25 Q · 50 marks PK style)',
              'P +2 / N −0.5 marking · 20 min focus blocks',
              '301 IT Officer vacancies this cycle — competition is real',
              'Topic-wise Study Q&A + daily mocks at midnight IST',
            ].map((line) => (
              <li key={line} className="flex gap-2 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                {line}
              </li>
            ))}
          </ul>
          <Link to="/register">
            <Button className="cursor-pointer gap-2">
              Start free for IBPS SO 2026 <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Prelims pattern 2026 (IT Officer)</h3>
          <div className="overflow-x-auto rounded-lg border border-cyber-700/80">
            <table className="w-full text-sm text-left min-w-[420px]">
              <thead>
                <tr className="bg-cyber-800/80 text-slate-300">
                  {PRELIMS_PATTERN.headers.map((h) => (
                    <th key={h} className="px-3 py-2.5 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRELIMS_PATTERN.rows.map((row, i) => (
                  <tr
                    key={row[0]}
                    className={cn(
                      'border-t border-cyber-800/80',
                      i === PRELIMS_PATTERN.rows.length - 1
                        ? 'bg-neon-blue/5 font-medium text-white'
                        : 'text-slate-400'
                    )}
                  >
                    {row.map((cell) => (
                      <td key={cell} className="px-3 py-2.5">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Mains on <strong className="text-slate-400">1 November 2026</strong>. Full tables on the{' '}
            <Link to="/ibps-so-it-officer" className="text-neon-cyan hover:underline">
              syllabus page
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  )
}
