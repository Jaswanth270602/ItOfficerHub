import { Link, useParams } from 'react-router-dom'
import { useStudyCatalog } from '@/components/study/StudyHubShell'
import { ChevronRight, Folder, FolderOpen, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

export function StudySectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>()
  const { sectionById, loading } = useStudyCatalog()
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
      <div className="max-w-3xl">
        <p className="text-red-400 text-sm">Subject not found.</p>
        <Link to="/study" className="text-neon-cyan text-sm mt-2 inline-block">
          ← All subjects
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <nav className="text-xs text-slate-500 mb-3 flex items-center gap-1">
        <Link to="/study" className="hover:text-neon-cyan">
          Study
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-300 truncate">{section?.title ?? '…'}</span>
      </nav>

      <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">{section?.title}</h1>
      {section?.description && (
        <p className="text-sm text-slate-400 mb-5 leading-relaxed">{section.description}</p>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="search"
          placeholder="Filter topics…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cyber-700 bg-cyber-900/60 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-cyan/40"
        />
      </div>

      {section && (
        <p className="text-xs text-slate-500 mb-3">
          {section.availableCount} / {section.subtopicCount} with practice questions
        </p>
      )}

      <ul className="rounded-xl border border-cyber-700/80 divide-y divide-cyber-800/80 overflow-hidden bg-cyber-900/20">
        {topics.map((st) => (
          <li key={st.slug}>
            {st.questionCount > 0 ? (
              <Link
                to={`/study/${sectionId}/${st.slug}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-cyber-800/40 transition-colors group"
              >
                <FolderOpen className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="flex-1 text-sm text-slate-200 group-hover:text-white">{st.title}</span>
                <span className="text-[10px] uppercase text-emerald-400/90 font-medium tabular-nums">
                  {st.questionCount} Q{st.questionCount !== 1 ? 's' : ''}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />
              </Link>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3.5 opacity-60">
                <Folder className="h-4 w-4 text-slate-600 shrink-0" />
                <span className="flex-1 text-sm text-slate-500">{st.title}</span>
                <span className="text-[10px] uppercase text-slate-600">Soon</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
