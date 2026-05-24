/** Base64-encode JSON so Cloudflare/WAF does not block SQL/XSS-like quiz text in POST bodies. */

export function encodeImportBody<T>(data: T): { payload: string } {
  const json = JSON.stringify(data)
  return { payload: btoa(unescape(encodeURIComponent(json))) }
}

export function isWafBlockedResponse(err: unknown): boolean {
  const ax = err as { response?: { status?: number; data?: unknown; headers?: Record<string, string> } }
  if (ax.response?.status !== 403) return false
  const data = ax.response.data
  if (typeof data === 'string') {
    return /web application firewall|firewall \(waf\)|request was blocked/i.test(data)
  }
  if (data && typeof data === 'object' && 'error' in (data as object)) {
    return false
  }
  const ct = ax.response.headers?.['content-type'] ?? ''
  return ct.includes('text/html')
}

export const WAF_IMPORT_HINT =
  'Your host firewall (e.g. Cloudflare) blocked the upload because quiz text looks like SQL/code. The app now sends an encoded payload — redeploy backend + frontend. If it still fails, add a Cloudflare WAF skip rule for POST /api/admin/mocks/import-safe (see DEPLOY.md).'
