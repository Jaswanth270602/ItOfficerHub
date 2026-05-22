import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Clock, FileQuestion, Target, Users, Zap, Award } from 'lucide-react'

interface Stats {
  totalMocks: number
  totalUsers: number
  totalAttempts: number
  averageScorePercent: number
}

interface Mock {
  id: number
  title: string
  description: string
  difficulty: string
  questionCount: number
  timeLimitMinutes: number
  attemptsCount: number
}

export function LandingPage() {
  const [stats, setStats] = useState<Stats>({ totalMocks: 0, totalUsers: 0, totalAttempts: 0, averageScorePercent: 0 })
  const [featured, setFeatured] = useState<Mock | null>(null)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/public/stats').then((r) => setStats(r.data)).catch(() => {})
    api.get('/public/dashboard').then((r) => {
      if (r.data?.mockOfTheDay) setFeatured(r.data.mockOfTheDay)
    }).catch(() => {})
  }, [])

  const handleStart = () => {
    if (!featured) {
      navigate(isAuthenticated ? '/dashboard' : '/login')
      return
    }
    const target = `/mock/${featured.id}`
    if (isAuthenticated) navigate(target)
    else navigate(`/login?redirect=${encodeURIComponent(target)}`)
  }

  return (
    <div>
      <section className="page-container py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-purple/30 bg-neon-purple/10 text-sm text-neon-purple mb-8">
          <Zap className="h-4 w-4" /> 100% Free · IBPS SO IT Officer
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
          Free IBPS SO IT Officer
          <br />
          <span className="bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple bg-clip-text text-transparent">
            Mock Tests
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-2">
          20 Questions · 15 Minutes · P +1 · N −0.25 marking
        </p>
        <p className="text-slate-500 mb-10">Real exam-style scoring, percentile rank & solution review. Login required to attempt.</p>
      </section>

      {featured && (
        <section className="max-w-2xl mx-auto px-4 pb-12">
          <Card className="border-neon-blue/40 hover:border-neon-blue/70 transition-colors cursor-default">
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                <CardTitle>{featured.title}</CardTitle>
                <span className="text-xs px-2 py-1 rounded bg-neon-purple/20 text-neon-purple shrink-0">{featured.difficulty}</span>
              </div>
              <CardDescription>{featured.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                <span className="flex items-center gap-1"><FileQuestion className="h-4 w-4" /> {featured.questionCount} Questions</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {featured.timeLimitMinutes} min</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {featured.attemptsCount} test-takers</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 p-3 rounded-lg bg-cyber-800/50">
                <span className="text-slate-400">P correct <strong className="text-green-400">+1</strong></span>
                <span className="text-slate-400">N wrong <strong className="text-red-400">−0.25</strong></span>
                <span>Unattempted 0</span>
              </div>
              <Button size="lg" className="w-full cursor-pointer" onClick={handleStart}>
                <Target className="h-5 w-5" /> Start Mock Test
              </Button>
              <p className="text-xs text-slate-500 mt-3 text-center">
                {isAuthenticated ? 'You are logged in — good luck!' : 'You will be asked to login or sign up first'}
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="page-container pb-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <BarChart3 className="h-10 w-10 text-neon-blue" />
            <div>
              <p className="text-2xl font-bold">{stats.totalMocks}</p>
              <p className="text-slate-400 text-sm">Mock Tests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <Users className="h-10 w-10 text-neon-purple" />
            <div>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-slate-400 text-sm">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <Award className="h-10 w-10 text-neon-cyan" />
            <div>
              <p className="text-2xl font-bold">{stats.totalAttempts}</p>
              <p className="text-slate-400 text-sm">Attempts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <Clock className="h-10 w-10 text-green-400" />
            <div>
              <p className="text-2xl font-bold">{stats.averageScorePercent}%</p>
              <p className="text-slate-400 text-sm">Avg Net Score</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {!featured && (
        <p className="text-center pb-20">
          <Link to="/login" className="text-neon-blue hover:underline cursor-pointer">Login</Link> to see available mocks
        </p>
      )}
    </div>
  )
}
