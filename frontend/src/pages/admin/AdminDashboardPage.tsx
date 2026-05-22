import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImportMockModal } from './ImportMockModal'
import { BarChart3, FileJson, FileQuestion, Users } from 'lucide-react'

interface Dashboard {
  totalMocks: number
  totalQuestions: number
  totalUsers: number
  totalAttempts: number
}

interface MockAdmin {
  id: number
  title: string
  difficulty: string
  questionCount: number
  timeLimitMinutes: number
  published: boolean
  allowRetake: boolean
  attemptsCount: number
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Dashboard | null>(null)
  const [mocks, setMocks] = useState<MockAdmin[]>([])
  const [importOpen, setImportOpen] = useState(false)

  const load = () => {
    api.get('/admin/dashboard').then((r) => setStats(r.data))
    api.get('/admin/mocks').then((r) => setMocks(r.data))
  }

  useEffect(() => { load() }, [])

  const togglePublish = async (id: number) => {
    await api.patch(`/admin/mocks/${id}/publish`)
    load()
  }

  const deleteMock = async (id: number) => {
    if (!confirm('Delete this mock and all questions?')) return
    await api.delete(`/admin/mocks/${id}`)
    load()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => setImportOpen(true)}>
            <FileJson className="h-4 w-4" /> Import Mock (Paste JSON)
          </Button>
          <Link to="/">
            <Button variant="outline">View Site</Button>
          </Link>
        </div>
      </div>

      {stats && (
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card><CardContent className="pt-6 flex gap-3"><BarChart3 className="text-neon-blue" /><div><p className="text-2xl font-bold">{stats.totalMocks}</p><p className="text-sm text-slate-400">Mocks</p></div></CardContent></Card>
          <Card><CardContent className="pt-6 flex gap-3"><FileQuestion className="text-neon-purple" /><div><p className="text-2xl font-bold">{stats.totalQuestions}</p><p className="text-sm text-slate-400">Questions</p></div></CardContent></Card>
          <Card><CardContent className="pt-6 flex gap-3"><Users className="text-neon-cyan" /><div><p className="text-2xl font-bold">{stats.totalUsers}</p><p className="text-sm text-slate-400">Users</p></div></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-2xl font-bold">{stats.totalAttempts}</p><p className="text-sm text-slate-400">Attempts</p></CardContent></Card>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Mock Tests</h2>
      <div className="space-y-3">
        {mocks.map((m) => (
          <Card key={m.id}>
            <CardHeader className="flex flex-row justify-between items-center py-4">
              <div>
                <CardTitle className="text-base">{m.title}</CardTitle>
                <p className="text-sm text-slate-400">{m.difficulty} · {m.questionCount} Q · {m.attemptsCount} attempts · {m.published ? 'Published' : 'Draft'}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/mocks/${m.id}`}><Button size="sm" variant="outline">Manage</Button></Link>
                <Button size="sm" variant="outline" onClick={() => togglePublish(m.id)}>
                  {m.published ? 'Unpublish' : 'Publish'}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteMock(m.id)}>Delete</Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <ImportMockModal open={importOpen} onOpenChange={setImportOpen} onSuccess={load} />
    </div>
  )
}
