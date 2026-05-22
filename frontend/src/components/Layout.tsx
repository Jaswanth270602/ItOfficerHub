import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Button } from './ui/button'
import { ClipboardList, Cpu, LogOut, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm px-3 py-1.5 rounded-lg transition-colors',
    isActive ? 'bg-cyber-800 text-white' : 'text-slate-400 hover:text-white hover:bg-cyber-800/60'
  )

export function Layout() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-cyber-700/50 bg-cyber-900/70 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon-blue/15 border border-neon-blue/30">
              <Cpu className="h-5 w-5 text-neon-cyan" />
            </span>
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent hidden sm:inline">
              ItOfficerHub
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/dashboard" className={navLinkClass}>
              Mocks
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/community" className={navLinkClass}>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4 hidden sm:inline" /> Prep Mail
                  </span>
                </NavLink>
                <NavLink to="/history" className={navLinkClass}>
                  <span className="flex items-center gap-1">
                    <ClipboardList className="h-4 w-4 hidden sm:inline" /> My attempts
                  </span>
                </NavLink>
                <span className="text-xs text-slate-500 hidden md:inline truncate max-w-[100px]" title={user?.name}>
                  {user?.name}
                </span>
                <Button variant="ghost" size="sm" className="cursor-pointer ml-1" onClick={logout} aria-label="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="cursor-pointer">Sign up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-cyber-700/40 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} ItOfficerHub</span>
          <span>Free IBPS SO IT Officer mock tests · +1 / −0.25 · 15 min</span>
        </div>
      </footer>
    </div>
  )
}
