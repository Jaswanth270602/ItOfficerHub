const WELCOME_KEY = 'itoh_show_welcome'
const GOODBYE_KEY = 'itoh_show_goodbye'

export function markShowWelcome() {
  try {
    sessionStorage.setItem(WELCOME_KEY, '1')
  } catch {
    /* private mode */
  }
}

export function consumeShowWelcome(): boolean {
  try {
    if (sessionStorage.getItem(WELCOME_KEY) !== '1') return false
    sessionStorage.removeItem(WELCOME_KEY)
    return true
  } catch {
    return false
  }
}

export function markShowGoodbye() {
  try {
    sessionStorage.setItem(GOODBYE_KEY, '1')
  } catch {
    /* private mode */
  }
}

export function consumeShowGoodbye(): boolean {
  try {
    if (sessionStorage.getItem(GOODBYE_KEY) !== '1') return false
    sessionStorage.removeItem(GOODBYE_KEY)
    return true
  } catch {
    return false
  }
}

export function welcomeSeenKey(userId: number) {
  return `itoh_welcome_seen_${userId}`
}

export function hasSeenWelcome(userId: number): boolean {
  try {
    return localStorage.getItem(welcomeSeenKey(userId)) === '1'
  } catch {
    return false
  }
}

export function markWelcomeSeen(userId: number) {
  try {
    localStorage.setItem(welcomeSeenKey(userId), '1')
  } catch {
    /* ignore */
  }
}
