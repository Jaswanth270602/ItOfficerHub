import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toast } from '@/components/ui/toast'
import { ScheduleMockModal } from '@/components/admin/ScheduleMockModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImportMockModal } from './ImportMockModal'
import { BarChart3, BookOpen, CalendarClock, FileJson, FileQuestion, Users, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Dashboard {
  totalMocks: number
  totalQuestions: number
  totalUsers: number
  totalAttempts: number
}

type LiveStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE'

interface MockAdmin {
  id: number
  title: string
  mockCode?: string | null
  examTarget?: string
  mockCategory?: string
  difficulty: string
  questionCount: number
  timeLimitMinutes: number
  published: boolean
  allowRetake: boolean
  attemptsCount: number
  publishedAt: string | null
  goLiveAt: string | null
  liveStatus: LiveStatus
  showExamDate: boolean
}

const STATUS_STYLE: Record<LiveStatus, string> = {
  DRAFT: 'bg-slate-500/15 text-slate-400 border-slate-600',
  SCHEDULED: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  LIVE: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Dashboard | null>(null)
  const [mocks, setMocks] = useState<MockAdmin[]>([])
  const [importOpen, setImportOpen] = useState(false)
  const [scheduleFor, setScheduleFor] = useState<MockAdmin | null>(null)
  const [practiceStats, setPracticeStats] = useState<{ available: number; total: number } | null>(null)

  const load = () => {
    api.get('/admin/dashboard').then((r) => setStats(r.data))
    api.get('/admin/mocks').then((r) => setMocks(r.data))
    api.get('/admin/practice/catalog').then((r) =>
      setPracticeStats({ available: r.data.availableQuestions, total: r.data.totalSubtopics })
    ).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const togglePublish = async (id: number) => {
    await api.patch(`/admin/mocks/${id}/publish`)
    load()
  }

  const toggleShowDate = async (id: number) => {
    await api.patch(`/admin/mocks/${id}/show-date`)
    load()
  }

  const cancelSchedule = async (id: number) => {
    if (!(await toast.confirm('Cancel schedule and return mock to draft?'))) return
    await api.delete(`/admin/mocks/${id}/schedule`)
    load()
    toast.info('Schedule cancelled — mock is draft again')
  }

  const deleteMock = async (id: number) => {
    if (!(await toast.confirm('Delete this mock and all questions?'))) return
    await api.delete(`/admin/mocks/${id}`)
    load()
    toast.success('Mock deleted')
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10 pb-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Publish now or schedule — mocks go live at 12:00 AM IST on the chosen date
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button className="w-full sm:w-auto cursor-pointer" onClick={() => setImportOpen(true)}>
            <FileJson className="h-4 w-4 shrink-0" /> Import Mock
          </Button>
          <Link to="/admin/practice" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full cursor-pointer gap-1">
              <BookOpen className="h-4 w-4 shrink-0" /> Practice Q&amp;A
            </Button>
          </Link>
          <Link to="/study" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full cursor-pointer">Study Hub</Button>
          </Link>
        </div>
      </div>

      {practiceStats && (
        <p className="text-sm text-slate-400 mb-4">
          Study Q&amp;A: <strong className="text-neon-cyan">{practiceStats.available}</strong> MCQs live across{' '}
          {practiceStats.total} subtopics —{' '}
          <Link to="/admin/practice" className="text-neon-cyan hover:underline">
            manage &amp; import by subtopic
          </Link>
        </p>
      )}

      {stats && (
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card><CardContent className="pt-6 flex gap-3"><BarChart3 className="text-neon-blue" /><div><p className="text-2xl font-bold">{stats.totalMocks}</p><p className="text-sm text-slate-400">Mocks</p></div></CardContent></Card>
          <Card><CardContent className="pt-6 flex gap-3"><FileQuestion className="text-neon-purple" /><div><p className="text-2xl font-bold">{stats.totalQuestions}</p><p className="text-sm text-slate-400">Questions</p></div></CardContent></Card>
          <Card><CardContent className="pt-6 flex gap-3"><Users className="text-neon-cyan" /><div><p className="text-2xl font-bold">{stats.totalUsers}</p><p className="text-sm text-slate-400">Users</p></div></CardContent></Card>
          <Card><CardContent className="pt-6 flex gap-3"><Zap className="text-amber-400" /><div><p className="text-2xl font-bold">{stats.totalAttempts}</p><p className="text-sm text-slate-400">Attempts</p></div></CardContent></Card>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Mock Tests</h2>
      <div className="space-y-3">
        {mocks.map((m) => (
          <Card key={m.id}>
            <CardHeader className="flex flex-col gap-4 py-4 sm:flex-row sm:justify-between sm:items-start">
              <div className="min-w-0 w-full">
                <CardTitle className="text-base flex flex-wrap items-center gap-2 leading-snug">
                  {m.mockCode && (
                    <span className="font-mono text-xs text-neon-cyan border border-neon-cyan/30 px-1.5 py-0.5 rounded">
                      {m.mockCode}
                    </span>
                  )}
                  <span className={cn('text-[10px] uppercase px-2 py-0.5 rounded border', STATUS_STYLE[m.liveStatus])}>
                    {m.liveStatus}
                  </span>
                  {m.title}
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  {m.examTarget?.replace(/_/g, ' ') ?? '—'} · {m.mockCategory ?? 'FULL'} · {m.difficulty} · {m.questionCount} Q ·{' '}
                  {m.attemptsCount} attempts
                  {m.liveStatus === 'SCHEDULED' && m.goLiveAt && (
                    <> · Live {new Date(m.goLiveAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</>
                  )}
                  {m.liveStatus === 'LIVE' && m.publishedAt && (
                    <> · Since {new Date(m.publishedAt).toLocaleString()}</>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto sm:justify-end shrink-0">
                <Link to={`/admin/mocks/${m.id}`} className="col-span-2 sm:col-span-1">
                  <Button size="sm" variant="outline" className="w-full cursor-pointer">Manage</Button>
                </Link>
                <Button
                  size="sm"
                  variant={m.showExamDate ? 'default' : 'outline'}
                  className="w-full cursor-pointer text-xs sm:text-sm"
                  onClick={() => toggleShowDate(m.id)}
                >
                  {m.showExamDate ? 'Date ON' : 'Date OFF'}
                </Button>
                {m.liveStatus !== 'LIVE' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full cursor-pointer gap-1 text-xs sm:text-sm"
                    onClick={() => setScheduleFor(m)}
                  >
                    <CalendarClock className="h-4 w-4 shrink-0" /> Schedule
                  </Button>
                )}
                {m.liveStatus === 'SCHEDULED' && (
                  <Button size="sm" variant="outline" className="w-full cursor-pointer text-xs" onClick={() => cancelSchedule(m.id)}>
                    Cancel
                  </Button>
                )}
                <Button size="sm" variant="outline" className="w-full cursor-pointer text-xs sm:text-sm" onClick={() => togglePublish(m.id)}>
                  {m.liveStatus === 'LIVE' ? 'Unpublish' : 'Publish now'}
                </Button>
                <Button size="sm" variant="destructive" className="w-full cursor-pointer" onClick={() => deleteMock(m.id)}>
                  Delete
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <ImportMockModal open={importOpen} onOpenChange={setImportOpen} onSuccess={load} />
      {scheduleFor && (
        <ScheduleMockModal
          open={!!scheduleFor}
          onOpenChange={(o) => !o && setScheduleFor(null)}
          mockId={scheduleFor.id}
          mockTitle={scheduleFor.title}
          onSuccess={load}
        />
      )}
    </div>
  )
}
