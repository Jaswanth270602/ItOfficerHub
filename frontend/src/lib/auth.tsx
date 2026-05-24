import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import api from './api'
import { applyAuthToken, persistUser, resetClientSession } from './authStorage'
import { markWelcomeSeen } from './communityModals'

export interface AuthUser {
  userId: number
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  sessionReady: boolean
  refreshSession: () => Promise<AuthUser | null>
  login: (email: string, password: string, admin?: boolean) => Promise<AuthUser>
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

function readStoredUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem('user')
    if (stored) return JSON.parse(stored) as AuthUser
  } catch {
    /* corrupt */
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
  const [sessionReady, setSessionReady] = useState(false)
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const [goodbyeOpen, setGoodbyeOpen] = useState(false)

  const applyTokenToApi = useCallback((t: string | null) => {
    if (t) api.defaults.headers.common.Authorization = `Bearer ${t}`
    else delete api.defaults.headers.common.Authorization
  }, [])

  const clearSession = useCallback(() => {
    resetClientSession()
    applyTokenToApi(null)
    setToken(null)
    setUser(null)
    setSessionReady(true)
  }, [applyTokenToApi])

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

  const saveAuth = useCallback(
    (data: { token: string; userId: number; email: string; name: string; role: string }) => {
      applyAuthToken(data.token)
      applyTokenToApi(data.token)
      const u: AuthUser = { userId: data.userId, email: data.email, name: data.name, role: data.role }
      persistUser(u)
      setToken(data.token)
      setUser(u)
    },
    [applyTokenToApi]
  )

  const refreshSession = useCallback(async (): Promise<AuthUser | null> => {
    const t = localStorage.getItem('token')
    if (!t) {
      setSessionReady(true)
      return null
    }
    applyAuthToken(t)
    applyTokenToApi(t)
    try {
      const { data } = await api.get<AuthUser>('/auth/session')
      const u: AuthUser = { userId: data.userId, email: data.email, name: data.name, role: data.role }
      persistUser(u)
      setUser(u)
      setToken(t)
      setSessionReady(true)
      return u
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401 || status === 403) {
        clearSession()
      }
      setSessionReady(true)
      return null
    }
  }, [clearSession, applyTokenToApi])

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (t) applyTokenToApi(t)
    if (token) void refreshSession()
    else setSessionReady(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- once on mount

  const login = async (email: string, password: string, admin = false): Promise<AuthUser> => {
    resetClientSession()
    setToken(null)
    setUser(null)

    const endpoint = admin ? '/auth/admin/login' : '/auth/login'
    const { data } = await api.post<{
      token: string
      userId: number
      email: string
      name: string
      role: string
    }>(endpoint, { email: email.trim(), password })

    if (admin && data.role !== 'ADMIN') {
      resetClientSession()
      throw new Error('This account is not an administrator. Check the email in your users table.')
    }

    saveAuth(data)
    const fresh = await refreshSession()
    if (!fresh) {
      throw new Error('Login succeeded but session could not be verified. Try again.')
    }
    if (admin && fresh.role !== 'ADMIN') {
      resetClientSession()
      setToken(null)
      setUser(null)
      throw new Error('Server reports non-admin role for this account.')
    }
    return fresh
  }

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    extras?: { anonymousAlias?: string; bio?: string; avatarEmoji?: string; website?: string }
  ) => {
    resetClientSession()
    setToken(null)
    setUser(null)

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
    await refreshSession()
    setWelcomeOpen(true)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        sessionReady,
        refreshSession,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
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

export function useAdminAccess() {
  const { user, sessionReady, refreshSession } = useAuth()
  return {
    isAdmin: user?.role === 'ADMIN',
    sessionReady,
    refreshSession,
    userEmail: user?.email,
  }
}
