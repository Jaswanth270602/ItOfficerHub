import { Link } from 'react-router-dom'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CommunityAskSection } from '@/components/community/CommunityAskSection'
import { Heart, Sparkles } from 'lucide-react'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogoutThankYouModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] p-0 gap-0 overflow-hidden border-amber-500/30 bg-cyber-950 max-h-[min(90vh,820px)] overflow-y-auto [&>button]:z-30 [&>button]:top-3 [&>button]:right-3 [&>button]:rounded-lg [&>button]:bg-cyber-950/90 [&>button]:border [&>button]:border-cyber-700 [&>button]:p-2">
        <DialogTitle className="sr-only">Thank you for using ItOfficerHub</DialogTitle>

        {/* Hero header — CSS only (og-cover.svg was 404 on some hosts due to SPA catch-all) */}
        <div className="relative h-36 sm:h-44 w-full overflow-hidden shrink-0 bg-gradient-to-br from-amber-950/50 via-cyber-950 to-cyber-900">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, rgba(251,191,36,0.25) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(34,211,238,0.15) 0%, transparent 40%)',
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cyber-950 via-cyber-950/80 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 sm:pb-6 px-6 sm:px-10 pt-12 text-center">
            <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-cyber-950/80 border border-amber-500/40 shadow-lg shadow-amber-500/10 mb-3">
              <Heart className="h-7 w-7 sm:h-8 sm:w-8 text-amber-400" />
            </div>
            <p className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-1.5">
              <Sparkles className="h-3.5 w-3.5" /> See you soon
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
              Thank you for being here
            </h2>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-8 pt-5 pb-6 sm:pb-8 space-y-5">
          <p className="text-sm sm:text-base text-slate-400 text-center max-w-xl mx-auto leading-relaxed">
            Hope you visit again soon. You trusted us as an{' '}
            <strong className="text-white font-medium">early user</strong> — that means everything while we grow for
            IBPS SO IT &amp; PSU IT aspirants.
          </p>

          <p className="text-sm text-slate-300 leading-relaxed text-center sm:text-left border-t border-cyber-800 pt-4">
            When you share ItOfficerHub or leave a helpful backlink, you help us reach more engineers — so we can add
            more daily mocks, better analytics, and stronger community features for everyone.
          </p>

          <CommunityAskSection variant="goodbye" />

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-1">
            <Link to="/" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
              <Button variant="outline" type="button" className="cursor-pointer w-full sm:w-auto min-h-[44px]">
                Back to home
              </Button>
            </Link>
            <Button
              type="button"
              className="cursor-pointer w-full sm:w-auto min-h-[44px]"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
