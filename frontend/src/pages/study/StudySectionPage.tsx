import { Link, useParams } from 'react-router-dom'
import { useStudyCatalog } from '@/components/study/StudyHubShell'
import { ChevronRight, Folder, FolderOpen, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

export function StudySectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>()
  const { catalog, sectionById, loading } = useStudyCatalog()
  const [filter, setFilter] = useState('')

  const section = sectionId ? sectionById(sectionId) : undefined

  const topics = useMemo(() => {
    if (!section) return []
    const q = filter.trim().toLowerCase()
    if (!q) return section.subtopics
    return section.subtopics.filter((t) => t.title.toLowerCase().includes(q))
  }, [section, filter])

  if (!loading && !section) {
    return (
      <div className="study-panel-inner">
        <p className="text-red-400">Subject not found.</p>
        <Link to="/study" className="text-neon-cyan text-sm mt-2 inline-block">
          ← Back to study home
        </Link>
      </div>
    )
  }

  return (
    <div className="study-panel-inner">
      <nav className="text-xs text-slate-500 mb-4 flex flex-wrap items-center gap-1">
        <Link to="/study" className="hover:text-neon-cyan">
          Study
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-300">{section?.title ?? '...'}</span>
      </nav>

      <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">{section?.title}</h1>
      <p className="text-sm text-slate-400 mb-6 max-w-2xl">{section?.description}</p>

      <div className="relative mb-6 max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="search"
          placeholder="Filter topics in this section..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cyber-600 bg-cyber-900/60 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-cyan/50"
        />
      </div>

      {section && (
        <p className="text-xs text-slate-500 mb-3">
          {section.availableCount} of {section.subtopicCount} topics have a practice question
        </p>
      )}

      <ul className="study-topic-list rounded-xl border border-cyber-700/80 bg-cyber-900/30 divide-y divide-cyber-800/80 overflow-hidden">
        {topics.map((st) => (
          <li key={st.slug}>
            {st.hasQuestion ? (
              <Link
                to={`/study/${sectionId}/${st.slug}`}
                className="flex items-center gap-3 px-4 py-3.5 sm:py-4 hover:bg-cyber-800/50 transition-colors group"
              >
                <FolderOpen className="h-5 w-5 text-amber-400 shrink-0" />
                <span className="flex-1 text-sm sm:text-base text-slate-200 group-hover:text-white">
                  {st.title}
                </span>
                <span className="text-xs text-emerald-400/90 shrink-0">Practice</span>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-neon-cyan shrink-0" />
              </Link>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3.5 sm:py-4 opacity-70">
                <Folder className="h-5 w-5 text-slate-600 shrink-0" />
                <span className="flex-1 text-sm sm:text-base text-slate-500">{st.title}</span>
                <span className="text-[10px] uppercase tracking-wide text-slate-600 shrink-0">Soon</span>
              </div>
            )}
          </li>
        ))}
      </ul>

      {catalog && section && section.availableCount === 0 && (
        <p className="mt-6 text-sm text-slate-500 text-center py-8">
          Questions for this section are being added. Try{' '}
          <Link to="/mocks" className="text-neon-cyan hover:underline">
            full mocks
          </Link>{' '}
          meanwhile.
        </p>
      )}
    </div>
  )
}
