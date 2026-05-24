import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import api from './api'
import { markWelcomeSeen } from './communityModals'

interface User {
  userId: number
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  /** Reload role from server (fixes admin UI when localStorage is stale). */
  refreshSession: () => Promise<User | null>
  login: (email: string, password: string, admin?: boolean) => Promise<void>
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
    extras?: { anonymousAlias?: string; bio?: string; avatarEmoji?: string; website?: string }
  ) => Promise<void>
  logout: (showGoodbye?: boolean) => void
  isAuthenticated: boolean
  welcomeOpen: boolean
  goodbyeOpen: boolean
  dismissWelcome: () => void
  dismissGoodbye: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function readStoredUser(token: string | null): User | null {
  if (!token) return null
  try {
    const stored = localStorage.getItem('user')
    if (stored) return JSON.parse(stored) as User
  } catch {
    /* ignore corrupt storage */
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(() => readStoredUser(localStorage.getItem('token')))
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const [goodbyeOpen, setGoodbyeOpen] = useState(false)

  const clearSession = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const dismissWelcome = useCallback(() => {
    setWelcomeOpen(false)
    if (user?.userId) markWelcomeSeen(user.userId)
  }, [user?.userId])

  const dismissGoodbye = useCallback(() => {
    setGoodbyeOpen(false)
  }, [])

  const logout = useCallback(
    (showGoodbye = true) => {
      if (showGoodbye) setGoodbyeOpen(true)
      clearSession()
    },
    [clearSession]
  )

  useEffect(() => {
    const onSessionExpired = () => logout(false)
    window.addEventListener('auth:session-expired', onSessionExpired)
    return () => window.removeEventListener('auth:session-expired', onSessionExpired)
  }, [logout])

  const saveAuth = (data: { token: string; userId: number; email: string; name: string; role: string }) => {
    localStorage.setItem('token', data.token)
    const u = { userId: data.userId, email: data.email, name: data.name, role: data.role }
    localStorage.setItem('user', JSON.stringify(u))
    setToken(data.token)
    setUser(u)
  }

  const refreshSession = useCallback(async (): Promise<User | null> => {
    const t = localStorage.getItem('token')
    if (!t) return null
    try {
      const { data } = await api.get<{ userId: number; email: string; name: string; role: string }>('/auth/session')
      const u: User = { userId: data.userId, email: data.email, name: data.name, role: data.role }
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
      return u
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    if (token) void refreshSession()
  }, [token, refreshSession])

  const login = async (email: string, password: string, admin = false) => {
    const endpoint = admin ? '/auth/admin/login' : '/auth/login'
    const { data } = await api.post(endpoint, { email, password })
    saveAuth(data)
    await refreshSession()
  }

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    extras?: { anonymousAlias?: string; bio?: string; avatarEmoji?: string; website?: string }
  ) => {
    const { website, ...rest } = extras ?? {}
    const { data } = await api.post('/auth/register', {
      name,
      email,
      phone,
      password,
      website: website ?? '',
      ...rest,
    })
    saveAuth(data)
    setWelcomeOpen(true)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshSession,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        welcomeOpen,
        goodbyeOpen,
        dismissWelcome,
        dismissGoodbye,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
