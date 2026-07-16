import { Seo } from '@/components/Seo'
import { Database, Heart, IndianRupee, Server, Sparkles, Users } from 'lucide-react'

const COST_POINTS = [
  {
    icon: Server,
    title: 'Servers & uptime',
    text: 'Hosting, SSL, and keeping mocks online when thousands attempt at once.',
  },
  {
    icon: Database,
    title: 'Database & storage',
    text: 'Attempts, ranks, Study Q&A, and backups grow every day we stay free.',
  },
  {
    icon: Sparkles,
    title: 'Build & scale',
    text: 'New pattern mocks, features, and fixes so the hub stays exam-ready for 2026.',
  },
] as const

export function SupportPage() {
  return (
    <>
      <Seo
        path="/support"
        title="Support ItOfficerHub — Keep IBPS SO IT Mocks Free"
        description="ItOfficerHub is 100% free. Optional donations via PhonePe help cover server and database costs. Every rupee goes only to maintenance and development."
        keywords="ItOfficerHub donation, support free IBPS SO IT mocks, PhonePe donate, free IT officer mock test"
        noindex
      />

      <section className="relative min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)] flex flex-col overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-950 via-[#0a1628] to-cyber-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(34,211,238,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(244,63,94,0.08),transparent_50%)]" />

        <div className="relative flex-1 page-container flex flex-col justify-center py-8 sm:py-10 max-w-3xl mx-auto w-full">
          <div className="text-center mb-6 sm:mb-8">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-300/90 mb-3">
              <Heart className="h-3.5 w-3.5 fill-rose-400/40 text-rose-400" />
              Optional support
            </p>
            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-3">
              Always free. Never paywalled.
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Every mock, Study Q&A, rank, and solution on ItOfficerHub is{' '}
              <strong className="text-white">absolutely free</strong> — you never need to pay a single rupee to prepare.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-7 sm:mb-8">
            {COST_POINTS.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-xl border border-cyber-700/70 bg-cyber-900/40 px-3.5 py-3 text-left sm:text-center"
              >
                <Icon className="h-5 w-5 text-neon-cyan mb-2 sm:mx-auto" />
                <p className="text-sm font-medium text-white mb-0.5">{title}</p>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-snug">{text}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-cyber-600/80 bg-cyber-950/70 backdrop-blur-sm shadow-[0_0_60px_-24px_rgba(34,211,238,0.4)] px-4 sm:px-8 py-6 sm:py-8 text-center">
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-5 max-w-lg mx-auto">
              We accept <strong className="text-white">voluntary donations</strong> only to keep production running and
              take this hub to the next level. Every rupee collected goes{' '}
              <strong className="text-neon-cyan">only</strong> to maintenance and development — nothing else.
            </p>

            <p className="text-base sm:text-xl font-bold text-white mb-5 leading-snug">
              Even a <span className="text-emerald-300">₹10</span> donation is highly appreciated.
            </p>

            <div className="inline-flex flex-col items-center">
              <div className="rounded-2xl border border-white/10 bg-black p-3 sm:p-4 shadow-lg shadow-black/50">
                <img
                  src="/phonepe-donation-qr.png"
                  alt="PhonePe QR code to donate to ItOfficerHub"
                  width={280}
                  height={280}
                  className="w-[min(72vw,280px)] h-auto rounded-lg"
                  decoding="async"
                />
              </div>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs sm:text-sm text-slate-400">
                <IndianRupee className="h-3.5 w-3.5 text-violet-300" />
                Scan with PhonePe · UPI
              </p>
            </div>

            <p className="mt-6 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
              <Users className="h-4 w-4 text-slate-400 shrink-0" />
              <span>
                This website belongs to all of us — aspirants. Questions are crafted by senior developers with IT
                Officer exam experience. Free forever for the community.
              </span>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
