import { shareBaseUrl, shareSitePath } from '@/lib/siteUrl'

export function siteShareUrl(): string {
  return shareSitePath('/')
}

export function siteShareText(): string {
  const url = siteShareUrl()
  return `🎯 Free IBPS SO IT Officer mock tests on ItOfficerHub — daily mocks, All-India rank, detailed solutions. 100% free, no ads.\n\nJoin: ${url}`
}

export function whatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function telegramShareUrl(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
}

export async function copySiteLink(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(siteShareUrl())
    return true
  } catch {
    return false
  }
}

// Re-export for components that need the base
export { shareBaseUrl }
