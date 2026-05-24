import type { ComponentType, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '@/components/Seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  IBPS_OFFICIAL_URL,
  HIGHLIGHTS,
  PRELIMS_PATTERN,
  MAINS_PATTERN,
  IMPORTANT_DATES_2026,
  VACANCY_SUMMARY_LAST_CYCLE,
  ELIGIBILITY_EDUCATION,
  ELIGIBILITY_AGE,
  PK_SYLLABUS_TOPICS,
  PRELIMS_CUTOFF_2025,
  MAINS_CUTOFF_2025,
  MAINS_PK_SECTIONAL_2025,
  FINAL_CUTOFF_2025,
  TOC,
} from '@/lib/ibpsSoItOfficerData'
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileText,
  Layers,
  Landmark,
  Scale,
  Wallet,
} from 'lucide-react'

function DataTable({
  headers,
  rows,
  className,
}: {
  headers: readonly string[]
  rows: readonly (readonly string[])[]
  className?: string
}) {
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-cyber-700/80', className)}>
      <table className="w-full text-sm text-left min-w-[520px]">
        <thead>
          <tr className="bg-cyber-800/80 text-slate-300">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2.5 font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={cn(
                'border-t border-cyber-800/80',
                i === rows.length - 1 && row[0] === 'Total' ? 'bg-neon-blue/5 font-medium text-white' : 'text-slate-400'
              )}
            >
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Section({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string
  title: string
  icon: ComponentType<{ className?: string }>
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyber-800 text-neon-cyan">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

export function IbpsSoItOfficerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: 'IBPS SO IT Officer Exam Pattern, Syllabus & Cut-offs',
        description:
          'Complete guide to IBPS Specialist Officer IT stream — prelims, mains professional knowledge, interview, eligibility, salary and previous cut-offs.',
        url: 'https://itofficerhub.in/ibps-so-it-officer',
        author: { '@type': 'Organization', name: 'ItOfficerHub' },
        publisher: { '@type': 'Organization', name: 'ItOfficerHub', url: 'https://itofficerhub.in' },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How many stages are in the IBPS SO IT Officer exam?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Three stages: Preliminary exam (English, Reasoning, Quant), Main exam (Professional Knowledge — 60 MCQs), and Interview. Final merit uses 80% mains and 20% interview.',
            },
          },
          {
            '@type': 'Question',
            name: 'What is the IBPS SO IT Officer mains exam pattern?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'One objective paper — Professional Knowledge with 60 questions, 60 marks, 45 minutes, bilingual (English and Hindi). Wrong answers carry a 0.25 negative mark.',
            },
          },
          {
            '@type': 'Question',
            name: 'What qualification is required for IBPS SO IT Officer?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A 4-year engineering degree in CS/IT/Electronics (or related), or relevant postgraduate degree, or DOEACC/NIELIT B-level — from a recognised university as per IBPS notification.',
            },
          },
        ],
      },
    ],
  }

  return (
    <>
      <Seo
        path="/ibps-so-it-officer"
        title="IBPS SO IT Officer Exam Pattern, Syllabus & Cut-off 2026"
        description="IBPS SO IT Officer (Scale I) exam pattern — prelims 125 marks, mains 60 MCQs professional knowledge, interview 80:20. Eligibility, salary, 2025 cut-offs & free mock tests on ItOfficerHub."
        keywords="IBPS SO IT Officer, IBPS SO IT exam pattern, IBPS IT Officer syllabus, IBPS SO IT cut off, IBPS Specialist Officer IT, IT Officer Scale 1, IBPS SO 2026, professional knowledge IT officer"
        jsonLd={jsonLd}
      />

      <div className="page-container py-8 sm:py-10 pb-20">
        {/* Hero */}
        <header className="mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-neon-cyan mb-2">
            Official pattern · Updated for 2026 cycle
          </p>
          <h1 className="page-title max-w-3xl leading-tight">
            IBPS SO IT Officer — exam pattern &amp; preparation guide
          </h1>
          <p className="page-subtitle max-w-2xl mt-3 text-base leading-relaxed">
            Everything you need about the <strong className="text-slate-200">Information Technology</strong> stream under
            IBPS Specialist Officer recruitment — stages, marks, syllabus, eligibility, and recent cut-offs. Cross-check
            dates on{' '}
            <a
              href={IBPS_OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-cyan hover:underline inline-flex items-center gap-0.5"
            >
              ibps.in <ExternalLink className="h-3 w-3" />
            </a>{' '}
            when the notification drops.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/mocks">
              <Button className="cursor-pointer gap-2">
                <Layers className="h-4 w-4" /> Practice mocks
              </Button>
            </Link>
            <Link to="/study">
              <Button variant="outline" className="cursor-pointer gap-2">
                <BookOpen className="h-4 w-4" /> Study Q&amp;A
              </Button>
            </Link>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-10">
          {/* TOC — desktop sticky */}
          <nav
            className="hidden lg:block sticky top-20 self-start"
            aria-label="On this page"
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">On this page</p>
            <ul className="space-y-1 text-sm border-l border-cyber-700 pl-3">
              {TOC.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-slate-400 hover:text-neon-cyan py-0.5 block">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 space-y-12">
            {/* Mobile TOC */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {TOC.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs border border-cyber-700 text-slate-400 hover:border-neon-cyan/50 hover:text-neon-cyan"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <Section id="overview" title="At a glance" icon={Landmark}>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {HIGHLIGHTS.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-lg border border-cyber-700/60 bg-cyber-900/40 px-4 py-3"
                  >
                    <p className="text-xs text-slate-500 mb-0.5">{row.label}</p>
                    <p className="text-sm text-slate-200 leading-snug">{row.value}</p>
                  </div>
                ))}
              </div>
              <Card className="border-amber-500/25 bg-amber-950/10">
                <CardContent className="pt-4 flex gap-3 text-sm text-slate-300">
                  <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    IBPS conducts Specialist Officer recruitment for several streams (Law, HR, Marketing, Agriculture,
                    Rajbhasha, IT, etc.). This page covers <strong className="text-white">only the IT Officer (Scale I)</strong>{' '}
                    post. Other streams have different mains papers and cut-offs.
                  </p>
                </CardContent>
              </Card>
            </Section>

            <Section id="dates" title="Important dates (2026 cycle)" icon={Calendar}>
              <p className="text-sm text-slate-400 mb-4">
                Per the IBPS exam calendar, CRP SPL-XVI prelims and mains are tentatively scheduled as below. Registration
                windows will be announced with the official notification.
              </p>
              <div className="space-y-2">
                {IMPORTANT_DATES_2026.map((row) => (
                  <div
                    key={row.event}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-lg border border-cyber-700/50 px-4 py-3 bg-cyber-900/30"
                  >
                    <span className="text-sm text-slate-300">{row.event}</span>
                    <span className="text-sm font-medium text-neon-cyan tabular-nums">{row.date}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="pattern" title="Exam pattern" icon={FileText}>
              <p className="text-sm text-slate-400 mb-6">
                Selection has three stages. You must clear sectional and overall cut-offs in prelims to reach mains, then
                mains cut-off for interview. Interview qualifying marks are typically <strong className="text-slate-200">40%</strong>{' '}
                for general and <strong className="text-slate-200">35%</strong> for reserved categories (on 100 marks).
              </p>

              <h3 className="text-base font-medium text-white mb-3">Stage 1 — Preliminary</h3>
              <p className="text-sm text-slate-500 mb-3">
                Three objective tests, online. Sectional timing applies — you cannot switch sections early. Total{' '}
                <strong className="text-slate-300">125 marks</strong> from 150 questions.
              </p>
              <DataTable headers={PRELIMS_PATTERN.headers} rows={PRELIMS_PATTERN.rows} className="mb-8" />

              <h3 className="text-base font-medium text-white mb-3">Stage 2 — Main (Professional Knowledge)</h3>
              <p className="text-sm text-slate-500 mb-3">
                Only IT core topics — networking, DBMS, OS, security, software engineering, etc. This is where most
                aspirants using ItOfficerHub focus their prep.
              </p>
              <DataTable headers={MAINS_PATTERN.headers} rows={MAINS_PATTERN.rows} className="mb-8" />

              <h3 className="text-base font-medium text-white mb-3">Stage 3 — Interview</h3>
              <Card className="border-cyber-700">
                <CardContent className="pt-4 text-sm text-slate-400 space-y-2">
                  <p>
                    Conducted by participating public sector banks. Maximum marks <strong className="text-white">100</strong>.
                  </p>
                  <p>
                    <strong className="text-slate-200">Final merit</strong> = normalized mains score (weight 80) + interview
                    score (weight 20). Provisional allotment follows category-wise merit and vacancies.
                  </p>
                </CardContent>
              </Card>
            </Section>

            <Section id="syllabus" title="Professional knowledge syllabus" icon={BookOpen}>
              <p className="text-sm text-slate-400 mb-4">
                IBPS lists a broad IT syllabus in the notification. Mains questions are MCQ-style on fundamentals below.
                For topic-wise practice with solutions, use our{' '}
                <Link to="/study" className="text-neon-cyan hover:underline">
                  Study Q&amp;A
                </Link>{' '}
                or the{' '}
                <Link to="/syllabus" className="text-neon-cyan hover:underline">
                  subject-wise syllabus
                </Link>{' '}
                page aligned to modern IT Officer papers.
              </p>
              <ul className="grid sm:grid-cols-2 gap-2">
                {PK_SYLLABUS_TOPICS.map((topic) => (
                  <li
                    key={topic}
                    className="flex gap-2 text-sm text-slate-400 rounded-lg border border-cyber-800 px-3 py-2.5 bg-cyber-900/20"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500/80 shrink-0 mt-0.5" />
                    {topic}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="eligibility" title="Eligibility" icon={Scale}>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-cyber-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Education</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-slate-400 space-y-2 list-none">
                      {ELIGIBILITY_EDUCATION.map((line) => (
                        <li key={line} className="flex gap-2">
                          <span className="text-neon-cyan">·</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-slate-500 mt-4">
                      Degree must be from a university recognised by the Government of India. Exact wording is in the
                      official notification.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-cyber-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Age</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-400 space-y-3">
                    <p>
                      Usually <strong className="text-white">{ELIGIBILITY_AGE.min}–{ELIGIBILITY_AGE.max} years</strong>{' '}
                      (born between dates specified in the notification).
                    </p>
                    <p className="text-xs text-slate-500">Upper age relaxation (indicative):</p>
                    <ul className="space-y-1">
                      {ELIGIBILITY_AGE.relaxations.map((r) => (
                        <li key={r.category} className="flex justify-between gap-4 border-b border-cyber-800/80 py-1.5">
                          <span>{r.category}</span>
                          <span className="text-slate-300">{r.years}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </Section>

            <Section id="vacancies" title="Vacancies" icon={Landmark}>
              <p className="text-sm text-slate-400 mb-4">
                Vacancy numbers are released bank-wise in the IBPS SO notification. Last recruitment cycle had{' '}
                <strong className="text-slate-200">170 indicative posts</strong> for IT Officer across participating banks
                (e.g. significant intake in Punjab National Bank). Treat 2026 numbers as unknown until the PDF is live.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg">
                {VACANCY_SUMMARY_LAST_CYCLE.map((v) => (
                  <div
                    key={v.category}
                    className={cn(
                      'rounded-lg border px-3 py-3 text-center',
                      v.category.includes('Total')
                        ? 'border-neon-cyan/40 bg-neon-cyan/5 col-span-2 sm:col-span-3'
                        : 'border-cyber-700/60 bg-cyber-900/30'
                    )}
                  >
                    <p className="text-2xl font-bold text-white tabular-nums">{v.count}</p>
                    <p className="text-xs text-slate-500 mt-1">{v.category}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="salary" title="Salary & job profile" icon={Wallet}>
              <Card className="border-cyber-700 mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Pay scale (Scale I — indicative)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-400 space-y-3">
                  <p>
                    Basic pay scale (CRP SPL pattern):{' '}
                    <span className="font-mono text-xs sm:text-sm text-slate-300 block mt-1">
                      ₹48,480 – (7 years × ₹2,000) – ₹62,480 – (2 × ₹2,340) – ₹67,160 – (7 × ₹2,680) – ₹85,920
                    </span>
                  </p>
                  <p>
                    Entry basic around <strong className="text-white">₹48,480/month</strong> plus DA, HRA, transport and
                    bank-specific allowances. Gross at joining is often cited near <strong className="text-white">₹62,000+</strong>{' '}
                    depending on posting.
                  </p>
                </CardContent>
              </Card>
              <p className="text-sm text-slate-500">
                IT Officers handle core banking technology — application support, network/security, ATM/internet/mobile
                banking issues, hardware/software troubleshooting, and documentation. Role varies by allotted bank.
              </p>
            </Section>

            <Section id="cutoffs" title="Previous cut-offs (IT Officer)" icon={FileText}>
              <p className="text-sm text-slate-400 mb-6">
                Cut-offs change every year with paper difficulty and vacancies. Figures below are from{' '}
                <strong className="text-slate-200">IBPS SO 2025</strong> official scorecards — use them for rough targets,
                not guarantees.
              </p>

              <h3 className="text-sm font-medium text-white mb-2">Prelims — overall (out of 125)</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {PRELIMS_CUTOFF_2025.overall.map((c) => (
                  <span
                    key={c.cat}
                    className="inline-flex flex-col items-center rounded-lg border border-cyber-700 bg-cyber-900/50 px-4 py-2 min-w-[4.5rem]"
                  >
                    <span className="text-xs text-slate-500">{c.cat}</span>
                    <span className="text-lg font-semibold text-white tabular-nums">{c.score}</span>
                  </span>
                ))}
              </div>

              <h3 className="text-sm font-medium text-white mb-2">Prelims — sectional minimums</h3>
              <DataTable
                headers={['Section', 'SC/ST/OBC/PwBD', 'EWS / General']}
                rows={PRELIMS_CUTOFF_2025.sectional.map((r) => [r.test, r.reserved, r.general])}
                className="mb-8"
              />

              <h3 className="text-sm font-medium text-white mb-2">Mains — overall (out of 60)</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {MAINS_CUTOFF_2025.map((c) => (
                  <span
                    key={c.cat}
                    className="inline-flex flex-col items-center rounded-lg border border-cyber-700 bg-cyber-900/50 px-4 py-2 min-w-[4.5rem]"
                  >
                    <span className="text-xs text-slate-500">{c.cat}</span>
                    <span className="text-lg font-semibold text-white tabular-nums">{c.score}</span>
                  </span>
                ))}
              </div>

              <p className="text-sm text-slate-500 mb-2">
                Mains — Professional Knowledge sectional (max {MAINS_PK_SECTIONAL_2025.maxMarks} marks)
              </p>
              <p className="text-sm text-slate-400 mb-8">
                Reserved: <strong className="text-white">{MAINS_PK_SECTIONAL_2025.reserved}</strong> · General/EWS:{' '}
                <strong className="text-white">{MAINS_PK_SECTIONAL_2025.general}</strong>
              </p>

              <h3 className="text-sm font-medium text-white mb-2">Final allotment (mains + interview, out of 100)</h3>
              <div className="flex flex-wrap gap-2">
                {FINAL_CUTOFF_2025.map((c) => (
                  <span
                    key={c.cat}
                    className="inline-flex flex-col items-center rounded-lg border border-neon-blue/30 bg-neon-blue/5 px-4 py-2 min-w-[4.5rem]"
                  >
                    <span className="text-xs text-slate-500">{c.cat}</span>
                    <span className="text-lg font-semibold text-white tabular-nums">{c.score}</span>
                  </span>
                ))}
              </div>
            </Section>

            <Section id="prepare" title="Prepare on ItOfficerHub" icon={Layers}>
              <Card className="border-neon-cyan/30 bg-gradient-to-br from-cyber-900 to-cyber-950">
                <CardContent className="pt-6 sm:flex sm:items-center sm:justify-between gap-6">
                  <div>
                    <p className="text-white font-medium mb-2">Free mocks & topic-wise Q&amp;A</p>
                    <p className="text-sm text-slate-400 max-w-lg">
                      Run timed IT professional knowledge mocks, check All-India rank, and drill CN, DBMS, OS &amp; security
                      on Study Q&amp;A — no payment, built for IBPS SO IT aspirants.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4 sm:mt-0 shrink-0">
                    <Link to="/mocks">
                      <Button className="cursor-pointer w-full sm:w-auto gap-2">
                        Start mock <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/study">
                      <Button variant="outline" className="cursor-pointer w-full sm:w-auto">
                        Browse Study Q&amp;A
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </Section>

            <p className="text-xs text-slate-600 border-t border-cyber-800 pt-6">
              Disclaimer: Exam pattern, dates and cut-offs are summarised for aspirants. Always refer to the official IBPS
              notification and scorecards at{' '}
              <a href={IBPS_OFFICIAL_URL} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-neon-cyan underline">
                ibps.in
              </a>
              . ItOfficerHub is not affiliated with IBPS.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
