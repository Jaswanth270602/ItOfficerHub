import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  OFFICIAL_TELEGRAM_LABEL,
  OFFICIAL_TELEGRAM_URL,
  OFFICIAL_YOUTUBE_LABEL,
  OFFICIAL_YOUTUBE_URL,
} from '@/lib/officialChannels'
import { Megaphone, Send, Youtube } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  compact?: boolean
}

export function OfficialChannelsCard({ className, compact = false }: Props) {
  return (
    <Card className={cn('border-neon-cyan/25 bg-gradient-to-br from-cyber-900/80 to-cyber-950', className)}>
      <CardHeader className={compact ? 'pb-2' : undefined}>
        <CardTitle className={cn('flex items-center gap-2', compact ? 'text-base' : 'text-lg')}>
          <Megaphone className="h-5 w-5 text-neon-cyan" /> Stay connected
        </CardTitle>
        <CardDescription>
          Official updates — new mocks, study drops, and prep tips on YouTube &amp; Telegram.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-3">
        <a href={OFFICIAL_YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full cursor-pointer gap-2 h-auto py-3 justify-start">
            <Youtube className="h-5 w-5 text-red-400 shrink-0" />
            <span className="text-left">
              <span className="block font-medium">YouTube channel</span>
              <span className="block text-xs text-slate-400 font-normal">{OFFICIAL_YOUTUBE_LABEL}</span>
            </span>
          </Button>
        </a>
        <a href={OFFICIAL_TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full cursor-pointer gap-2 h-auto py-3 justify-start">
            <Send className="h-5 w-5 text-sky-400 shrink-0" />
            <span className="text-left">
              <span className="block font-medium">Telegram channel</span>
              <span className="block text-xs text-slate-400 font-normal">{OFFICIAL_TELEGRAM_LABEL}</span>
            </span>
          </Button>
        </a>
      </CardContent>
    </Card>
  )
}
