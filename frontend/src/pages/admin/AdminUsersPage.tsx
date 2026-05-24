import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { toast } from '@/components/ui/toast'
import { ChangePasswordCard } from '@/components/ChangePasswordCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, KeyRound, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserRow {
  id: number
  email: string
  phone: string | null
  name: string
  role: string
  createdAt: string
  prepPoints: number
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [roleFilter, setRoleFilter] = useState<'USER' | 'ADMIN' | 'ALL'>('USER')
  const [search, setSearch] = useState('')
  const [resetFor, setResetFor] = useState<UserRow | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetting, setResetting] = useState(false)

  const load = () => {
    api.get('/admin/users', { params: { role: roleFilter } }).then((r) => setUsers(r.data))
  }

  useEffect(() => { load() }, [roleFilter])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q)
        || (u.phone?.includes(q) ?? false)
    )
  }, [users, search])

  const submitReset = async () => {
    if (!resetFor) return
    if (newPassword.length < 6) {
      toast.warning('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.warning('Passwords do not match')
      return
    }
    if (!(await toast.confirm(`Reset password for ${resetFor.name}? They will need the new password to log in.`))) {
      return
    }
    setResetting(true)
    try {
      await api.put(`/admin/users/${resetFor.id}/password`, { newPassword })
      toast.success(`Password reset for ${resetFor.name}`)
      setResetFor(null)
      setNewPassword('')
      setConfirmPassword('')
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Reset failed'))
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 pb-12">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-neon-cyan mb-4">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <h1 className="text-2xl font-bold mb-2">Users &amp; passwords</h1>
      <p className="text-sm text-slate-400 mb-8">
        Passwords are hashed — you cannot view them, only set a new one for a user.
      </p>

      <ChangePasswordCard
        className="mb-8 max-w-lg"
        title="Your admin password"
        description="Change your own admin login password below."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="search"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cyber-700 bg-cyber-900/60 text-sm text-white focus:outline-none focus:border-neon-cyan/40"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          className="rounded-lg border border-cyber-700 bg-cyber-900 px-3 py-2 text-sm text-white"
        >
          <option value="USER">Students</option>
          <option value="ADMIN">Admins</option>
          <option value="ALL">All accounts</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((u) => (
          <Card key={u.id}>
            <CardContent className="py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="min-w-0">
                <p className="font-medium text-white">{u.name}</p>
                <p className="text-sm text-slate-400 truncate">{u.email}{u.phone ? ` · ${u.phone}` : ''}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  <span className={cn('uppercase', u.role === 'ADMIN' ? 'text-violet-300' : 'text-slate-500')}>{u.role}</span>
                  {' · '}{u.prepPoints} pts · joined {new Date(u.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer gap-1.5 shrink-0"
                onClick={() => {
                  setResetFor(u)
                  setNewPassword('')
                  setConfirmPassword('')
                }}
              >
                <KeyRound className="h-4 w-4" /> Reset password
              </Button>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-10">No users match your filters.</p>
        )}
      </div>

      <Dialog open={!!resetFor} onOpenChange={(o) => !o && setResetFor(null)}>
        <DialogContent className="border-cyber-600 bg-cyber-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset password — {resetFor?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">{resetFor?.email}</p>
          <div className="space-y-3 pt-2">
            <div>
              <Label>New password</Label>
              <Input type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <Label>Confirm password</Label>
              <Input type="password" minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" className="cursor-pointer" onClick={() => setResetFor(null)}>Cancel</Button>
              <Button className="cursor-pointer" disabled={resetting} onClick={() => void submitReset()}>
                {resetting ? 'Saving…' : 'Set new password'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
