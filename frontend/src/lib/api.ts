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
  const ax = err as { response?: { data?: { message?: string; error?: string } }; message?: string }
  return ax.response?.data?.message || ax.response?.data?.error || ax.message || fallback
}

export default api
