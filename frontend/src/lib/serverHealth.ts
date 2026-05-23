const WARM_SESSION_KEY = 'itoh_server_ready'

/** Always same-origin — works on itofficerhub.in and Render URL alike. */
export function healthCheckUrl(): string {
  return new URL('/health', window.location.origin).href
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

const PING_TIMEOUT_MS = 8_000
const RETRY_DELAY_MS = 2_000
const MAX_WAIT_MS = 90_000

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
    return text.includes('UP')
  } catch {
    return false
  } finally {
    window.clearTimeout(timeout)
    signal?.removeEventListener('abort', onAbort)
  }
}

/** Retry until success, abort, or max wait. */
export async function waitForServer(signal: AbortSignal): Promise<boolean> {
  const deadline = Date.now() + MAX_WAIT_MS
  while (!signal.aborted && Date.now() < deadline) {
    if (await pingHealth(signal)) return true
    await new Promise((r) => window.setTimeout(r, RETRY_DELAY_MS))
  }
  return false
}

export const WARMUP_SLOW_UI_MS = 4_000
export const WARMUP_TARGET_SEC = 30
