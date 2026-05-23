import { CommunityAskSection } from '@/components/community/CommunityAskSection'
import { Sparkles, Zap } from 'lucide-react'

export function CommunityWelcomeHero({ userName }: { userName?: string }) {
  const firstName = userName?.trim().split(/\s+/)[0]

  return (
    <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden rounded-t-xl sm:rounded-t-2xl">
      <img src="/og-cover.svg" alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-cyber-950 via-cyber-950/75 to-cyber-950/20" />
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 flex items-end gap-4">
        <img
          src="/logo.png"
          alt="ItOfficerHub"
          className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl ring-2 ring-neon-cyan/50 object-cover shadow-xl shadow-neon-cyan/25"
          width={80}
          height={80}
        />
        <div className="min-w-0 pb-1">
          <p className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-neon-cyan mb-1.5">
            <Sparkles className="h-3.5 w-3.5" /> 100% free · forever
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
            {firstName ? `Welcome, ${firstName}!` : 'Welcome aboard!'}
          </h2>
        </div>
      </div>
    </div>
  )
}

export function CommunityWelcomeBody() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
        We are building more IT Officers for India — one free mock at a time.
      </p>
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
        ItOfficerHub is <strong className="text-white font-medium">completely free</strong> because we believe bank IT
        Officer prep should not depend on expensive coaching. No ads, no paywalls, no tricks — just daily mocks, detailed
        solutions, All-India rank, and study Q&amp;A built for serious aspirants.
      </p>
      <div className="flex items-start gap-3 rounded-xl border border-neon-purple/30 bg-neon-purple/10 px-4 py-4">
        <Zap className="h-5 w-5 text-neon-purple shrink-0 mt-0.5" />
        <p className="text-sm sm:text-base text-slate-200 italic leading-relaxed">
          &ldquo;India needs more engineers in public-sector IT roles — we want to be the launchpad that gets you
          there.&rdquo;
        </p>
      </div>
      <CommunityAskSection variant="welcome" />
    </div>
  )
}
