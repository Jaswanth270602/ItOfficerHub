import { Link } from 'react-router-dom'
import { useStudyCatalog } from '@/components/study/StudyHubShell'
import { Button } from '@/components/ui/button'
import { ChevronRight, FolderOpen, Layers, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

export function StudyHubHomePage() {
  const { catalog, loading, error } = useStudyCatalog()
  const [filter, setFilter] = useState('')

  const sections = useMemo(() => {
    if (!catalog) return []
    const q = filter.trim().toLowerCase()
    if (!q) return catalog.sections
    return catalog.sections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.subtopics.some((t) => t.title.toLowerCase().includes(q))
    )
  }, [catalog, filter])

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Topic-wise practice</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          IBPS SO IT &amp; PSU IT syllabus — one MCQ per topic with solution. Pick a subject to browse topics.
        </p>
      </header>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="search"
          placeholder="Search subject or topic…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cyber-700 bg-cyber-900/60 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-cyan/40"
        />
      </div>

      {loading && <p className="text-slate-500 text-sm py-8 text-center">Loading syllabus…</p>}
      {error && <p className="text-red-400 text-sm py-4">{error}</p>}

      <ul className="rounded-xl border border-cyber-700/80 divide-y divide-cyber-800/80 overflow-hidden bg-cyber-900/20">
        {sections.map((sec) => (
          <li key={sec.id}>
            <Link
              to={`/study/${sec.id}`}
              className="flex items-center gap-3 px-4 py-4 hover:bg-cyber-800/40 transition-colors group"
            >
              <FolderOpen className="h-5 w-5 text-amber-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-100 group-hover:text-neon-cyan transition-colors">
                  {sec.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sec.availableCount} of {sec.subtopicCount} topics ready · {sec.topicLabel}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-neon-cyan shrink-0" />
            </Link>
          </li>
        ))}
      </ul>

      {!loading && sections.length === 0 && !error && (
        <p className="text-center text-slate-500 py-12 text-sm">No subjects match your search.</p>
      )}

      <div className="mt-8 rounded-xl border border-neon-purple/25 bg-violet-950/15 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Layers className="h-8 w-8 text-neon-purple shrink-0" />
          <div>
            <p className="font-medium text-white text-sm">Ready for timed mocks?</p>
            <p className="text-xs text-slate-500">25 Q · 50 marks · daily mock at midnight IST</p>
          </div>
        </div>
        <Link to="/mocks">
          <Button size="sm" className="cursor-pointer shrink-0 w-full sm:w-auto">
            Browse mocks
          </Button>
        </Link>
      </div>
    </div>
  )
}
