import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { MobileBottomNav, MobileHeaderMenu } from '@/components/MobileNav'
import { LogoutThankYouModal } from '@/components/community/LogoutThankYouModal'
import { CommunityWelcomeModal } from '@/components/community/CommunityWelcomeModal'
import { UserMenu } from '@/components/UserMenu'
import { Button } from './ui/button'
import { AppLogo } from '@/components/AppLogo'
import {
  BookOpen,
  GraduationCap,
  Layers,
  ShieldCheck,
  Timer,
  Trophy,
  Users,
} from 'lucide-react'
import {
  OFFICIAL_TELEGRAM_URL,
  OFFICIAL_YOUTUBE_URL,
} from '@/lib/officialChannels'
import { cn } from '@/lib/utils'
import { RouteNoIndexSeo } from '@/components/RouteNoIndexSeo'
import { VisitTracker } from '@/components/VisitTracker'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap',
    isActive ? 'bg-cyber-800 text-white' : 'text-slate-400 hover:text-white hover:bg-cyber-800/60'
  )

export function Layout() {
  const { user, logout, isAuthenticated, welcomeOpen, goodbyeOpen, dismissWelcome, dismissGoodbye } = useAuth()
  const location = useLocation()
  const onDashboard = location.pathname === '/dashboard'

  return (
    <div className="min-h-screen flex flex-col min-h-[100dvh]">
      <RouteNoIndexSeo />
      <VisitTracker />
      <LogoutThankYouModal
        open={goodbyeOpen}
        onOpenChange={(open) => {
          if (!open) dismissGoodbye()
        }}
      />
      {onDashboard && isAuthenticated && (
        <CommunityWelcomeModal
          open={welcomeOpen}
          onOpenChange={(open) => {
            if (!open) dismissWelcome()
          }}
          userName={user?.name}
        />
      )}

      <header className="border-b border-cyber-700/50 bg-cyber-900/70 backdrop-blur-lg sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          <AppLogo textClassName="text-base sm:text-lg" />

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 min-w-0 overflow-x-auto">
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/study" className={navLinkClass}>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Study Q&A
              </span>
            </NavLink>
            <NavLink to="/mocks" className={navLinkClass}>
              <span className="flex items-center gap-1">
                <Layers className="h-4 w-4" /> Mocks
              </span>
            </NavLink>
            <NavLink to="/ibps-so-2026" className={navLinkClass}>
              <span className="flex items-center gap-1">
                <Timer className="h-4 w-4" /> IBPS 2026
              </span>
            </NavLink>
            <NavLink to="/ibps-so-it-officer" className={navLinkClass}>
              <span className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" /> Syllabus
              </span>
            </NavLink>
            {isAuthenticated && user ? (
              <UserMenu name={user.name} email={user.email} onLogout={logout} className="ml-1" />
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="cursor-pointer">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </nav>

          <div className="flex lg:hidden items-center gap-2 shrink-0">
            {isAuthenticated && user ? (
              <UserMenu name={user.name} email={user.email} onLogout={logout} compact />
            ) : (
              <Link to="/login">
                <Button size="sm" className="cursor-pointer text-xs h-8 px-2">
                  Login
                </Button>
              </Link>
            )}
            <MobileHeaderMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 main-with-mobile-nav">
        <Outlet />
      </main>

      <MobileBottomNav />

      <footer className="border-t border-cyber-700/40 py-8 sm:py-10 mt-auto bg-cyber-950/50 pb-[max(2rem,calc(1rem+env(safe-area-inset-bottom)))] lg:pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 text-center sm:text-left">
            <div className="flex flex-col items-center sm:items-start gap-2 p-4 rounded-lg border border-cyber-700/50 bg-cyber-900/30">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <p className="text-sm font-medium text-white">100% free</p>
              <p className="text-xs text-slate-500 leading-relaxed">No payments, no ads, no API keys required</p>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-2 p-4 rounded-lg border border-cyber-700/50 bg-cyber-900/30">
              <Trophy className="h-6 w-6 text-amber-400" />
              <p className="text-sm font-medium text-white">Fair rankings</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Daily board = today&apos;s mock · Aggregate = total best scores
              </p>
            </div>
            <div className="flex flex-col items-center sm:items-start gap-2 p-4 rounded-lg border border-cyber-700/50 bg-cyber-900/30">
              <Users className="h-6 w-6 text-neon-cyan" />
              <p className="text-sm font-medium text-white">Built for aspirants</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                IBPS SO IT 2026 &amp; PSU IT — by IT officers, for IT officers
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-x-6 text-sm mb-6" aria-label="Footer navigation">
            <Link to="/dashboard" className="text-slate-400 hover:text-white py-1">
              Dashboard
            </Link>
            <Link to="/study" className="text-slate-400 hover:text-white py-1">
              Study Q&A
            </Link>
            <Link to="/mocks" className="text-slate-400 hover:text-white py-1">
              IBPS SO IT Mocks
            </Link>
            <Link to="/ibps-so-2026" className="text-slate-400 hover:text-white py-1">
              IBPS SO 2026
            </Link>
            <Link to="/ibps-so-it-officer" className="text-slate-400 hover:text-white py-1">
              Syllabus &amp; pattern
            </Link>
            <Link to="/register" className="text-slate-400 hover:text-white py-1">
              Sign up free
            </Link>
            <a href={OFFICIAL_YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white py-1">
              YouTube
            </a>
            <a href={OFFICIAL_TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white py-1">
              Telegram
            </a>
          </nav>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 text-xs sm:text-sm text-slate-500 text-center">
            <span>© {new Date().getFullYear()} ItOfficerHub — IT Officer Hub</span>
            <span>IBPS SO IT 2026 mocks · P +2 · N 0.5 · 25 Q</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
