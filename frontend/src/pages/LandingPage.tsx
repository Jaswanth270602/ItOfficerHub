import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Seo } from '@/components/Seo'
import { faqJsonLd, LANDING_FAQ } from '@/lib/seo-faq'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UpcomingMockBanner } from '@/components/UpcomingMockBanner'
import { LandingPlatformShowcase } from '@/components/landing/LandingPlatformShowcase'
import { LandingSection } from '@/components/landing/LandingSection'
import { MottoCarousel, type MottoSlide } from '@/components/landing/MottoCarousel'
import {
  Award,
  BarChart3,
  BookOpen,
  ChevronDown,
  FolderOpen,
  Clock,
  FileQuestion,
  GraduationCap,
  Layers,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Unlock,
  Users,
  Zap,
} from 'lucide-react'

const LandingHeroScene = lazy(() =>
  import('@/components/landing/LandingHeroScene').then((m) => ({
    default: m.LandingHeroScene,
  }))
)

function HeroSceneFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(59,130,246,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(139,92,246,0.2),transparent_50%)]" />
    </div>
  )
}

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

const EXAM_BADGES = [
  { label: 'IBPS SO IT', href: '/mocks', className: 'border-neon-cyan/45 bg-neon-cyan/10 text-neon-cyan' },
  { label: 'SBI IT', href: '/mocks', className: 'border-blue-400/40 bg-blue-500/10 text-blue-300' },
  { label: 'BOB IT', href: '/mocks', className: 'border-orange-500/40 bg-orange-500/10 text-orange-300' },
  { label: 'UCO Bank IT', href: '/mocks', className: 'border-teal-500/40 bg-teal-500/10 text-teal-300' },
  { label: 'PSU IT', href: '/mocks', className: 'border-neon-blue/45 bg-neon-blue/10 text-neon-blue' },
  { label: 'NIACL / LIC', href: '/syllabus', className: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  { label: 'GIC / RBI IT', href: '/mocks', className: 'border-violet-500/40 bg-violet-500/10 text-violet-300' },
  { label: 'TCS NQT', href: '/tcs-nqt', className: 'border-neon-purple/45 bg-neon-purple/10 text-neon-purple' },
] as const

const MOTTO_SLIDES: MottoSlide[] = [
  {
    quote: 'Practice daily. Rank nationally. Win your IT Officer dream.',
    tag: 'Daily discipline',
    accent: 'cyan',
  },
  {
    quote: 'Built by IT officers, for IT officers — not another generic test app.',
    tag: 'By aspirants, for aspirants',
    accent: 'purple',
  },
  {
    quote: 'Study Q&A with zero signup — open prep instantly. Mocks need a free account for rank.',
    tag: 'No login for prep',
    accent: 'emerald',
  },
  {
    quote: '100% free forever. No ads. No paywalls. No API keys.',
    tag: 'Always free',
    accent: 'emerald',
  },
  {
    quote: 'Real P +1 / N −0.25 marking. Real timer. Real exam pressure.',
    tag: 'Exam-accurate mocks',
    accent: 'amber',
  },
  {
    quote: 'From CN to DBMS to Security — master every chapter with analytics.',
    tag: 'Topic-wise strength',
    accent: 'cyan',
  },
]

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Topic-wise Study Q&A',
    desc: 'Topic-wise syllabus — browse CN, DBMS, OS & Security with solutions. No login required.',
  },
  {
    icon: Zap,
    title: 'Daily mock at midnight IST',
    desc: 'A fresh full-length mock unlocks every day — compete on the daily leaderboard.',
  },
  {
    icon: Trophy,
    title: 'All-India rank & percentile',
    desc: 'See where you stand among unique best scores — fair rankings, retakes excluded.',
  },
  {
    icon: BarChart3,
    title: 'Chapter-wise analytics',
    desc: 'Strong and weak topics from import tags — know exactly what to revise next.',
  },
  {
    icon: Mail,
    title: 'Prep Mail & prep groups',
    desc: 'DM friends, share score cards, and study together without leaving the hub.',
  },
]

