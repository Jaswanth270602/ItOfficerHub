import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  copySiteLink,
  siteShareText,
  siteShareUrl,
  telegramShareUrl,
  whatsAppShareUrl,
} from '@/lib/shareSite'
import { Check, Copy, Heart, MessageCircle, Send, Share2, Users } from 'lucide-react'

type Props = {
  variant?: 'welcome' | 'goodbye'
}

const ASK_ITEMS = [
  {
    icon: Users,
    title: 'Refer your friends',
    desc: 'Share ItOfficerHub with classmates, office colleagues & fellow IBPS / PSU IT aspirants.',
  },
  {
    icon: MessageCircle,
    title: 'Telegram & WhatsApp groups',
    desc: 'Drop our link in your prep groups — a one-line backlink helps more engineers find free mocks.',
  },
  {
    icon: Share2,
    title: 'Reddit & forums',
    desc: 'Mention us where IT Officer aspirants hang out — honest word-of-mouth beats any ad.',
  },
]

export function CommunityAskSection({ variant = 'welcome' }: Props) {
  const [copied, setCopied] = useState(false)
  const url = siteShareUrl()
  const text = siteShareText()

  const onCopy = async () => {
    const ok = await copySiteLink()
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="rounded-xl border border-neon-cyan/25 bg-gradient-to-br from-cyber-900/80 to-cyber-950/90 p-4 sm:p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center shrink-0">
          <Heart className="h-5 w-5 text-neon-cyan" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white">What we want from you</h3>
          <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">
            {variant === 'goodbye'
              ? 'You trusted us as an early user — help us grow the community so we can keep improving mocks, study Q&A & rank features.'
              : 'That is literally all we ask — no payment, no spam. Just help more engineers discover free prep.'}
          </p>
        </div>
      </div>

      <ul className="space-y-3 mb-5">
        {ASK_ITEMS.map(({ icon: Icon, title, desc }) => (
          <li key={title} className="flex gap-3 text-sm">
            <Icon className="h-4 w-4 text-neon-purple shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-200">{title}</p>
              <p className="text-slate-500 leading-relaxed">{desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" className="cursor-pointer gap-1.5" onClick={() => void onCopy()}>
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy link'}
        </Button>
        <a href={whatsAppShareUrl(text)} target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="outline" size="sm" className="cursor-pointer gap-1.5">
            <MessageCircle className="h-4 w-4 text-green-400" /> WhatsApp
          </Button>
        </a>
        <a href={telegramShareUrl(url, text)} target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="outline" size="sm" className="cursor-pointer gap-1.5">
            <Send className="h-4 w-4 text-sky-400" /> Telegram
          </Button>
        </a>
      </div>
    </div>
  )
}
