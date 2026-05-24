const SPLASH_DATE_KEY = 'itoh_landing_splash_date'

function localDateKey(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function shouldShowLandingSplash(): boolean {
  try {
    return localStorage.getItem(SPLASH_DATE_KEY) !== localDateKey()
  } catch {
    return true
  }
}

export function markLandingSplashSeen(): void {
  try {
    localStorage.setItem(SPLASH_DATE_KEY, localDateKey())
  } catch {
    /* private mode */
  }
}

export const LANDING_SPLASH_MS = 4000