export function LandingPage() {
  const [stats, setStats] = useState<Stats>({
    totalMocks: 0,
    totalUsers: 0,
    totalAttempts: 0,
    averageScorePercent: 0,
  })
  const [featured, setFeatured] = useState<Mock | null>(null)
  const [upcoming, setUpcoming] = useState<{
    id: number
    title: string
    mockCode?: string | null
    goLiveAt: string
    goLiveDateLabel: string
  } | null>(null)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/public/stats').then((r) => setStats(r.data)).catch(() => {})
    api
      .get('/public/dashboard')
      .then((r) => {
        if (r.data?.mockOfTheDay) setFeatured(r.data.mockOfTheDay)
        if (r.data?.upcomingMock) setUpcoming(r.data.upcomingMock)
      })
      .catch(() => {})
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

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Seo
        path="/"
        title="Crack IBPS SO IT Officer — 100% Free, No Login for Prep"
        description="Free IBPS SO IT, SBI IT, BOB IT, UCO Bank IT, PSU IT & TCS NQT prep — topic-wise Study Q&A with no login. All-India rank on mocks. 100% free."
        keywords="ItOfficerHub, IBPS SO IT Officer, SBI IT Officer, BOB IT Officer, UCO Bank IT Officer, PSU IT Officer, NIACL IT, LIC IT, TCS NQT mock test, free IT officer mock test, bank IT officer preparation"
        jsonLd={[
          faqJsonLd(),
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'ItOfficerHub — IT Officer Hub',
            description: 'Free IBPS SO IT Officer and TCS NQT mock tests with rank and solutions.',
            url: 'https://itofficerhub.in/',
            isPartOf: { '@type': 'WebSite', name: 'ItOfficerHub' },
          },
        ]}
      />

      <article className="landing-scroll -mt-0">
        {/* ——— Section 1: Hero + Three.js ——— */}
        <LandingSection id="hero" ariaLabelledby="hero-heading" className="overflow-hidden">
          <Suspense fallback={<HeroSceneFallback />}>
            <LandingHeroScene />
          </Suspense>

          <div className="relative z-10 page-container flex flex-col items-center text-center px-3 sm:px-4 pt-6 sm:pt-8 pb-24">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-5 sm:mb-6 w-full max-w-3xl">
              {EXAM_BADGES.map(({ label, href, className }) => (
                <Link
                  key={label}
                  to={href}
                  className={`inline-flex items-center px-3.5 sm:px-4 py-2 rounded-lg border text-xs sm:text-sm font-semibold tracking-wide hover:brightness-110 transition-all ${className}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-7">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-xs sm:text-sm text-emerald-300 font-medium">
                <Unlock className="h-4 w-4 shrink-0" /> Study prep · no login needed
              </span>
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-neon-purple/30 bg-neon-purple/10 text-xs sm:text-sm text-neon-purple">
                <Zap className="h-4 w-4 shrink-0" /> 100% free · no ads
              </span>
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-cyber-600 bg-cyber-900/60 text-xs sm:text-sm text-slate-400">
                <ShieldCheck className="h-4 w-4 shrink-0" /> Mocks · free account for rank
              </span>
            </div>

            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold mb-4 sm:mb-5 leading-[1.12] tracking-tight max-w-4xl"
            >
              Crack IBPS SO IT Officer.
              <br />
              <span className="bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple bg-clip-text text-transparent">
                100% free — no login for prep.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed">
              Topic-wise Study Q&amp;A opens instantly — CN, DBMS, OS, Security &amp; more. Start prep without
              creating an account.
            </p>
            <p className="text-slate-500 mb-8 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Full-length &amp; sectional mocks with All-India rank need a{' '}
              <strong className="text-slate-300">free account</strong> — prep never does.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 w-full sm:w-auto max-w-md sm:max-w-none">
              <Link to="/study" className="w-full sm:w-auto">
                <Button size="lg" className="cursor-pointer w-full min-h-[48px] gap-2">
                  <FolderOpen className="h-5 w-5 shrink-0" /> Study Q&amp;A — no login
                </Button>
              </Link>
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="cursor-pointer w-full min-h-[48px]">
                  Daily mock
                </Button>
              </Link>
              <Link to="/tcs-nqt" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="cursor-pointer gap-2 w-full min-h-[48px]">
                  <GraduationCap className="h-5 w-5 shrink-0" /> TCS NQT aptitude
                </Button>
              </Link>
              <Link to="/mocks" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="cursor-pointer gap-2 w-full min-h-[48px]">
                  <Layers className="h-5 w-5 shrink-0" /> All IT mocks
                </Button>
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={() => scrollToSection('platform')}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-slate-500 hover:text-neon-cyan transition-colors cursor-pointer animate-bounce"
            aria-label="Scroll to platform section"
          >
            <span className="text-[10px] uppercase tracking-widest">Explore</span>
            <ChevronDown className="h-6 w-6" />
          </button>
        </LandingSection>

        {/* ——— Section 2: Stats + today's mock ——— */}
        <LandingSection id="platform" ariaLabelledby="platform-heading" center={false} className="py-16 sm:py-20">
          <div className="page-container w-full">
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-xs uppercase tracking-widest text-neon-cyan mb-2">Live platform</p>
              <h2 id="platform-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                Rank, analytics &amp; daily prep — built in
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
                See where you stand, which chapters need work, and how consistent your mock habit is.
              </p>
            </div>

            <LandingPlatformShowcase />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12" aria-label="Platform statistics">
              {[
                { icon: BarChart3, value: stats.totalMocks, label: 'Mock Tests', color: 'text-neon-blue' },
                { icon: Users, value: stats.totalUsers, label: 'Aspirants', color: 'text-neon-purple' },
                { icon: Award, value: stats.totalAttempts, label: 'Attempts', color: 'text-neon-cyan' },
                { icon: Clock, value: `${stats.averageScorePercent}%`, label: 'Avg Net Score', color: 'text-green-400' },
              ].map(({ icon: Icon, value, label, color }) => (
                <Card key={label} className="border-cyber-700/80 bg-cyber-900/50">
                  <CardContent className="pt-5 sm:pt-6 flex items-center gap-3 sm:gap-4">
                    <Icon className={`h-8 w-8 sm:h-10 sm:w-10 shrink-0 ${color}`} />
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold tabular-nums">{value}</p>
                      <p className="text-slate-400 text-xs sm:text-sm truncate">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {upcoming && !featured && (
              <div className="max-w-2xl mx-auto mb-8">
                <UpcomingMockBanner upcoming={upcoming} />
              </div>
            )}

            {featured && (
              <div className="max-w-2xl mx-auto" aria-label="Today's featured mock">
                <Card className="border-neon-blue/40 bg-gradient-to-br from-cyber-900/90 to-cyber-950 hover:border-neon-blue/70 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg sm:text-xl break-words pr-2">{featured.title}</CardTitle>
                      <span className="text-xs px-2 py-1 rounded bg-neon-purple/20 text-neon-purple shrink-0">
                        {featured.difficulty}
                      </span>
                    </div>
                    <CardDescription>{featured.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <FileQuestion className="h-4 w-4 shrink-0" /> {featured.questionCount} Questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4 shrink-0" /> {featured.timeLimitMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 shrink-0" /> {featured.attemptsCount} test-takers
                      </span>
                    </div>
                    <Button size="lg" className="w-full cursor-pointer min-h-[48px]" onClick={handleStart}>
                      <Target className="h-5 w-5 shrink-0" /> Start Mock Test
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </LandingSection>

        {/* ——— Section 3: Features ——— */}
        <LandingSection id="features" ariaLabelledby="features-heading" className="bg-cyber-950/80">
          <div className="page-container w-full py-8">
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-xs uppercase tracking-widest text-neon-purple mb-2">Why ItOfficerHub</p>
              <h2 id="features-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Everything you need to crack IT Officer exams
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
                IBPS SO IT, SBI IT, BOB IT, UCO Bank IT, PSU IT (NIACL, LIC, GIC, RBI), and TCS NQT — one hub, zero cost.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <Card
                  key={title}
                  className="border-cyber-700/80 bg-cyber-900/40 hover:border-neon-cyan/30 transition-colors"
                >
                  <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8">
                    <div className="h-12 w-12 rounded-xl bg-neon-blue/10 border border-neon-blue/25 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-neon-cyan" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-10 sm:mt-12 max-w-3xl mx-auto text-center">
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                <strong className="text-slate-200">ItOfficerHub</strong> focuses on the IT Officer niche — sectional
                mocks, previous-year style papers, revision bucket, and{' '}
                <Link to="/syllabus" className="text-neon-cyan hover:underline">
                  full IBPS SO IT syllabus
                </Link>
                .
              </p>
            </div>
          </div>
        </LandingSection>

        {/* ——— Section 4: Mottos carousel ——— */}
        <LandingSection id="mottos" ariaLabelledby="mottos-heading" className="bg-gradient-to-b from-cyber-950 via-cyber-900/30 to-cyber-950">
          <div className="page-container w-full py-8">
            <div className="text-center mb-8 sm:mb-12">
              <Sparkles className="h-8 w-8 text-amber-400 mx-auto mb-3" />
              <h2 id="mottos-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Our promise to every aspirant
              </h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base">Swipe or wait — the hub speaks for itself</p>
            </div>
            <MottoCarousel slides={MOTTO_SLIDES} />
          </div>
        </LandingSection>

        {/* ——— Section 5: FAQ + CTA ——— */}
        <LandingSection id="faq" ariaLabelledby="faq-heading" center={false} className="pb-20 sm:pb-24">
          <div className="page-container w-full max-w-4xl py-12 sm:py-16">
            <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-white text-center">
              Frequently asked questions
            </h2>
            <div className="space-y-3 sm:space-y-4 mb-12 sm:mb-16">
              {LANDING_FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-cyber-700 bg-cyber-900/40 px-4 sm:px-5 py-4"
                >
                  <summary className="cursor-pointer font-medium text-slate-200 list-none flex justify-between items-center gap-3 text-sm sm:text-base">
                    <span className="text-left">{item.q}</span>
                    <span className="text-slate-500 group-open:rotate-45 transition-transform text-xl shrink-0">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>

            <div className="rounded-2xl border border-neon-cyan/30 bg-gradient-to-br from-cyber-900 to-cyber-950 p-8 sm:p-10 text-center">
              <BookOpen className="h-10 w-10 text-neon-cyan mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Ready for your next mock?</h3>
              <p className="text-slate-400 text-sm sm:text-base mb-6 max-w-md mx-auto">
                Sign up free, attempt today&apos;s mock, and climb the All-India leaderboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to={isAuthenticated ? '/dashboard' : '/register'} className="w-full sm:w-auto">
                  <Button size="lg" className="cursor-pointer w-full min-h-[48px]">
                    {isAuthenticated ? 'Go to dashboard' : 'Sign up free'}
                  </Button>
                </Link>
                <Link to="/mocks" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="cursor-pointer w-full min-h-[48px]">
                    Browse all mocks
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </LandingSection>
      </article>
    </>
  )
}
