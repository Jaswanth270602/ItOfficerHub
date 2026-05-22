import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { MockExamCard } from '@/components/MockExamCard'
import { cn } from '@/lib/utils'
import {
  EXAM_TARGET_LABELS,
  MOCK_CATEGORY_LABELS,
  matchesCategoryFilter,
  matchesExamFilter,
  type ExamTargetFilter,
  type MockCategoryFilter,
} from '@/lib/catalog'
import {
  matchesTopicFilter,
  STATIC_TOPIC_FILTERS,
  type TopicCatalogItem,
  type TopicCode,
} from '@/lib/topics'
import { normalizeMock, type MockExam } from '@/types/mock'
import { Filter, Layers, RefreshCw, Search } from 'lucide-react'

export function MocksPage() {
  const [mocks, setMocks] = useState<MockExam[]>([])
  const [catalog, setCatalog] = useState<TopicCatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeFilter = (searchParams.get('subject') as TopicCode) || 'ALL'
  const categoryFilter = (searchParams.get('category') as MockCategoryFilter) || 'ALL'
  const examFilter = (searchParams.get('exam') as ExamTargetFilter) || 'ALL'

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'ALL') next.delete(key)
    else next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  const setFilter = (code: TopicCode) => updateParam('subject', code)
  const setCategoryFilter = (code: MockCategoryFilter) => updateParam('category', code)
  const setExamFilter = (code: ExamTargetFilter) => updateParam('exam', code)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const mocksUrl = isAuthenticated ? '/attempts/my-mocks' : '/public/mocks'
    Promise.all([api.get(mocksUrl), api.get('/public/topics')])
      .then(([mocksRes, topicsRes]) => {
        setMocks(mocksRes.data.map((m: MockExam) => normalizeMock(m)))
        setCatalog(topicsRes.data)
      })
      .catch((e) => setError(apiErrorMessage(e, 'Could not load mocks')))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  useEffect(() => {
    load()
  }, [load])

  const filters = useMemo(() => {
    const fromApi = catalog.map((t) => ({
      code: t.code as TopicCode,
      shortLabel: t.shortLabel,
      fullLabel: t.fullLabel,
    }))
    return [...STATIC_TOPIC_FILTERS, ...fromApi]
  }, [catalog])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return mocks.filter((m) => {
      if (!matchesTopicFilter(m.topics, m.cumulative, activeFilter)) return false
      if (!matchesCategoryFilter(m.mockCategory, categoryFilter)) return false
      if (!matchesExamFilter(m.examTarget, examFilter)) return false
      if (!q) return true
      return (
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.topics?.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [mocks, activeFilter, categoryFilter, examFilter, search])

  const startMock = (mockId: number) => {
    const target = `/mock/${mockId}`
    if (isAuthenticated) navigate(target)
    else navigate(`/login?redirect=${encodeURIComponent(target)}`)
  }

  return (
    <div className="page-container py-8 pb-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Layers className="h-8 w-8 text-neon-purple" />
            All mock tests
          </h1>
          <p className="page-subtitle max-w-2xl">
            IBPS SO IT Officer syllabus — filter by subject (CN, OS, DBMS, Security…) or cumulative full-length
            mocks. Best score counts for rank; retakes allowed where marked.
          </p>
        </div>
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={load} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {error && (
        <p className="mb-6 text-sm text-red-400 bg-red-950/30 border border-red-800/50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Filter className="h-4 w-4 text-neon-cyan shrink-0" />
          <span>Subject</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.code}
              type="button"
              title={f.fullLabel}
              onClick={() => setFilter(f.code)}
              className={cn(
                'cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                activeFilter === f.code
                  ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40'
                  : 'bg-cyber-900 text-slate-400 border-cyber-700 hover:border-cyber-500 hover:text-slate-200'
              )}
            >
              {f.shortLabel}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Filter className="h-4 w-4 text-neon-purple shrink-0" />
          <span>Type</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'FULL', 'SECTIONAL', 'PYQ', 'CHALLENGE'] as MockCategoryFilter[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setCategoryFilter(code)}
              className={cn(
                'cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                categoryFilter === code
                  ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/40'
                  : 'bg-cyber-900 text-slate-400 border-cyber-700 hover:border-cyber-500 hover:text-slate-200'
              )}
            >
              {code === 'ALL' ? 'All types' : MOCK_CATEGORY_LABELS[code]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Exam</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setExamFilter('ALL')}
            className={cn(
              'cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              examFilter === 'ALL'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-cyber-900 text-slate-400 border-cyber-700 hover:border-cyber-500'
            )}
          >
            All exams
          </button>
          {Object.entries(EXAM_TARGET_LABELS).map(([code, label]) => (
            <button
              key={code}
              type="button"
              onClick={() => setExamFilter(code)}
              className={cn(
                'cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                examFilter === code
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  : 'bg-cyber-900 text-slate-400 border-cyber-700 hover:border-cyber-500'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="search"
            placeholder="Search mock title or topic…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-cyber-900 border border-cyber-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-blue/50"
          />
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-6">
        Showing <strong className="text-slate-300">{filtered.length}</strong> of {mocks.length} live mocks
        {(activeFilter !== 'ALL' || categoryFilter !== 'ALL' || examFilter !== 'ALL') && (
          <>
            {' '}
            · filters active
          </>
        )}
      </p>

      {loading && <p className="text-slate-400 text-center py-16">Loading mocks…</p>}

      {!loading && (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((m) => (
            <MockExamCard key={m.id} mock={m} onStart={startMock} />
          ))}
          {filtered.length === 0 && !error && (
            <div className="col-span-2 text-center py-16 text-slate-400 border border-dashed border-cyber-700 rounded-xl">
              <p>No mocks match this filter yet.</p>
              <Button
                variant="ghost"
                className="mt-3 cursor-pointer"
                onClick={() => {
                  setFilter('ALL')
                  setCategoryFilter('ALL')
                  setExamFilter('ALL')
                  setSearch('')
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}

      <p className="text-center mt-10 text-sm text-slate-500">
        <Link to="/dashboard" className="text-neon-cyan hover:underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  )
}
