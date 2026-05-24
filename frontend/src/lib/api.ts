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
    response?: { status?: number; data?: { message?: string; error?: string } | string }
    message?: string
  }
  const raw = ax.response?.data
  if (typeof raw === 'string') {
    if (/web application firewall|firewall \(waf\)|request was blocked/i.test(raw)) {
      const id = raw.match(/Request ID:\s*([a-f0-9]+)/i)?.[1]
      return id
        ? `Blocked by site firewall (WAF), not the app. Request ID: ${id}. Redeploy latest code or add a Cloudflare exception for admin import (see DEPLOY.md).`
        : 'Blocked by site firewall (WAF), not the app. Redeploy latest code or adjust Cloudflare rules for /api/admin/mocks/import-safe.'
    }
    if (raw.length < 500) return raw
  }
  const body =
    raw && typeof raw === 'object'
      ? (raw as { error?: string; message?: string }).error || (raw as { message?: string }).message
      : undefined
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
