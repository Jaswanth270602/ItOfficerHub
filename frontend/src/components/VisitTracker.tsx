import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import api from '@/lib/api'

const SESSION_KEY = 'ioh_visit_session'

function getSessionKey(): string {
  try {
    let key = sessionStorage.getItem(SESSION_KEY)
    if (!key) {
      key = crypto.randomUUID()
      sessionStorage.setItem(SESSION_KEY, key)
    }
    return key
  } catch {
    return 'anon'
  }
}

/** Records public page views (IP captured server-side). Skips /admin routes. */
export function VisitTracker() {
  const location = useLocation()
  const lastSent = useRef('')

  useEffect(() => {
    const path = location.pathname
    if (path.startsWith('/admin')) return
    const key = path + location.search
    if (lastSent.current === key) return
    lastSent.current = key

    const query = location.search.startsWith('?') ? location.search.slice(1) : location.search

    api
      .post('/public/visits', {
        path,
        query: query || undefined,
        referer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
        sessionKey: getSessionKey(),
      })
      .catch(() => {
        /* non-blocking analytics */
      })
  }, [location.pathname, location.search])

  return null
}
