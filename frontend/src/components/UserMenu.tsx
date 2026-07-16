import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookMarked, ChevronDown, ClipboardList, Heart, LogOut, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

type Props = {
  name: string
  email?: string
  onLogout: () => void
  /** Compact trigger for tight headers (e.g. mobile) */
  compact?: boolean
  className?: string
}

const MENU_LINKS = [
  { to: '/community', label: 'Prep Mail', icon: Mail },
  { to: '/revision', label: 'Revision', icon: BookMarked },
  { to: '/history', label: 'My attempts', icon: ClipboardList },
  { to: '/support', label: 'Support hub', icon: Heart },
] as const

export function UserMenu({ name, email, onLogout, compact = false, className }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative shrink-0', className)}>
      <button
        type="button"
        className={cn(
          'flex items-center gap-2 rounded-full border border-cyber-700/80 bg-cyber-900/80',
          'hover:border-neon-cyan/40 hover:bg-cyber-800/80 transition-colors cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue',
          compact ? 'pl-0.5 pr-1.5 py-0.5' : 'pl-0.5 pr-2.5 py-0.5'
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className={cn(
            'flex items-center justify-center rounded-full font-semibold text-neon-cyan',
            'bg-gradient-to-br from-neon-cyan/20 to-neon-blue/25 ring-1 ring-neon-cyan/30',
            compact ? 'h-8 w-8 text-xs' : 'h-8 w-8 text-xs'
          )}
          aria-hidden
        >
          {initials(name)}
        </span>
        {!compact && (
          <span className="hidden sm:block text-sm text-slate-200 max-w-[7.5rem] truncate font-medium">
            {name}
          </span>
        )}
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-slate-500 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className={cn(
            'absolute right-0 mt-2 w-56 z-50 overflow-hidden',
            'rounded-xl border border-cyber-700 bg-cyber-950/95 backdrop-blur-md shadow-xl shadow-black/40'
          )}
        >
          <div className="px-3 py-3 border-b border-cyber-800">
            <p className="text-sm font-medium text-white truncate">{name}</p>
            {email && <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>}
          </div>

          <div className="py-1.5">
            {MENU_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                role="menuitem"
                className={
                  to === '/support'
                    ? 'flex items-center gap-2.5 px-3 py-2.5 text-sm text-rose-200/90 hover:bg-rose-950/40 hover:text-rose-100 transition-colors'
                    : 'flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 hover:bg-cyber-800 hover:text-white transition-colors'
                }
                onClick={() => setOpen(false)}
              >
                <Icon className={to === '/support' ? 'h-4 w-4 text-rose-400' : 'h-4 w-4 text-slate-500'} />
                {label}
              </Link>
            ))}
          </div>

          <div className="border-t border-cyber-800 p-1.5">
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm text-red-300 hover:bg-red-950/50 hover:text-red-200 transition-colors cursor-pointer"
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
