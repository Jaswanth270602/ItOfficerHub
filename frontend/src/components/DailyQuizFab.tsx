import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { isDailyQuizDoneToday } from '@/lib/dailyQuiz'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Floating Daily 10 CTA — keeps the viral loop visible after scrolling. */
export function DailyQuizFab() {
  const { pathname } = useLocation()
  const [done, setDone] = useState(() => isDailyQuizDoneToday())

  useEffect(() => {
    const refresh = () => setDone(isDailyQuizDoneToday())
    refresh()
    window.addEventListener('ioh-daily10-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('ioh-daily10-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [pathname])

  const hide =
    pathname.startsWith('/daily-quiz') ||
    pathname.startsWith('/mock/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/result/')

  if (hide || done) return null

  return (
    <Link
      to="/daily-quiz"
      className={cn(
        'fixed z-40 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] lg:bottom-6 right-3 sm:right-5',
        'inline-flex items-center gap-2 rounded-full border border-amber-400/40',
        'bg-gradient-to-r from-cyber-900 to-[#1a1030] px-3.5 py-2.5 text-sm font-semibold text-white',
        'shadow-[0_0_28px_rgba(251,191,36,0.25)] hover:brightness-110 transition-all',
        'hero-quiz-cta'
      )}
      aria-label="Start Daily 10 quiz"
    >
      <Flame className="h-4 w-4 text-amber-300" />
      Daily 10
    </Link>
  )
}
