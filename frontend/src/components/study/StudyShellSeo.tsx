import { useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { Seo } from '@/components/Seo'
import { buildStudySeoFromPath } from '@/lib/studySeo'

/** Per-route Study Q&A meta — uses static catalog so crawlers get titles without waiting on API. */
export function StudyShellSeo() {
  const { pathname } = useLocation()
  const props = useMemo(() => buildStudySeoFromPath(pathname), [pathname])
  return <Seo {...props} />
}
