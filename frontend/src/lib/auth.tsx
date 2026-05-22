import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from './api'

interface User {
  userId: number
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string, admin?: boolean) => Promise<void>
  register: (name: string, email: string, password: string, extras?: { anonymousAlias?: string; bio?: string; avatarEmoji?: string }) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored && token) setUser(JSON.parse(stored))
  }, [token])

  const saveAuth = (data: { token: string; userId: number; email: string; name: string; role: string }) => {
    localStorage.setItem('token', data.token)
    const u = { userId: data.userId, email: data.email, name: data.name, role: data.role }
    localStorage.setItem('user', JSON.stringify(u))
    setToken(data.token)
    setUser(u)
  }

  const login = async (email: string, password: string, admin = false) => {
    const endpoint = admin ? '/auth/admin/login' : '/auth/login'
    const { data } = await api.post(endpoint, { email, password })
    saveAuth(data)
  }

  const register = async (name: string, email: string, password: string, extras?: { anonymousAlias?: string; bio?: string; avatarEmoji?: string }) => {
    const { data } = await api.post('/auth/register', { name, email, password, ...extras })
    saveAuth(data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
