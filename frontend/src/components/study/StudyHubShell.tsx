import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import type { PracticeCatalog, PracticeSection } from '@/lib/practiceCatalog'
import { cn } from '@/lib/utils'
import { Seo } from '@/components/Seo'
import {
  BookOpen,
  ChevronRight,
  Cloud,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Globe,
  Menu,
  Microchip,
  Network,
  Shield,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Network,
  Database,
  Cpu,
  Shield,
  Globe,
  GitBranch,
  Microchip,
  Code2,
  Cloud,
}

function sectionIcon(id: string) {
  const key =
    id === 'networking'
      ? 'Network'
      : id === 'dbms'
        ? 'Database'
        : id === 'operating-systems'
          ? 'Cpu'
          : id === 'security'
            ? 'Shield'
            : id === 'web-technologies'
              ? 'Globe'
              : id === 'data-structures'
                ? 'GitBranch'
                : id === 'computer-organization'
                  ? 'Microchip'
                  : id === 'software-engineering'
                    ? 'Code2'
                    : 'Cloud'
  return ICON_MAP[key] ?? BookOpen
}

type StudyContextValue = {
  catalog: PracticeCatalog | null
  loading: boolean
  error: string
  refresh: () => void
  sectionById: (id: string) => PracticeSection | undefined
}

const StudyContext = createContext<StudyContextValue | null>(null)

export function useStudyCatalog() {
  const ctx = useContext(StudyContext)
  if (!ctx) throw new Error('useStudyCatalog must be used within StudyHubShell')
  return ctx
}

export function StudyHubShell() {
  const [catalog, setCatalog] = useState<PracticeCatalog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { sectionId } = useParams()

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api
      .get('/public/practice/catalog')
      .then((r) => setCatalog(r.data))
      .catch((e) => setError(apiErrorMessage(e, 'Could not load study catalog')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setMobileOpen(false)
  }, [sectionId])

  const sectionById = (id: string) => catalog?.sections.find((s) => s.id === id)

  return (
    <StudyContext.Provider value={{ catalog, loading, error, refresh: load, sectionById }}>
      <Seo
        path="/study"
        title="IBPS SO IT Officer Practice Questions — Topic-wise Q&A"
        description="Free topic-wise practice questions for IBPS SO IT Officer and PSU IT exams — Computer Networks, DBMS, OS, Security, Web, Data Structures. One MCQ per topic with solutions."
        keywords="IBPS SO IT practice questions, IT Officer MCQ topic wise, computer networks questions, DBMS MCQ bank IT officer"
      />

      <div className="min-h-[calc(100dvh-3.5rem)] lg:min-h-[calc(100dvh-4rem)] flex flex-col lg:flex-row bg-cyber-950">
        {/* Mobile bar */}
        <div className="lg:hidden flex items-center justify-between gap-2 px-3 py-2 border-b border-cyber-700 bg-cyber-900/90 sticky top-14 z-30">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer gap-2"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" /> Subjects
          </Button>
          <Link to="/study" className="text-sm font-semibold text-neon-cyan flex items-center gap-1">
            <BookOpen className="h-4 w-4" /> Study Q&A
          </Link>
          <Link to="/mocks" className="text-xs text-slate-400 hover:text-white">
            Full mocks →
          </Link>
        </div>

        {/* Sidebar */}
        <aside
          className={cn(
            'study-sidebar flex flex-col shrink-0 border-r border-cyber-700/80 bg-cyber-900/95',
            'fixed lg:sticky top-[calc(3.5rem+env(safe-area-inset-top))] lg:top-16 z-40 h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-4rem)] w-[min(100%,280px)]',
            'transition-transform duration-200 lg:translate-x-0',
            mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="p-4 border-b border-cyber-700 flex items-center justify-between">
            <Link to="/study" className="font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-neon-cyan" />
              <span className="text-sm">IT Officer Study</span>
            </Link>
            <button
              type="button"
              className="lg:hidden p-1 text-slate-400 cursor-pointer"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="px-4 py-2 text-[10px] uppercase tracking-widest text-slate-500">IBPS SO IT · Topic-wise</p>

          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" aria-label="Study subjects">
            {loading && <p className="px-3 py-4 text-sm text-slate-500">Loading...</p>}
            {error && (
              <p className="px-3 py-2 text-xs text-red-400">{error}</p>
            )}
            {catalog?.sections.map((sec) => {
              const Icon = sectionIcon(sec.id)
              const active = sectionId === sec.id
              return (
                <NavLink
                  key={sec.id}
                  to={`/study/${sec.id}`}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    active
                      ? 'bg-neon-blue/15 text-white border border-neon-blue/30'
                      : 'text-slate-300 hover:bg-cyber-800/80 border border-transparent'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-neon-cyan' : 'text-slate-500')} />
                  <span className="flex-1 min-w-0 truncate">{sec.title}</span>
                  <span className="text-[10px] tabular-nums text-slate-500 shrink-0">
                    {sec.availableCount}/{sec.subtopicCount}
                  </span>
                  <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
                </NavLink>
              )
            })}
          </nav>

          <div className="p-3 border-t border-cyber-700 space-y-2">
            {catalog && (
              <p className="text-[10px] text-slate-500 text-center">
                {catalog.availableQuestions} / {catalog.totalSubtopics} topics with questions
              </p>
            )}
            <Link to="/mocks">
              <Button variant="outline" size="sm" className="w-full cursor-pointer text-xs">
                Full timed mocks
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="w-full cursor-pointer text-xs">
                Daily mock
              </Button>
            </Link>
          </div>
        </aside>

        {mobileOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/60 lg:hidden cursor-pointer"
            aria-label="Close overlay"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 overflow-y-auto study-main-panel">
          <Outlet />
        </main>
      </div>
    </StudyContext.Provider>
  )
}
