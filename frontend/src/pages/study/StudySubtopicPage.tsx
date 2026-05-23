import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import type { PracticeQuestionSummary } from '@/lib/practiceCatalog'
import { useStudyCatalog } from '@/components/study/StudyHubShell'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronRight, FileQuestion } from 'lucide-react'

export function StudySubtopicPage() {
  const { sectionId, subtopicSlug } = useParams<{ sectionId: string; subtopicSlug: string }>()
  const { sectionById } = useStudyCatalog()
  const [questions, setQuestions] = useState<PracticeQuestionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const section = sectionId ? sectionById(sectionId) : undefined
  const subtopic = section?.subtopics.find((s) => s.slug === subtopicSlug)

  useEffect(() => {
    if (!sectionId || !subtopicSlug) return
    setLoading(true)
    setError('')
    api
      .get(`/public/practice/sections/${sectionId}/topics/${subtopicSlug}/questions`)
      .then((r) => setQuestions(r.data))
      .catch((e) => setError(apiErrorMessage(e, 'No questions yet')))
      .finally(() => setLoading(false))
  }, [sectionId, subtopicSlug])

  return (
    <div className="max-w-3xl">
      <nav className="text-xs text-slate-500 mb-4 flex flex-wrap items-center gap-1">
        <Link to="/study" className="hover:text-neon-cyan">
          Study
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/study/${sectionId}`} className="hover:text-neon-cyan truncate max-w-[140px]">
          {section?.title}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-300 truncate">{subtopic?.title}</span>
      </nav>

      <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">{subtopic?.title ?? 'Practice'}</h1>
      <p className="text-sm text-slate-400 mb-6">
        {questions.length > 0
          ? `${questions.length} MCQ${questions.length === 1 ? '' : 's'} · pick a question to practice`
          : 'Questions coming soon for this topic.'}
      </p>

      {loading && <p className="text-slate-500 py-8 text-center">Loading…</p>}

      {error && !loading && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6 text-center">
          <p className="text-amber-200 mb-4">{error}</p>
          <Link to={`/study/${sectionId}`}>
            <Button variant="outline" className="cursor-pointer">
              Back to {section?.title}
            </Button>
          </Link>
        </div>
      )}

      {!loading && questions.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 gap-2 sm:gap-3">
          {questions.map((q) => (
            <Link
              key={q.id}
              to={`/study/${sectionId}/${subtopicSlug}/q/${q.questionNumber}`}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-cyber-700 bg-cyber-900/50',
                'hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-colors min-h-[72px] p-2'
              )}
            >
              <FileQuestion className="h-4 w-4 text-neon-cyan" />
              <span className="text-sm font-bold tabular-nums text-white">Q{q.questionNumber}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
