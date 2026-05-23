/** Public marketing domain — always use for copy/share links (not Render host). */
export const CANONICAL_SITE = 'https://itofficerhub.in'

/** Base URL for share/copy buttons. Prefers itofficerhub.in over Render or localhost. */
export function shareBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase()
    if (host === 'itofficerhub.in' || host === 'www.itofficerhub.in') {
      return window.location.origin.replace(/\/$/, '')
    }
  }
  const env = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')
  if (env && env.includes('itofficerhub.in')) return env
  return CANONICAL_SITE
}

export function shareSitePath(path = '/'): string {
  const base = shareBaseUrl()
  if (path === '/' || path === '') return `${base}/`
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
