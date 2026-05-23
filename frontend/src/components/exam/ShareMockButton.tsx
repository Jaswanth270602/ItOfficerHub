import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  copyMockLink,
  mockShareText,
  mockShareUrl,
  telegramShareUrl,
  whatsAppShareUrl,
} from '@/lib/shareMock'
import { Check, Copy, Link2, MessageCircle, Send, Share2 } from 'lucide-react'

type ShareMockButtonProps = {
  mockId: number
  mockTitle: string
  className?: string
  variant?: 'icon' | 'pill'
}

export function ShareMockButton({ mockId, mockTitle, className, variant = 'icon' }: ShareMockButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const url = mockShareUrl(mockId)
  const text = mockShareText(mockTitle, mockId)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(t)
  }, [copied])

  const onCopy = async () => {
    const ok = await copyMockLink(mockId)
    if (ok) {
      setCopied(true)
      setOpen(false)
    }
  }

  const onNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: mockTitle, text, url })
        setOpen(false)
        return
      } catch {
        /* cancelled */
      }
    }
    void onCopy()
  }

  return (
    <div ref={rootRef} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        title="Share this mock"
        aria-label="Share this mock"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'cursor-pointer inline-flex items-center justify-center transition-colors border',
          variant === 'icon'
            ? 'h-9 w-9 rounded-lg border-white/10 bg-slate-900/60 text-slate-300 hover:text-neon-cyan hover:border-neon-cyan/40 hover:bg-neon-cyan/10'
            : 'gap-1.5 h-9 px-3 rounded-full border-cyber-600 bg-cyber-900/80 text-xs text-slate-300 hover:border-neon-cyan/40 hover:text-neon-cyan'
        )}
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
        {variant === 'pill' && <span className="hidden sm:inline">Share mock</span>}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-[120] w-52 rounded-xl border border-cyber-600 bg-cyber-950 shadow-xl shadow-black/40 py-1.5"
          role="menu"
        >
          <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-500 border-b border-cyber-800 mb-1">
            Invite friends
          </p>
          <button
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-200 hover:bg-cyber-800 cursor-pointer text-left"
            onClick={() => void onCopy()}
          >
            <Copy className="h-4 w-4 text-neon-cyan shrink-0" />
            Copy link
          </button>
          <a
            href={whatsAppShareUrl(text)}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-200 hover:bg-cyber-800"
            onClick={() => setOpen(false)}
          >
            <MessageCircle className="h-4 w-4 text-green-400 shrink-0" />
            WhatsApp
          </a>
          <a
            href={telegramShareUrl(url, text)}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-200 hover:bg-cyber-800"
            onClick={() => setOpen(false)}
          >
            <Send className="h-4 w-4 text-sky-400 shrink-0" />
            Telegram
          </a>
          {typeof navigator.share === 'function' && (
            <button
              type="button"
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-200 hover:bg-cyber-800 cursor-pointer text-left border-t border-cyber-800 mt-1"
              onClick={() => void onNativeShare()}
            >
              <Link2 className="h-4 w-4 text-violet-400 shrink-0" />
              More apps…
            </button>
          )}
        </div>
      )}
    </div>
  )
}
