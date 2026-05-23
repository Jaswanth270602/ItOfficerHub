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
      <DialogContent className="max-w-3xl w-[calc(100%-1.5rem)] p-0 gap-0 overflow-hidden border-amber-500/25 bg-cyber-950 max-h-[min(90vh,820px)] overflow-y-auto">
        <DialogTitle className="sr-only">Thank you for using ItOfficerHub</DialogTitle>

        <div className="relative px-5 sm:px-8 pt-8 pb-6 text-center border-b border-cyber-800 bg-gradient-to-b from-amber-950/30 via-cyber-950 to-cyber-950">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 mb-4">
            <Heart className="h-8 w-8 text-amber-400" />
          </div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-400/90 mb-2">
            <Sparkles className="h-3.5 w-3.5" /> See you soon
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Thank you for being here</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Hope you visit again soon. You trusted us as an{' '}
            <strong className="text-white font-medium">early user</strong> — that means everything while we grow this
            platform for IBPS SO IT &amp; PSU IT aspirants.
          </p>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-5">
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed text-center sm:text-left">
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
