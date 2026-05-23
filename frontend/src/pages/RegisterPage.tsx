import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Seo } from '@/components/Seo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Lock, Mail, Phone, ShieldCheck, Sparkles, User } from 'lucide-react'

const EMOJI_PICKS = ['🎯', '💻', '🚀', '📚', '⚡', '🏆', '🔥', '✨']

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [alias, setAlias] = useState('')
  const [bio, setBio] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [website, setWebsite] = useState('')
  const [showExtras, setShowExtras] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const digits = phoneDigits.replace(/\D/g, '')
    if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
      setError('Enter a valid 10-digit Indian mobile number')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(name, email, `+91${digits}`, password, {
        anonymousAlias: alias || undefined,
        bio: bio || undefined,
        avatarEmoji: emoji,
        website,
      })
      navigate(redirect)
    } catch (err: unknown) {
      const res = (err as { response?: { status?: number; data?: { error?: string } } })?.response
      if (res?.status === 429) {
        setError('Too many attempts. Please wait a minute and try again.')
      } else {
        setError(res?.data?.error || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'mt-1.5 h-11 sm:h-12 bg-cyber-900/80 border-cyber-600 focus-visible:ring-neon-cyan/40 text-base'

  return (
    <>
      <Seo
        path="/register"
        title="Sign up free — IBPS SO IT Officer mocks"
        description="Create your free ItOfficerHub account with email and mobile. Daily mocks, All-India rank, topic-wise practice."
      />
      <div className="min-h-[calc(100dvh-8rem)] flex items-center justify-center px-3 sm:px-6 py-10 sm:py-14">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-6 sm:mb-8">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neon-cyan mb-3">
              <Sparkles className="h-3.5 w-3.5" /> 100% free · No spam
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Join ItOfficerHub</h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-lg mx-auto">
              One account for daily mocks, topic-wise study, rank &amp; solutions — built for bank IT Officer aspirants.
            </p>
          </div>

          <Card className="border-neon-cyan/25 bg-gradient-to-b from-cyber-900/90 to-cyber-950 shadow-xl shadow-neon-cyan/5 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-purple" />
            <CardHeader className="pb-4 sm:pb-6 px-5 sm:px-8 pt-6 sm:pt-8">
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
                Create your account
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Email &amp; mobile help us secure your account and recover access. We never sell your data.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 sm:px-8 pb-8 sm:pb-10">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Honeypot — hidden from users */}
                <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden tabIndex={-1}>
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <Label htmlFor="name" className="text-slate-300 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-500" /> Full name
                    </Label>
                    <Input
                      id="name"
                      className={inputClass}
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-slate-300 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-500" /> Mobile number
                    </Label>
                    <div className="flex mt-1.5 gap-2">
                      <span className="flex items-center justify-center h-11 sm:h-12 px-3 rounded-lg border border-cyber-600 bg-cyber-800 text-slate-300 text-sm font-medium shrink-0">
                        +91
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        className={cn(inputClass, 'mt-0 flex-1')}
                        placeholder="9876543210"
                        value={phoneDigits}
                        onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        required
                        autoComplete="tel-national"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-slate-300 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-500" /> Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className={inputClass}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <Label htmlFor="password" className="text-slate-300 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-slate-500" /> Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      className={inputClass}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-slate-300">
                      Confirm password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className={inputClass}
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="text-sm text-neon-cyan hover:underline cursor-pointer"
                  onClick={() => setShowExtras(!showExtras)}
                >
                  {showExtras ? '− Hide' : '+'} Optional: leaderboard nickname &amp; bio
                </button>

                {showExtras && (
                  <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl border border-cyber-700/80 bg-cyber-900/40 space-y-4 sm:space-y-0">
                    <div>
                      <Label>Anonymous name (leaderboard)</Label>
                      <Input
                        className={cn(inputClass, 'mt-1.5')}
                        placeholder="ITNinja_99"
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Avatar emoji</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {EMOJI_PICKS.map((e) => (
                          <button
                            key={e}
                            type="button"
                            className={cn(
                              'h-10 w-10 rounded-lg border text-lg cursor-pointer transition-colors',
                              emoji === e
                                ? 'border-neon-cyan bg-neon-cyan/15'
                                : 'border-cyber-600 hover:border-slate-500'
                            )}
                            onClick={() => setEmoji(e)}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Short bio</Label>
                      <Input
                        className={cn(inputClass, 'mt-1.5')}
                        placeholder="Preparing for IBPS SO IT Officer..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-red-400 text-sm bg-red-950/30 border border-red-800/50 rounded-lg px-4 py-3">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full cursor-pointer min-h-[48px] text-base bg-gradient-to-r from-neon-blue to-neon-purple hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Sign up free & continue'}
                </Button>

                <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                  By signing up you agree to fair exam conduct (no tab switching during mocks). Contact details are used
                  only for account security and important updates.
                </p>
              </form>

              <p className="text-sm text-slate-400 mt-6 text-center">
                Already have an account?{' '}
                <Link
                  to={`/login?redirect=${encodeURIComponent(redirect)}`}
                  className="text-neon-cyan hover:underline cursor-pointer font-medium"
                >
                  Log in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
