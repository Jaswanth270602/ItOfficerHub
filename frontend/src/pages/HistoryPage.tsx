import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, RefreshCw, RotateCcw, XCircle } from 'lucide-react'

interface AttemptHistoryItem {
  attemptId: number
  mockTestId: number
  mockTitle: string
  netScore: number
  maxMarks: number
  correctCount: number
  wrongCount: number
  percentage: number
  uniqueRank: number
  uniquePercentile: number
  uniqueStudents: number
  clearedCutoff: boolean
  cutoffMarks: number
  submittedAt: string
  allowRetake: boolean
  attemptIndexForMock: number
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function HistoryPage() {
  const [history, setHistory] = useState<AttemptHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    api
      .get('/attempts/history')
      .then((r) => setHistory(r.data))
      .catch((e) => setError(apiErrorMessage(e, 'Could not load attempts')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="page-container py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">My attempts</h1>
          <p className="page-subtitle">Every submitted mock · open full report or retake from dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="cursor-pointer" onClick={load} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
          </Button>
          <Link to="/dashboard">
            <Button size="sm" className="cursor-pointer">All mocks</Button>
          </Link>
        </div>
      </div>

      {error && (
        <p className="mb-6 text-sm text-red-400 bg-red-950/30 border border-red-800/50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {loading && <p className="text-slate-400 text-center py-12">Loading your attempts...</p>}

      <div className="space-y-3">
        {!loading &&
          history.map((h) => (
            <Card key={h.attemptId} className="border-cyber-700/80">
              <CardContent className="py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-semibold text-lg">{h.mockTitle}</h2>
                      {h.attemptIndexForMock > 1 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-cyber-800 text-slate-400">
                          Attempt #{h.attemptIndexForMock}
                        </span>
                      )}
                      {h.clearedCutoff ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-600/20 text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Cleared
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-amber-600/15 text-amber-400 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Below cutoff
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                      <Clock className="h-3 w-3" /> {formatDate(h.submittedAt)}
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400">
                      <span>
                        Net:{' '}
                        <strong className="text-neon-cyan text-base">
                          {h.netScore?.toFixed(2)}
                        </strong>{' '}
                        / {h.maxMarks}
                      </span>
                      <span>
                        {h.correctCount} correct · {h.wrongCount} wrong
                      </span>
                      <span>
                        Rank <strong className="text-white">#{h.uniqueRank}</strong> of{' '}
                        {h.uniqueStudents}
                      </span>
                      <span className="text-green-400">{h.uniquePercentile}%ile</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <Link to={`/result/${h.attemptId}`}>
                      <Button variant="outline" className="cursor-pointer w-full sm:w-auto">
                        Full report
                      </Button>
                    </Link>
                    {h.allowRetake && (
                      <Link to={`/mock/${h.mockTestId}`}>
                        <Button className="cursor-pointer w-full sm:w-auto gap-2">
                          <RotateCcw className="h-4 w-4" /> Retake
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {!loading && history.length === 0 && !error && (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-slate-400">
            <p>No attempts yet.</p>
            <Link to="/dashboard" className="text-neon-blue hover:underline mt-2 inline-block">
              Browse mock tests
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
