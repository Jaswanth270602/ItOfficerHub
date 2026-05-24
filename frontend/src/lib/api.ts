import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL?.trim() || '/api'

const api = axios.create({ baseURL, timeout: 60000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    delete config.headers.Authorization
  }
  return config
})

function isAdminApiUrl(url: string): boolean {
  return url.includes('/admin/')
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = String(error?.config?.url ?? '')

    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      window.dispatchEvent(new Event('auth:session-expired'))
    }

    if (status === 403 && isAdminApiUrl(url)) {
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
  const body = ax.response?.data?.error || ax.response?.data?.message
  if (body) return body

  const status = ax.response?.status
  if (status === 403) {
    return 'Access denied — your session is not an admin. Log out, open /admin, and sign in with the administrator email from your database.'
  }
  if (status === 401) {
    return 'Session expired or invalid — please log in again.'
  }
  if (status === 413) {
    return 'Payload too large. Try fewer questions per import or shorter explanations.'
  }
  if (status === 429) {
    return 'Too many requests — wait a minute and try again.'
  }

  return ax.message || fallback
}

export default api
