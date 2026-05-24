import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import {
  PRACTICE_INITIAL_TARGET_PER_SUBTOPIC,
  practiceImportBatchSize,
  practiceSubtopicDisplayTarget,
  type PracticeCatalog,
  type PracticeSection,
} from '@/lib/practiceCatalog'
import { ImportPracticeModal } from '@/pages/admin/ImportPracticeModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, FileJson, Search } from 'lucide-react'

type ImportTarget = {
  sectionId: string
  sectionTitle: string
  subtopicSlug: string
  subtopicTitle: string
  questionCount: number
}

export function AdminPracticePage() {
  const [catalog, setCatalog] = useState<PracticeCatalog | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState('')
  const [importTarget, setImportTarget] = useState<ImportTarget | null>(null)

  const load = () => {
    api.get('/admin/practice/catalog').then((r) => setCatalog(r.data))
  }

  useEffect(() => {
    load()
  }, [])

  const sections = useMemo(() => {
    if (!catalog) return []
    const q = filter.trim().toLowerCase()
    if (!q) return catalog.sections
    return catalog.sections
      .map((sec) => ({
        ...sec,
        subtopics: sec.subtopics.filter(
          (st) => st.title.toLowerCase().includes(q) || sec.title.toLowerCase().includes(q)
        ),
      }))
      .filter((sec) => sec.subtopics.length > 0 || sec.title.toLowerCase().includes(q))
  }, [catalog, filter])

  const toggleSection = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalMcqs = catalog?.availableQuestions ?? 0
  const targetTotal = (catalog?.totalSubtopics ?? 0) * PRACTICE_INITIAL_TARGET_PER_SUBTOPIC

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-10 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-neon-cyan mb-3">
            <ArrowLeft className="h-4 w-4" /> Admin dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-neon-cyan" /> Practice Q&amp;A
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
            Browse syllabus → pick a subtopic → import up to {PRACTICE_INITIAL_TARGET_PER_SUBTOPIC} MCQs via Claude. New batches append after existing questions.
          </p>
        </div>
      </div>

      {catalog && (
        <Card className="mb-6 border-neon-cyan/25 bg-gradient-to-r from-cyber-950 to-cyber-900/60">
          <CardContent className="pt-5 flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-2xl font-bold text-neon-cyan tabular-nums">{totalMcqs}</p>
              <p className="text-slate-500 text-xs">MCQs live</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{catalog.filledSubtopics}/{catalog.totalSubtopics}</p>
              <p className="text-slate-500 text-xs">Subtopics started</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{targetTotal > 0 ? Math.round((totalMcqs / targetTotal) * 100) : 0}%</p>
              <p className="text-slate-500 text-xs">Toward {PRACTICE_INITIAL_TARGET_PER_SUBTOPIC}/subtopic goal</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="search"
          placeholder="Search subject or subtopic…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cyber-700 bg-cyber-900/60 text-sm text-white focus:outline-none focus:border-neon-cyan/40"
        />
      </div>

      <div className="space-y-3">
        {sections.map((sec) => (
          <SectionBlock
            key={sec.id}
            section={sec}
            open={expanded.has(sec.id)}
            onToggle={() => toggleSection(sec.id)}
            onImport={setImportTarget}
          />
        ))}
      </div>

      <ImportPracticeModal
        open={!!importTarget}
        onOpenChange={(o) => !o && setImportTarget(null)}
        onSuccess={load}
        sectionId={importTarget?.sectionId}
        subtopicSlug={importTarget?.subtopicSlug}
        sectionTitle={importTarget?.sectionTitle}
        subtopicTitle={importTarget?.subtopicTitle}
        existingCount={importTarget?.questionCount ?? 0}
      />
    </div>
  )
}

function SectionBlock({
  section,
  open,
  onToggle,
  onImport,
}: {
  section: PracticeSection
  open: boolean
  onToggle: () => void
  onImport: (t: ImportTarget) => void
}) {
  const mcqCount = section.subtopics.reduce((s, st) => s + st.questionCount, 0)

  return (
    <Card className="border-cyber-700 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-cyber-800/40 transition-colors cursor-pointer text-left"
      >
        {open ? <ChevronDown className="h-5 w-5 text-neon-cyan shrink-0" /> : <ChevronRight className="h-5 w-5 text-slate-500 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">{section.title}</p>
          <p className="text-xs text-slate-500">{section.subtopicCount} subtopics · {mcqCount} MCQs</p>
        </div>
      </button>
      {open && (
        <CardContent className="pt-0 pb-3 px-2 sm:px-3">
          <ul className="divide-y divide-cyber-800/80 rounded-lg border border-cyber-800 overflow-hidden">
            {section.subtopics.map((st) => {
              const target = practiceSubtopicDisplayTarget(st.questionCount)
              const pct =
                st.questionCount === 0
                  ? 0
                  : Math.min(100, Math.round((st.questionCount / PRACTICE_INITIAL_TARGET_PER_SUBTOPIC) * 100))
              const metGoal = st.questionCount >= PRACTICE_INITIAL_TARGET_PER_SUBTOPIC
              return (
                <li key={st.slug} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-3 py-3 bg-cyber-950/40">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{st.title}</p>
                    <div className="mt-1.5 h-1.5 rounded-full bg-cyber-800 overflow-hidden max-w-xs">
                      <div
                        className={cn('h-full rounded-full transition-all', metGoal ? 'bg-emerald-500' : 'bg-neon-cyan')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {st.questionCount} / {target} questions
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={st.questionCount > 0 ? 'outline' : 'default'}
                    className="cursor-pointer gap-1.5 shrink-0 w-full sm:w-auto"
                    disabled={st.questionCount >= PRACTICE_INITIAL_TARGET_PER_SUBTOPIC}
                    onClick={() =>
                      onImport({
                        sectionId: section.id,
                        sectionTitle: section.title,
                        subtopicSlug: st.slug,
                        subtopicTitle: st.title,
                        questionCount: st.questionCount,
                      })
                    }
                  >
                    <FileJson className="h-4 w-4" />
                    {st.questionCount >= PRACTICE_INITIAL_TARGET_PER_SUBTOPIC
                      ? 'Full'
                      : st.questionCount > 0
                        ? `Import more (${practiceImportBatchSize(st.questionCount)})`
                        : `Import ${PRACTICE_INITIAL_TARGET_PER_SUBTOPIC}`}
                  </Button>
                </li>
              )
            })}
          </ul>
        </CardContent>
      )}
    </Card>
  )
}
