import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, FileQuestion, Play, RefreshCw, RotateCcw, Users } from 'lucide-react'

interface Mock {
  id: number
  title: string
  description: string
  difficulty: string
  questionCount: number
  timeLimitMinutes: number
  attemptsCount: number
  allowRetake: boolean
  attempted: boolean
  userAttemptCount: number
  bestNetScore: number | null
  latestAttemptId: number | null
  latestClearedCutoff: boolean
}

export function DashboardPage() {
  const [mocks, setMocks] = useState<Mock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    setError('')
    const url = isAuthenticated ? '/attempts/my-mocks' : '/public/mocks'
    api
      .get(url)
      .then((r) => {
        const data = r.data.map((m: Mock & { attempted?: boolean }) => ({
          ...m,
          attempted: m.attempted ?? false,
          userAttemptCount: m.userAttemptCount ?? 0,
          bestNetScore: m.bestNetScore ?? null,
          latestAttemptId: m.latestAttemptId ?? null,
          latestClearedCutoff: m.latestClearedCutoff ?? false,
        }))
        setMocks(data)
      })
      .catch((e) => setError(apiErrorMessage(e, 'Could not load mocks')))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [isAuthenticated])

  const startMock = (mockId: number) => {
    const target = `/mock/${mockId}`
    if (isAuthenticated) navigate(target)
    else navigate(`/login?redirect=${encodeURIComponent(target)}`)
  }

  return (
    <div className="page-container py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Mock tests</h1>
          <p className="page-subtitle">
            IBPS SO IT · 20 Q · 15 min · attempted tests show retake &amp; report links
          </p>
        </div>
        {isAuthenticated && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={load} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
            </Button>
            <Link to="/history">
              <Button variant="outline" size="sm" className="cursor-pointer">
                My attempts
              </Button>
            </Link>
          </div>
        )}
      </div>

      {error && (
        <p className="mb-6 text-sm text-red-400 bg-red-950/30 border border-red-800/50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {loading && <p className="text-slate-400 text-center py-12">Loading mocks...</p>}

      <div className="grid md:grid-cols-2 gap-5">
        {!loading &&
          mocks.map((m) => (
            <Card
              key={m.id}
              className={cn(
                'transition-all',
                m.attempted ? 'border-green-600/30' : 'hover:border-neon-blue/40'
              )}
            >
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="pr-2">{m.title}</CardTitle>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs px-2 py-1 rounded bg-neon-purple/20 text-neon-purple">
                      {m.difficulty}
                    </span>
                    {m.attempted && (
                      <span className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Attempted
                      </span>
                    )}
                  </div>
                </div>
                <CardDescription>{m.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <FileQuestion className="h-4 w-4" /> {m.questionCount} Qs
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {m.timeLimitMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {m.attemptsCount} students
                  </span>
                </div>
                {m.attempted && m.bestNetScore != null && (
                  <p className="text-sm mb-4">
                    Best score:{' '}
                    <strong className="text-neon-cyan">{m.bestNetScore.toFixed(2)}</strong>
                    {m.latestClearedCutoff ? (
                      <span className="text-green-400 ml-2">· Cutoff cleared</span>
                    ) : (
                      <span className="text-amber-400 ml-2">· Below cutoff</span>
                    )}
                    {m.userAttemptCount > 1 && (
                      <span className="text-slate-500 ml-2">· {m.userAttemptCount} attempts</span>
                    )}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {m.attempted && m.latestAttemptId && (
                    <Link to={`/result/${m.latestAttemptId}`} className="flex-1 min-w-[120px]">
                      <Button variant="outline" className="w-full cursor-pointer">
                        View report
                      </Button>
                    </Link>
                  )}
                  {(!m.attempted || m.allowRetake) && (
                    <Button
                      className={cn('cursor-pointer flex-1 min-w-[120px]', m.attempted && 'gap-2')}
                      onClick={() => startMock(m.id)}
                    >
                      {m.attempted ? (
                        <>
                          <RotateCcw className="h-4 w-4" /> Retake
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" /> Start test
                        </>
                      )}
                    </Button>
                  )}
                  {m.attempted && !m.allowRetake && (
                    <p className="text-xs text-slate-500 w-full">Retake disabled for this mock</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        {!loading && mocks.length === 0 && !error && (
          <Card className="col-span-2 border-dashed">
            <CardContent className="py-16 text-center text-slate-400">
              No published mocks yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
