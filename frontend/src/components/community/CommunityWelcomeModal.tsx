import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CommunityWelcomeBody, CommunityWelcomeHero } from '@/components/community/CommunityWelcomeContent'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName?: string
}

export function CommunityWelcomeModal({ open, onOpenChange, userName }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] p-0 gap-0 overflow-hidden border-neon-cyan/40 bg-cyber-950 max-h-[min(92vh,900px)] overflow-y-auto">
        <DialogTitle className="sr-only">Welcome to ItOfficerHub</DialogTitle>
        <CommunityWelcomeHero userName={userName} />
        <div className="p-4 sm:p-6 md:p-8 space-y-5">
          <CommunityWelcomeBody />
          <div className="flex justify-end pt-1">
            <Button type="button" className="cursor-pointer w-full sm:w-auto min-h-[44px]" onClick={() => onOpenChange(false)}>
              Let&apos;s start prepping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
