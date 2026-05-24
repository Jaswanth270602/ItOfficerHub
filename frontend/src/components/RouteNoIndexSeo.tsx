import { useLocation } from 'react-router-dom'
import { Seo } from '@/components/Seo'

const NOINDEX_PATTERNS = [
  /^\/login\/?$/,
  /^\/register\/?$/,
  /^\/mock\//,
  /^\/result\//,
  /^\/history\/?$/,
  /^\/revision\/?$/,
  /^\/community/,
  /^\/admin/,
]

/** noindex for auth, exam-in-progress, and account-only routes — does not change routing or APIs. */
export function RouteNoIndexSeo() {
  const { pathname } = useLocation()
  const blocked = NOINDEX_PATTERNS.some((re) => re.test(pathname))
  if (!blocked) return null
  return <Seo path={pathname} title="ItOfficerHub" noindex />
}
