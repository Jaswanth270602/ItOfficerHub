import { Button } from '@/components/ui/button'
import { CommunityWelcomeBody, CommunityWelcomeHero } from '@/components/community/CommunityWelcomeContent'
import { X } from 'lucide-react'

type Props = {
  userName?: string
  onDismiss: () => void
}

/** Full-width inline welcome card on dashboard (backup if modal is missed). */
export function CommunityWelcomeCard({ userName, onDismiss }: Props) {
  return (
    <section className="mb-8 sm:mb-10 overflow-hidden rounded-xl sm:rounded-2xl border-2 border-neon-cyan/35 bg-cyber-950 shadow-xl shadow-neon-cyan/10">
      <CommunityWelcomeHero userName={userName} />
      <div className="p-4 sm:p-6 md:p-8 space-y-5 relative">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 h-9 w-9 rounded-lg border border-cyber-600 bg-cyber-900/80 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          aria-label="Dismiss welcome card"
        >
          <X className="h-4 w-4" />
        </button>
        <CommunityWelcomeBody />
        <Button type="button" className="cursor-pointer w-full sm:w-auto min-h-[44px]" onClick={onDismiss}>
          Got it — let&apos;s prep
        </Button>
      </div>
    </section>
  )
}
