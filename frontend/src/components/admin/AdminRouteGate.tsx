import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

/** Blocks admin pages until server confirms ADMIN role (not stale localStorage). */
export function AdminRouteGate({ children }: { children: React.ReactNode }) {
  const { token, refreshSession } = useAuth()
  const [state, setState] = useState<'loading' | 'ok' | 'denied' | 'login'>('loading')

  useEffect(() => {
    if (!token) {
      setState('login')
      return
    }
    let cancelled = false
    refreshSession().then((u) => {
      if (cancelled) return
      if (!u) setState('login')
      else if (u.role === 'ADMIN') setState('ok')
      else setState('denied')
    })
    return () => {
      cancelled = true
    }
  }, [token, refreshSession])

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-950 text-slate-400 text-sm">
        Verifying admin access…
      </div>
    )
  }
  if (state === 'login' || state === 'denied') {
    return <Navigate to="/admin" replace state={state === 'denied' ? { adminDenied: true } : undefined} />
  }
  return <>{children}</>
}
