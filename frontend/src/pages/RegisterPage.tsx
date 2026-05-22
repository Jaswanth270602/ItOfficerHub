import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [alias, setAlias] = useState('')
  const [bio, setBio] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(name, email, password, {
        anonymousAlias: alias || undefined,
        bio: bio || undefined,
        avatarEmoji: emoji,
      })
      navigate(redirect)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Create free account</CardTitle>
          <CardDescription>Required to attempt mocks and get percentile rank</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <Label>Fun anonymous name (optional)</Label>
              <Input placeholder="ITNinja_99" value={alias} onChange={(e) => setAlias(e.target.value)} />
            </div>
            <div>
              <Label>Avatar emoji</Label>
              <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} />
            </div>
            <div>
              <Label>Short bio</Label>
              <Input placeholder="Aspiring IBPS SO IT Officer..." value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading ? 'Creating...' : 'Sign Up & Continue'}
            </Button>
          </form>
          <p className="text-sm text-slate-400 mt-4 text-center">
            Already have an account?{' '}
            <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-neon-blue hover:underline cursor-pointer">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
