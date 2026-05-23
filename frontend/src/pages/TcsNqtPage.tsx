import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { MockExamCard } from '@/components/MockExamCard'
import { cn } from '@/lib/utils'
import { TCS_NQT_TARGET } from '@/lib/catalog'
import { matchesTopicFilter, TOPIC_SHORT, type TopicCode } from '@/lib/topics'
import { normalizeMock, type MockExam } from '@/types/mock'
import { Seo } from '@/components/Seo'
import { GraduationCap, RefreshCw, Search } from 'lucide-react'

const APTITUDE_FILTERS: { code: TopicCode; label: string }[] = [
  { code: 'ALL', label: 'All' },
  { code: 'QUANTITATIVE_APTITUDE', label: TOPIC_SHORT.QUANTITATIVE_APTITUDE },
  { code: 'LOGICAL_REASONING', label: TOPIC_SHORT.LOGICAL_REASONING },
  { code: 'VERBAL_ABILITY', label: TOPIC_SHORT.VERBAL_ABILITY },
]

export function TcsNqtPage() {
  const [mocks, setMocks] = useState<MockExam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState<TopicCode>('ALL')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const load = useCallback(() => {
    setLoading(true)
    const url = isAuthenticated ? '/attempts/my-mocks' : '/public/mocks'
    api
      .get(url)
      .then((r) => {
        setMocks(
          r.data.map((m: MockExam) => normalizeMock(m)).filter((m: MockExam) => m.examTarget === TCS_NQT_TARGET)
        )
        setError('')
      })
      .catch((e) => setError(apiErrorMessage(e, 'Could not load mocks')))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return mocks.filter((m) => {
      if (!matchesTopicFilter(m.topics, m.cumulative, subject)) return false
      if (!q) return true
      return m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
    })
  }, [mocks, subject, search])

  const startMock = (mockId: number) => {
    const path = `/mock/${mockId}`
    if (isAuthenticated) navigate(path)
    else navigate(`/login?redirect=${encodeURIComponent(path)}`)
  }

  return (
    <>
      <Seo
        path="/tcs-nqt"
        title="TCS NQT Mock Tests — Quant, Reasoning & Verbal Aptitude"
        description="Free TCS NQT (National Qualifier Test) aptitude mock tests — quantitative aptitude, logical reasoning, verbal ability. Campus hiring practice with rank and solutions. ItOfficerHub."
        keywords="TCS NQT, TCS NQT mock test, TCS National Qualifier Test, aptitude mock test, quantitative aptitude, logical reasoning, verbal ability, campus placement, TCS exam preparation, free aptitude test"
      />
      <div className="page-container py-8 pb-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-sky-400" />
            TCS NQT · Aptitude mocks
          </h1>
          <p className="page-subtitle max-w-2xl">
            Quant, logical reasoning and verbal — for campus hiring and TCS National Qualifier Test.
          </p>
        </div>
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={load} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {error && (
        <p className="mb-6 text-sm text-red-400 bg-red-950/30 border border-red-800/50 rounded-lg px-4 py-3">{error}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {APTITUDE_FILTERS.map((f) => (
          <button
            key={f.code}
            type="button"
            onClick={() => setSubject(f.code)}
            className={cn(
              'cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border',
              subject === f.code
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-cyber-900 text-slate-400 border-cyber-700'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="search"
          placeholder="Search TCS NQT mocks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-cyber-900 border border-cyber-700 text-sm text-white"
        />
      </div>

      <p className="text-sm text-slate-500 mb-6">
        {filtered.length} TCS NQT mock{filtered.length !== 1 && 's'} live
      </p>

      {loading && <p className="text-slate-400 text-center py-16">Loading…</p>}

      {!loading && (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((m) => (
            <MockExamCard key={m.id} mock={m} onStart={startMock} />
          ))}
          {filtered.length === 0 && !error && (
            <div className="col-span-2 text-center py-16 text-slate-400 border border-dashed border-cyber-700 rounded-xl">
              <p>No TCS NQT mocks published yet.</p>
              <Link to="/mocks" className="text-neon-cyan text-sm mt-3 inline-block hover:underline">
                Browse bank IT mocks
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  )
}
