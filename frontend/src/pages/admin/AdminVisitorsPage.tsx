import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowLeft, ChevronLeft, ChevronRight, Globe, RefreshCw, Search } from 'lucide-react'

interface SiteVisitRow {
  id: number
  ipAddress: string
  visitedAt: string
  visitDate: string
  path: string
  queryString: string | null
  referer: string | null
  deviceClass: string
  authenticated: boolean
  userId: number | null
  userEmail: string | null
  userName: string | null
  countryHint: string | null
}

interface DailySummary {
  date: string
  pageViews: number
  uniqueIps: number
}

interface VisitorAnalytics {
  visits: SiteVisitRow[]
  totalElements: number
  page: number
  size: number
  totalPages: number
  visitsOnSelectedDay: number
  uniqueIpsOnSelectedDay: number
  dailySummaries: DailySummary[]
}

function todayIst(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
}

export function AdminVisitorsPage() {
  const [data, setData] = useState<VisitorAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [date, setDate] = useState(todayIst())
  const [ipSearch, setIpSearch] = useState('')
  const [pathSearch, setPathSearch] = useState('')
  const [page, setPage] = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    api
      .get<VisitorAnalytics>('/admin/visitors', {
        params: {
          date: date || undefined,
          ip: ipSearch.trim() || undefined,
          path: pathSearch.trim() || undefined,
          page,
          size: 50,
        },
      })
      .then((r) => setData(r.data))
      .catch((e) => setError(apiErrorMessage(e, 'Could not load visitors')))
      .finally(() => setLoading(false))
  }, [date, ipSearch, pathSearch, page])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(0)
  }, [date, ipSearch, pathSearch])

  const inputClass =
    'w-full rounded-lg border border-cyber-700 bg-cyber-900/80 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue'

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10 pb-12">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-neon-cyan mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Admin dashboard
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <Globe className="h-7 w-7 text-neon-cyan" /> Site visitors
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            IP addresses and page paths (IST day). Logged when users browse public routes.
          </p>
        </div>
        <Button variant="outline" className="cursor-pointer gap-2" onClick={load} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="border-cyber-700">
            <CardContent className="pt-4">
              <p className="text-xs text-slate-500">Page views (selected day)</p>
              <p className="text-2xl font-bold text-white tabular-nums">{data.visitsOnSelectedDay}</p>
            </CardContent>
          </Card>
          <Card className="border-cyber-700">
            <CardContent className="pt-4">
              <p className="text-xs text-slate-500">Unique IPs (selected day)</p>
              <p className="text-2xl font-bold text-neon-cyan tabular-nums">{data.uniqueIpsOnSelectedDay}</p>
            </CardContent>
          </Card>
          <Card className="border-cyber-700 col-span-2">
            <CardContent className="pt-4">
              <p className="text-xs text-slate-500 mb-2">Last 30 days (IST)</p>
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                {data.dailySummaries.slice(0, 14).map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setDate(d.date)}
                    className={cn(
                      'text-xs px-2 py-1 rounded border cursor-pointer tabular-nums',
                      d.date === date
                        ? 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan'
                        : 'border-cyber-700 text-slate-400 hover:border-cyber-600'
                    )}
                  >
                    {d.date.slice(5)}: {d.uniqueIps} IPs / {d.pageViews} views
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6 border-cyber-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-500">Day (IST)</label>
            <input type="date" className={cn(inputClass, 'mt-1')} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500">IP contains</label>
            <input
              className={cn(inputClass, 'mt-1 font-mono')}
              placeholder="e.g. 103. or 192.168"
              value={ipSearch}
              onChange={(e) => setIpSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Path contains</label>
            <input
              className={cn(inputClass, 'mt-1')}
              placeholder="/study, /mocks…"
              value={pathSearch}
              onChange={(e) => setPathSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-cyber-700">
        <table className="w-full text-sm text-left min-w-[800px]">
          <thead className="bg-cyber-800/80 text-slate-300">
            <tr>
              <th className="px-3 py-2.5 font-medium">Time (UTC)</th>
              <th className="px-3 py-2.5 font-medium">IP address</th>
              <th className="px-3 py-2.5 font-medium">Path</th>
              <th className="px-3 py-2.5 font-medium">Device</th>
              <th className="px-3 py-2.5 font-medium">User</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && data?.visits.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                  No visits for this filter yet.
                </td>
              </tr>
            )}
            {!loading &&
              data?.visits.map((v) => (
                <tr key={v.id} className="border-t border-cyber-800/80 text-slate-400">
                  <td className="px-3 py-2 whitespace-nowrap text-xs tabular-nums">
                    {new Date(v.visitedAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-mono text-neon-cyan whitespace-nowrap">{v.ipAddress}</td>
                  <td className="px-3 py-2">
                    <span className="text-white">{v.path}</span>
                    {v.queryString && <span className="text-slate-500 text-xs">?{v.queryString}</span>}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {v.deviceClass}
                    {v.countryHint && <span className="text-slate-500 ml-1">· {v.countryHint}</span>}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {v.authenticated ? (
                      <span title={v.userEmail ?? ''}>{v.userName ?? v.userEmail ?? `User #${v.userId}`}</span>
                    ) : (
                      <span className="text-slate-500">Guest</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
          <span>
            Page {data.page + 1} of {data.totalPages} · {data.totalElements} total rows
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={page <= 0 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={page >= data.totalPages - 1 || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
