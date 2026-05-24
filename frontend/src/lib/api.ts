import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL?.trim() || '/api'

const api = axios.create({ baseURL, timeout: 60000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = String(error?.config?.url ?? '')
    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      window.dispatchEvent(new Event('auth:session-expired'))
    }
    return Promise.reject(error)
  }
)

export function apiErrorMessage(err: unknown, fallback = 'Request failed'): string {
  const ax = err as {
    response?: { status?: number; data?: { message?: string; error?: string } }
    message?: string
  }
  const body = ax.response?.data?.message || ax.response?.data?.error
  if (body) return body

  const status = ax.response?.status
  if (status === 403) {
    return 'Access denied (403). Log in at /admin with your admin account — a regular student login cannot import mocks.'
  }
  if (status === 413) {
    return 'Payload too large. Try fewer questions per import or shorter explanations.'
  }
  if (status === 429) {
    return 'Too many requests — wait a minute and try again.'
  }
  if (status === 401) {
    return 'Session expired — log in again at /admin.'
  }

  const msg = ax.message || ''
  if (msg.includes('status code 403')) {
    return 'Access denied (403). Use /admin login with an admin account.'
  }
  if (msg.includes('status code 413')) {
    return 'Payload too large — reduce JSON size or split into smaller imports.'
  }

  return msg || fallback
}

export default api
