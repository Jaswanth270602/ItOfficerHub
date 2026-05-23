import { shareSitePath } from '@/lib/siteUrl'

export function mockShareUrl(mockId: number): string {
  return shareSitePath(`/mock/${mockId}`)
}

export function mockShareText(mockTitle: string, mockId: number): string {
  const url = mockShareUrl(mockId)
  return `🎯 Free IBPS SO IT Officer mock on ItOfficerHub\n\n${mockTitle}\n\nTake the test: ${url}`
}

export function whatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function telegramShareUrl(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
}

export async function copyMockLink(mockId: number): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(mockShareUrl(mockId))
    return true
  } catch {
    return false
  }
}
