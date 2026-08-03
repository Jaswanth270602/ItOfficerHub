import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Seo } from '@/components/Seo'
import { SITE_URL } from '@/lib/seo'
import { faqJsonLd, LANDING_FAQ } from '@/lib/seo-faq'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UpcomingMockBanner } from '@/components/UpcomingMockBanner'
import { LandingDailySplash } from '@/components/landing/LandingDailySplash'
import { LandingHeroQuizCard } from '@/components/landing/LandingHeroQuizCard'
import { LandingPlatformShowcase } from '@/components/landing/LandingPlatformShowcase'
import { OfficialChannelsCard } from '@/components/OfficialChannelsCard'
import { LandingSection } from '@/components/landing/LandingSection'
import { MottoCarousel, type MottoSlide } from '@/components/landing/MottoCarousel'
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  Clock,
  FileQuestion,
  Flame,
  FolderOpen,
  Layers,
  Share2,
  Sparkles,
  Target,
  Trophy,
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
  { label: 'NIACL / LIC', href: '/ibps-so-it-officer', className: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  { label: 'GIC / RBI IT', href: '/mocks', className: 'border-violet-500/40 bg-violet-500/10 text-violet-300' },
  { label: 'IBPS SO 2026', href: '/ibps-so-2026', className: 'border-neon-purple/45 bg-neon-purple/10 text-neon-purple' },
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
    quote: 'Real P +2 / N −0.5 marking. Real timer. Real exam pressure.',
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
    icon: Flame,
    title: 'Daily 10 Quiz',
    desc: '10 random Study Q&A questions every day — start from the hero, no login, share your score.',
    accent: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
  },
  {
    icon: BookOpen,
    title: 'Topic-wise Study Q&A',
    desc: 'Topic-wise syllabus — browse CN, DBMS, OS & Security with solutions. No login required.',
    accent: 'from-neon-cyan/20 to-neon-blue/10 border-neon-cyan/30 text-neon-cyan',
  },
  {
    icon: Zap,
    title: 'Daily mock at midnight IST',
    desc: 'A fresh full-length mock unlocks every day — compete on the daily leaderboard.',
    accent: 'from-neon-purple/20 to-violet-500/10 border-neon-purple/30 text-neon-purple',
  },
  {
    icon: Trophy,
    title: 'All-India rank & percentile',
    desc: 'See where you stand among unique best scores — fair rankings, retakes excluded.',
    accent: 'from-amber-400/15 to-yellow-500/10 border-amber-400/25 text-amber-300',
  },
  {
    icon: Share2,
    title: 'Shareable score cards',
    desc: 'Visual result cards for WhatsApp — challenge friends to beat your rank or Daily 10.',
    accent: 'from-emerald-500/15 to-teal-500/10 border-emerald-500/25 text-emerald-300',
  },
  {
    icon: BarChart3,
    title: 'Chapter-wise analytics',
    desc: 'Strong and weak topics from import tags — know exactly what to revise next.',
    accent: 'from-blue-500/15 to-cyan-500/10 border-blue-400/25 text-neon-blue',
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
      <LandingDailySplash />
      <Seo
        path="/"
        title="Crack IBPS SO IT Officer — 100% Free, No Login for Prep"
        description="Free Daily 10 quiz & Study Q&A — no login. IBPS SO IT, SBI IT, BOB IT, UCO Bank IT, PSU IT & TCS NQT mocks with All-India rank. 100% free."
        keywords="ItOfficerHub, Daily 10 quiz, IBPS SO IT Officer, SBI IT Officer, BOB IT Officer, UCO Bank IT Officer, PSU IT Officer, NIACL IT, LIC IT, TCS NQT mock test, free IT officer mock test"
        image={`${SITE_URL}/og-default.png`}
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

          <div className="relative z-10 page-container px-3 sm:px-4 pt-6 sm:pt-10 pb-24">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-center max-w-6xl mx-auto">
              <div className="text-center lg:text-left">
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-5 w-full">
                  {EXAM_BADGES.slice(0, 5).map(({ label, href, className }) => (
                    <Link
                      key={label}
                      to={href}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide hover:brightness-110 transition-all ${className}`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>

                <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/35 bg-emerald-500/10 text-xs text-emerald-300 font-medium mb-4">
                  <Zap className="h-3.5 w-3.5" /> 100% free · Daily 10 needs no login
                </p>

                <h1
                  id="hero-heading"
                  className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-[1.12] tracking-tight"
                >
                  <span className="block text-white mb-1">ItOfficerHub</span>
                  <span className="bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple bg-clip-text text-transparent">
                    Crack IBPS SO IT — start in one tap.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 mb-6 leading-relaxed">
                  Take today&apos;s Daily 10 from Study Q&amp;A instantly — or jump into a full mock for All-India rank.
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-2.5">
                  <Link to="/study">
                    <Button size="lg" variant="outline" className="cursor-pointer min-h-[48px] gap-2 w-full sm:w-auto">
                      <FolderOpen className="h-5 w-5" /> Study Q&amp;A
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button size="lg" variant="outline" className="cursor-pointer min-h-[48px] gap-2 w-full sm:w-auto">
                      <Target className="h-5 w-5" /> Daily mock
                    </Button>
                  </Link>
                  <Link to="/mocks">
                    <Button size="lg" variant="ghost" className="cursor-pointer min-h-[48px] gap-2 w-full sm:w-auto text-slate-300">
                      <Layers className="h-5 w-5" /> All mocks
                    </Button>
                  </Link>
                </div>
              </div>

              <LandingHeroQuizCard />
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

            <LandingPlatformShowcase stats={stats} />

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

          <div className="max-w-3xl mx-auto mt-12 sm:mt-16">
            <OfficialChannelsCard />
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
              {FEATURES.map(({ icon: Icon, title, desc, accent }) => (
                <div
                  key={title}
                  className="feature-tile group rounded-2xl border border-cyber-700/80 bg-cyber-900/40 p-5 sm:p-6 hover:border-neon-cyan/35 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neon-blue/5"
                >
                  <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br border flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${accent}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 sm:mt-12 max-w-3xl mx-auto text-center">
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                <strong className="text-slate-200">ItOfficerHub</strong> focuses on the IT Officer niche — sectional
                mocks, previous-year style papers, revision bucket, and{' '}
                <Link to="/ibps-so-it-officer" className="text-neon-cyan hover:underline">
                  syllabus, exam pattern &amp; cut-offs
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
