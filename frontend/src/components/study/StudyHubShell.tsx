import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import type { PracticeCatalog, PracticeSection } from '@/lib/practiceCatalog'
import { AppLogo } from '@/components/AppLogo'
import { cn } from '@/lib/utils'
import { StudyShellSeo } from '@/components/study/StudyShellSeo'
import { Button } from '@/components/ui/button'
import { BookOpen, ChevronRight, Menu, X } from 'lucide-react'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    setSidebarOpen(false)
  }, [sectionId])

  const sectionById = (id: string) => catalog?.sections.find((s) => s.id === id)

  return (
    <StudyContext.Provider value={{ catalog, loading, error, refresh: load, sectionById }}>
      <StudyShellSeo />

      <div className="min-h-[calc(100dvh-3.5rem)] lg:min-h-[calc(100dvh-4rem)] bg-cyber-950">
        {/* Top bar — all screens */}
        <div className="sticky top-14 lg:top-16 z-30 border-b border-cyber-700/80 bg-cyber-900/95 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="lg:hidden shrink-0 cursor-pointer h-9 px-2"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open subjects"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <Link to="/study" className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-neon-cyan shrink-0" />
                Study Q&amp;A
              </Link>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-xs">
              {catalog && (
                <span className="hidden sm:inline text-slate-500 tabular-nums">
                  {catalog.availableQuestions} MCQs · {catalog.filledSubtopics}/{catalog.totalSubtopics} topics
                </span>
              )}
              <Link to="/mocks" className="text-neon-cyan hover:underline whitespace-nowrap">
                Full mocks
              </Link>
            </div>
          </div>

          {/* Mobile subject chips — horizontal scroll */}
          <div className="lg:hidden overflow-x-auto border-t border-cyber-800/80 px-2 py-2">
            <div className="flex gap-1.5 min-w-max">
              <NavLink
                to="/study"
                end
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap',
                    isActive && !sectionId
                      ? 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/40'
                      : 'border-cyber-700 text-slate-400'
                  )
                }
              >
                All subjects
              </NavLink>
              {catalog?.sections.map((sec) => (
                <NavLink
                  key={sec.id}
                  to={`/study/${sec.id}`}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap',
                      isActive
                        ? 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/40'
                        : 'border-cyber-700 text-slate-400'
                    )
                  }
                >
                  {sec.title.replace(/ &.*/, '')}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex">
          {/* Desktop sidebar */}
          <aside className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0 border-r border-cyber-800 min-h-[calc(100dvh-8rem)]">
            <div className="p-3 border-b border-cyber-800">
              <AppLogo showText={false} to="/" iconClassName="h-8 w-8" />
            </div>
            <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" aria-label="Study subjects">
              <NavLink
                to="/study"
                end
                className={({ isActive }) =>
                  cn(
                    'block px-3 py-2 rounded-lg text-sm',
                    isActive && !sectionId ? 'bg-neon-blue/15 text-white' : 'text-slate-400 hover:bg-cyber-800/60'
                  )
                }
              >
                Overview
              </NavLink>
              {loading && <p className="px-3 py-2 text-xs text-slate-500">Loading…</p>}
              {error && <p className="px-3 py-2 text-xs text-red-400">{error}</p>}
              {catalog?.sections.map((sec) => (
                <NavLink
                  key={sec.id}
                  to={`/study/${sec.id}`}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm',
                      isActive ? 'bg-neon-blue/15 text-white' : 'text-slate-400 hover:bg-cyber-800/60'
                    )
                  }
                >
                  <span className="truncate">{sec.title}</span>
                  <span className="text-[10px] tabular-nums shrink-0 text-slate-500">
                    {sec.availableCount}/{sec.subtopicCount}
                  </span>
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Mobile drawer sidebar */}
          {sidebarOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 bg-black/70 lg:hidden cursor-pointer"
                aria-label="Close"
                onClick={() => setSidebarOpen(false)}
              />
              <aside className="fixed left-0 top-0 bottom-0 z-50 w-[min(100%,280px)] bg-cyber-900 border-r border-cyber-700 flex flex-col lg:hidden">
                <div className="p-4 flex items-center justify-between border-b border-cyber-700">
                  <span className="font-semibold text-white">Subjects</span>
                  <button type="button" onClick={() => setSidebarOpen(false)} className="cursor-pointer p-1">
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
                  {catalog?.sections.map((sec) => (
                    <NavLink
                      key={sec.id}
                      to={`/study/${sec.id}`}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2 px-3 py-3 rounded-lg text-sm',
                          isActive ? 'bg-neon-blue/15 text-white' : 'text-slate-300'
                        )
                      }
                    >
                      <span className="flex-1">{sec.title}</span>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </NavLink>
                  ))}
                </nav>
              </aside>
            </>
          )}

          <main className="flex-1 min-w-0 px-3 sm:px-6 py-5 sm:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </StudyContext.Provider>
  )
}
