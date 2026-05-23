import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Seo } from '@/components/Seo'
import { faqJsonLd, LANDING_FAQ } from '@/lib/seo-faq'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Clock, FileQuestion, Target, Users, Zap, Award, GraduationCap, Layers } from 'lucide-react'

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
    <>
      <Seo
        path="/"
        title="Free IBPS SO IT Officer, PSU IT & TCS NQT Mock Tests"
        description="ItOfficerHub — the IT Officer Hub for free IBPS SO IT Officer mock tests, PSU IT Officer preparation (NIACL, LIC, GIC, RBI), and TCS NQT aptitude practice. Quant, reasoning, verbal, CN, DBMS, OS. All-India rank & solutions."
        keywords="ItOfficerHub, IT Officer Hub, it officer hub, IBPS SO IT Officer mock test free, IBPS IT Officer, PSU IT Officer, TCS NQT mock test, TCS NQT aptitude, quantitative aptitude, logical reasoning, verbal ability, bank IT officer, free mock test"
        jsonLd={[
          faqJsonLd(),
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'ItOfficerHub — IT Officer Hub',
            description: 'Free IBPS SO IT Officer and TCS NQT mock tests with rank and solutions.',
            url: 'https://itofficerhub.onrender.com/',
            isPartOf: { '@type': 'WebSite', name: 'ItOfficerHub' },
          },
        ]}
      />

      <article>
        <section className="page-container py-16 md:py-24 text-center" aria-labelledby="hero-heading">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-purple/30 bg-neon-purple/10 text-sm text-neon-purple mb-8">
            <Zap className="h-4 w-4" /> 100% Free · IT Officer Hub · IBPS SO IT · TCS NQT
          </div>
          <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
            ItOfficerHub — Free IBPS SO IT Officer
            <br />
            <span className="bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple bg-clip-text text-transparent">
              &amp; TCS NQT Mock Tests
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-2">
            20 Questions · 15 Minutes · P +1 · N −0.25 marking
          </p>
          <p className="text-slate-500 mb-6 max-w-2xl mx-auto">
            India&apos;s free <strong className="text-slate-300">IT Officer Hub</strong> for bank IT Officer exams and campus aptitude.
            Daily mocks, All-India rank, cutoff analysis, and full solutions.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Link to="/dashboard">
              <Button size="lg" className="cursor-pointer">Start practicing</Button>
            </Link>
            <Link to="/tcs-nqt">
              <Button size="lg" variant="outline" className="cursor-pointer gap-2">
                <GraduationCap className="h-5 w-5" /> TCS NQT aptitude
              </Button>
            </Link>
            <Link to="/mocks">
              <Button size="lg" variant="outline" className="cursor-pointer gap-2">
                <Layers className="h-5 w-5" /> All IT mocks
              </Button>
            </Link>
          </div>
        </section>

        {featured && (
          <section className="max-w-2xl mx-auto px-4 pb-12" aria-label="Today's featured mock">
            <Card className="border-neon-blue/40 hover:border-neon-blue/70 transition-colors">
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
                <Button size="lg" className="w-full cursor-pointer" onClick={handleStart}>
                  <Target className="h-5 w-5" /> Start Mock Test
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        <section className="page-container pb-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Platform statistics">
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
                <p className="text-slate-400 text-sm">Aspirants</p>
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

        {/* SEO-rich content — visible to users and crawlers */}
        <section className="page-container pb-16 max-w-4xl" aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-2xl font-bold mb-4 text-white">
            Why ItOfficerHub for IT Officer &amp; aptitude preparation?
          </h2>
          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-4">
            <p>
              <strong className="text-slate-200">ItOfficerHub</strong> (also searched as{' '}
              <strong className="text-slate-200">IT Officer Hub</strong> or <strong className="text-slate-200">It Officer Hub</strong>)
              is built for <strong className="text-slate-200">IBPS SO IT Officer</strong> aspirants,{' '}
              <strong className="text-slate-200">PSU IT Officer</strong> exams (NIACL, LIC, GIC, RBI), and{' '}
              <strong className="text-slate-200">TCS NQT</strong> campus hiring. Practice professional knowledge
              (Computer Networks, DBMS, OS, Security) and{' '}
              <strong className="text-slate-200">aptitude</strong> (quantitative, logical reasoning, verbal) with
              real exam timing and negative marking.
            </p>
            <p>
              Unlike generic test platforms, we focus on the IT Officer niche — sectional mocks by subject, previous
              year style papers, All-India leaderboard, cutoff tracking, and revision bucket for wrong answers.{' '}
              <Link to="/syllabus" className="text-neon-cyan hover:underline">View full IBPS SO IT syllabus</Link> or{' '}
              <Link to="/tcs-nqt" className="text-neon-cyan hover:underline">browse TCS NQT aptitude mocks</Link>.
            </p>
          </div>
        </section>

        <section className="page-container pb-24 max-w-4xl" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-2xl font-bold mb-6 text-white">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {LANDING_FAQ.map((item) => (
              <details key={item.q} className="group rounded-xl border border-cyber-700 bg-cyber-900/40 px-5 py-4">
                <summary className="cursor-pointer font-medium text-slate-200 list-none flex justify-between items-center">
                  {item.q}
                  <span className="text-slate-500 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </>
  )
}
