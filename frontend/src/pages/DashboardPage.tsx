import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, FileQuestion, Minus, Plus, TrendingUp, Users } from 'lucide-react'

interface Mock {
  id: number
  title: string
  description: string
  difficulty: string
  questionCount: number
  timeLimitMinutes: number
  attemptsCount: number
  allowRetake: boolean
}

export function DashboardPage() {
  const [mocks, setMocks] = useState<Mock[]>([])
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/public/mocks').then((r) => setMocks(r.data)).catch(() => {})
  }, [])

  const startMock = (mockId: number) => {
    const target = `/mock/${mockId}`
    if (isAuthenticated) navigate(target)
    else navigate(`/login?redirect=${encodeURIComponent(target)}`)
  }

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="page-title">Mock tests</h1>
        <p className="page-subtitle">IBPS SO IT · 20 questions · 15 minutes · percentile rank after submit</p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {mocks.map((m) => (
          <Card key={m.id} className="hover:border-neon-blue/40 transition-all hover:shadow-neon-blue/5">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{m.title}</CardTitle>
                <span className="text-xs px-2 py-1 rounded bg-neon-purple/20 text-neon-purple">{m.difficulty}</span>
              </div>
              <CardDescription>{m.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                <span className="flex items-center gap-1"><FileQuestion className="h-4 w-4" /> {m.questionCount} Qs</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {m.timeLimitMinutes} min</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {m.attemptsCount} test-takers</span>
                <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Percentile</span>
              </div>
              <div className="flex gap-3 text-xs text-slate-500 mb-4">
                <span className="text-green-400 flex items-center gap-1"><Plus className="h-3 w-3" /> +1</span>
                <span className="text-red-400 flex items-center gap-1"><Minus className="h-3 w-3" /> −0.25</span>
              </div>
              <Button className="w-full cursor-pointer" onClick={() => startMock(m.id)}>
                Start Mock Test
              </Button>
            </CardContent>
          </Card>
        ))}
        {mocks.length === 0 && (
          <Card className="col-span-2 border-dashed">
            <CardContent className="py-16 text-center text-slate-400">
              No published mocks yet. Admin can import via Claude JSON.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
