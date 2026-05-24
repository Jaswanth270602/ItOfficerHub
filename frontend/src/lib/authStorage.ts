/** Wipe auth-related client storage so a new login never reuses an old JWT or role. */

export function resetClientSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  try {
    sessionStorage.removeItem('ioh_visit_session')
  } catch {
    /* private mode */
  }
}

export function applyAuthToken(token: string) {
  localStorage.setItem('token', token)
}

export function persistUser(user: { userId: number; email: string; name: string; role: string }) {
  localStorage.setItem('user', JSON.stringify(user))
}
