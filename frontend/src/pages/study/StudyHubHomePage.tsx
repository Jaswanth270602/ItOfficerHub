import { Link } from 'react-router-dom'
import { useStudyCatalog } from '@/components/study/StudyHubShell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FolderOpen, Layers, Search } from 'lucide-react'
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
    <div className="study-panel-inner">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Welcome to ItOfficerHub Study
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
          Topic-wise practice for <strong className="text-slate-200">IBPS SO IT Officer</strong> and{' '}
          <strong className="text-slate-200">PSU IT</strong> professional knowledge — one quality MCQ per
          subtopic, with detailed solutions. Pick a subject from the sidebar or below.
        </p>
      </header>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="search"
          placeholder="Filter subjects or topics..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cyber-600 bg-cyber-900/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-cyan/50"
        />
      </div>

      {loading && <p className="text-slate-500">Loading syllabus...</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {catalog && (
        <p className="text-xs text-slate-500 mb-4">
          {catalog.availableQuestions} questions live · {catalog.totalSubtopics} topic slots · more added daily
        </p>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((sec) => (
          <Card
            key={sec.id}
            className="border-cyber-700/80 bg-white/[0.03] hover:border-neon-cyan/40 transition-colors group"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white group-hover:text-neon-cyan transition-colors">
                {sec.title}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-2">{sec.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{sec.availableCount} / {sec.subtopicCount} topics ready</span>
                <span className="font-mono text-neon-cyan/80">{sec.topicLabel}</span>
              </div>
              <ul className="space-y-1 max-h-32 overflow-y-auto text-sm">
                {sec.subtopics.slice(0, 5).map((st) => (
                  <li key={st.slug}>
                    <Link
                      to={st.hasQuestion ? `/study/${sec.id}/${st.slug}` : `/study/${sec.id}`}
                      className={cn(
                        'flex items-center gap-2 py-1 hover:text-neon-cyan',
                        st.hasQuestion ? 'text-slate-300' : 'text-slate-600'
                      )}
                    >
                      <FolderOpen
                        className={cn('h-3.5 w-3.5 shrink-0', st.hasQuestion ? 'text-amber-400' : 'text-slate-600')}
                      />
                      <span className="truncate">{st.title}</span>
                    </Link>
                  </li>
                ))}
                {sec.subtopics.length > 5 && (
                  <li className="text-xs text-slate-500 pl-5">+{sec.subtopics.length - 5} more</li>
                )}
              </ul>
              <Link to={`/study/${sec.id}`}>
                <Button variant="outline" size="sm" className="w-full cursor-pointer text-xs">
                  View all topics
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-10 border-neon-purple/30 bg-violet-950/20">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-neon-purple" /> Ready for full-length mocks?
            </p>
            <p className="text-sm text-slate-400 mt-1">15 min · 20 Q · All-India rank · daily mock at midnight IST</p>
          </div>
          <Link to="/mocks">
            <Button className="cursor-pointer shrink-0">Browse IBPS IT mocks</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
