import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'
import { Seo } from '@/components/Seo'

export function AdminLoginPage() {
  const [email, setEmail] = useState('admin@itofficerhub.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    logout(false)
  }, [logout])

  useEffect(() => {
    const denied = (location.state as { adminDenied?: boolean } | null)?.adminDenied
    if (denied) {
      setError('That account is not an admin on the server. Use the exact administrator email from your database.')
    }
  }, [location.state])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password, true)
      navigate('/admin/dashboard', { replace: true })
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } }; message?: string }
      setError(ax.response?.data?.error || ax.message || 'Admin login failed')
    }
  }

  return (
    <>
      <Seo title="Admin" path="/admin" noindex />
    <div className="min-h-screen flex items-center justify-center px-4 bg-cyber-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-neon-purple" /> Admin Login
          </CardTitle>
          <CardDescription>ItOfficerHub content management</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full">Login as Admin</Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
  )
}
