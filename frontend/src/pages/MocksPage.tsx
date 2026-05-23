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
  matchesTrack,
  TCS_NQT_TARGET,
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
import { Seo } from '@/components/Seo'
import { ChevronLeft, ChevronRight, Filter, Layers, RefreshCw, Search, SlidersHorizontal, X } from 'lucide-react'

const PAGE_SIZE = 10

export function MocksPage() {
  const [mocks, setMocks] = useState<MockExam[]>([])
  const [catalog, setCatalog] = useState<TopicCatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeFilter = (searchParams.get('subject') as TopicCode) || 'ALL'
  const categoryFilter = (searchParams.get('category') as MockCategoryFilter) || 'ALL'
  const examFilter = (searchParams.get('exam') as ExamTargetFilter) || 'ALL'

  const activeFilterCount =
    (activeFilter !== 'ALL' ? 1 : 0) + (categoryFilter !== 'ALL' ? 1 : 0) + (examFilter !== 'ALL' ? 1 : 0)

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'ALL') next.delete(key)
    else next.set(key, value)
    setSearchParams(next, { replace: true })
    setPage(1)
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
      if (!matchesTrack(m.examTarget, 'it')) return false
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

  useEffect(() => {
    setPage(1)
  }, [search, activeFilter, categoryFilter, examFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  const startMock = (mockId: number) => {
    const target = `/mock/${mockId}`
    if (isAuthenticated) navigate(target)
    else navigate(`/login?redirect=${encodeURIComponent(target)}`)
  }

  const clearFilters = () => {
    setFilter('ALL')
    setCategoryFilter('ALL')
    setExamFilter('ALL')
    setSearch('')
  }

  return (
    <>
      <Seo
        path="/mocks"
        title="IBPS SO IT Officer Mock Tests — CN, DBMS, OS, Security"
        description="Free IBPS SO IT Officer and PSU IT mock tests by subject."
        keywords="IBPS SO IT Officer mock test, IBPS IT Officer, PSU IT Officer mock"
      />
      <div className="page-container py-6 sm:py-8 pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Layers className="h-7 w-7 sm:h-8 sm:w-8 text-neon-purple shrink-0" />
              All mock tests
            </h1>
            <p className="page-subtitle max-w-2xl text-sm sm:text-base">
              Filter when you need to — browse mocks first. 10 per page.
            </p>
          </div>
          <Button variant="outline" size="sm" className="cursor-pointer shrink-0" onClick={load} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </Button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-950/30 border border-red-800/50 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="search"
              placeholder="Search mock title or topic…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-cyber-900 border border-cyber-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-blue/50"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer gap-2 shrink-0"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {filtersOpen ? 'Hide filters' : 'Show filters'}
            {activeFilterCount > 0 && (
              <span className="bg-neon-cyan/20 text-neon-cyan text-xs px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {!filtersOpen && activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
            <span className="text-slate-500">Active:</span>
            {activeFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">
                {filters.find((f) => f.code === activeFilter)?.shortLabel}
              </span>
            )}
            {categoryFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full bg-neon-purple/15 text-neon-purple border border-neon-purple/30">
                {MOCK_CATEGORY_LABELS[categoryFilter]}
              </span>
            )}
            {examFilter !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {EXAM_TARGET_LABELS[examFilter]}
              </span>
            )}
            <button type="button" onClick={clearFilters} className="text-slate-400 hover:text-white cursor-pointer flex items-center gap-0.5">
              <X className="h-3 w-3" /> Clear
            </button>
          </div>
        )}

        {filtersOpen && (
          <div className="mb-6 rounded-xl border border-cyber-700 bg-cyber-900/40 p-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Subject
              </p>
              <div className="flex flex-wrap gap-1.5">
                {filters.map((f) => (
                  <button
                    key={f.code}
                    type="button"
                    title={f.fullLabel}
                    onClick={() => setFilter(f.code)}
                    className={cn(
                      'cursor-pointer px-2.5 py-1 rounded-full text-xs border',
                      activeFilter === f.code
                        ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40'
                        : 'bg-cyber-950 text-slate-400 border-cyber-700 hover:border-slate-500'
                    )}
                  >
                    {f.shortLabel}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Type</p>
              <div className="flex flex-wrap gap-1.5">
                {(['ALL', 'FULL', 'SECTIONAL', 'PYQ', 'CHALLENGE'] as MockCategoryFilter[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCategoryFilter(code)}
                    className={cn(
                      'cursor-pointer px-2.5 py-1 rounded-full text-xs border',
                      categoryFilter === code
                        ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/40'
                        : 'bg-cyber-950 text-slate-400 border-cyber-700'
                    )}
                  >
                    {code === 'ALL' ? 'All types' : MOCK_CATEGORY_LABELS[code]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Exam</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setExamFilter('ALL')}
                  className={cn(
                    'cursor-pointer px-2.5 py-1 rounded-full text-xs border',
                    examFilter === 'ALL'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      : 'bg-cyber-950 text-slate-400 border-cyber-700'
                  )}
                >
                  All exams
                </button>
                {Object.entries(EXAM_TARGET_LABELS)
                  .filter(([code]) => code !== TCS_NQT_TARGET)
                  .map(([code, label]) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setExamFilter(code as ExamTargetFilter)}
                      className={cn(
                        'cursor-pointer px-2.5 py-1 rounded-full text-xs border',
                        examFilter === code
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          : 'bg-cyber-950 text-slate-400 border-cyber-700'
                      )}
                    >
                      {label}
                    </button>
                  ))}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              TCS NQT aptitude →{' '}
              <Link to="/tcs-nqt" className="text-sky-400 hover:underline">
                TCS NQT section
              </Link>
            </p>
          </div>
        )}

        <p className="text-sm text-slate-500 mb-4">
          Showing <strong className="text-slate-300">{filtered.length === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filtered.length)}</strong> of{' '}
          <strong className="text-slate-300">{filtered.length}</strong> mocks
          {mocks.length !== filtered.length && ` (${mocks.length} total)`}
        </p>

        {loading && <p className="text-slate-400 text-center py-16">Loading mocks…</p>}

        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
              {pageItems.map((m) => (
                <MockExamCard key={m.id} mock={m} onStart={startMock} />
              ))}
            </div>

            {filtered.length === 0 && !error && (
              <div className="text-center py-16 text-slate-400 border border-dashed border-cyber-700 rounded-xl">
                <p>No mocks match this filter yet.</p>
                <Button variant="ghost" className="mt-3 cursor-pointer" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}

            {filtered.length > 0 && totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <span className="text-sm text-slate-400 px-2 tabular-nums">
                  Page {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        <p className="text-center mt-10 text-sm text-slate-500">
          <Link to="/dashboard" className="text-neon-cyan hover:underline">
            Back to dashboard
          </Link>
        </p>
      </div>
    </>
  )
}
