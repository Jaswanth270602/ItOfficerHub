import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  BookMarked,
  BookOpen,
  Building2,
  ClipboardList,
  GraduationCap,
  Home,
  Layers,
  LogOut,
  Mail,
  Menu,
  User,
} from 'lucide-react'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-colors',
    isActive ? 'bg-neon-blue/20 text-white' : 'text-slate-300 hover:bg-cyber-800'
  )

export function MobileHeaderMenu() {
  const [open, setOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()

  const close = () => setOpen(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="lg:hidden cursor-pointer shrink-0 h-9 w-9 p-0"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="mobile-dialog-sheet flex flex-col gap-0 p-0">
          <DialogHeader className="p-4 border-b border-cyber-700 shrink-0">
            <DialogTitle className="text-left">Menu</DialogTitle>
            {user?.name && <p className="text-sm text-slate-400 text-left">{user.name}</p>}
          </DialogHeader>
          <nav className="flex-1 overflow-y-auto p-3 space-y-1" onClick={close}>
            <NavLink to="/dashboard" className={linkClass}>
              <Home className="h-5 w-5" /> Dashboard
            </NavLink>
            <NavLink to="/study" className={linkClass}>
              <BookOpen className="h-5 w-5" /> Study Q&A
            </NavLink>
            <NavLink to="/mocks" className={linkClass}>
              <Layers className="h-5 w-5" /> Mocks
            </NavLink>
            <NavLink to="/tcs-nqt" className={linkClass}>
              <Building2 className="h-5 w-5" /> TCS NQT
            </NavLink>
            <NavLink to="/syllabus" className={linkClass}>
              <GraduationCap className="h-5 w-5" /> Syllabus
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/community" className={linkClass}>
                  <Mail className="h-5 w-5" /> Prep Mail
                </NavLink>
                <NavLink to="/revision" className={linkClass}>
                  <BookMarked className="h-5 w-5" /> Revision
                </NavLink>
                <NavLink to="/history" className={linkClass}>
                  <ClipboardList className="h-5 w-5" /> My attempts
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  <User className="h-5 w-5" /> Login
                </NavLink>
                <NavLink to="/register" className={linkClass}>
                  <User className="h-5 w-5" /> Sign up free
                </NavLink>
              </>
            )}
          </nav>
          {isAuthenticated && (
            <div className="p-4 border-t border-cyber-700 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button variant="outline" className="w-full cursor-pointer gap-2" onClick={() => { logout(); close() }}>
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suppress duplicate active state flash when menu closed */}
      <span className="sr-only" aria-live="polite">
        {location.pathname}
      </span>
    </>
  )
}

const bottomTabClass = (active: boolean) =>
  cn(
    'flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 text-[10px] font-medium transition-colors',
    active ? 'text-neon-cyan' : 'text-slate-500'
  )

export function MobileBottomNav() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) return null

  const path = location.pathname
  const tabs = [
    { to: '/dashboard', label: 'Home', icon: Home, match: path === '/dashboard' || path === '/' },
    { to: '/study', label: 'Study', icon: BookOpen, match: path.startsWith('/study') },
    { to: '/mocks', label: 'Mocks', icon: Layers, match: path.startsWith('/mocks') || path.startsWith('/mock/') },
    { to: '/community', label: 'Mail', icon: Mail, match: path.startsWith('/community') },
    { to: '/revision', label: 'Revision', icon: BookMarked, match: path.startsWith('/revision') },
  ]

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-cyber-700/80 bg-cyber-950/95 backdrop-blur-lg"
      aria-label="Quick navigation"
    >
      <div className="flex max-w-lg mx-auto pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ to, label, icon: Icon, match }) => (
          <Link key={to} to={to} className={bottomTabClass(match)}>
            <Icon className={cn('h-5 w-5', match && 'text-neon-cyan')} />
            <span className="truncate max-w-full px-1">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
