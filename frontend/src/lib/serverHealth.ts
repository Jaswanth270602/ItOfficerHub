const WARM_SESSION_KEY = 'itoh_server_ready'

/** Same-origin `/health` in production; derived from VITE_API_URL when set. */
export function healthCheckUrl(): string {
  const api = import.meta.env.VITE_API_URL?.trim()
  if (api) {
    try {
      const u = new URL(api, window.location.origin)
      return `${u.origin}/health`
    } catch {
      /* fall through */
    }
  }
  return `${window.location.origin}/health`
}

export function isServerWarmInSession(): boolean {
  try {
    return sessionStorage.getItem(WARM_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export function markServerWarmInSession(): void {
  try {
    sessionStorage.setItem(WARM_SESSION_KEY, '1')
  } catch {
    /* private mode */
  }
}

const PING_TIMEOUT_MS = 12_000
const RETRY_DELAY_MS = 2_500

export async function pingHealth(signal?: AbortSignal): Promise<boolean> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), PING_TIMEOUT_MS)

  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)

  try {
    const res = await fetch(healthCheckUrl(), {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!res.ok) return false
    const text = (await res.text()).trim()
    return text === 'UP' || res.ok
  } catch {
    return false
  } finally {
    window.clearTimeout(timeout)
    signal?.removeEventListener('abort', onAbort)
  }
}

/** Retry until success or outer abort. */
export async function waitForServer(signal: AbortSignal): Promise<boolean> {
  while (!signal.aborted) {
    if (await pingHealth(signal)) return true
    await new Promise((r) => window.setTimeout(r, RETRY_DELAY_MS))
  }
  return false
}

export const WARMUP_SLOW_UI_MS = 4_000
export const WARMUP_TARGET_SEC = 30
