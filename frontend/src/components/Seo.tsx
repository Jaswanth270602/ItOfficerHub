import { useEffect } from 'react'
import { canonicalUrl, DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, fullTitle, SITE_NAME, SITE_URL, type SeoProps } from '@/lib/seo'

const DEFAULT_OG_IMAGE = `${SITE_URL}/og-cover.svg`

function upsertMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.content = content
}

function upsertLink(rel: string, href: string) {
  if (!href) return
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

function upsertJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  const id = 'seo-jsonld'
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(Array.isArray(data) ? data : data)
}

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const pageTitle = fullTitle(title)
    const url = canonicalUrl(path)

    document.title = pageTitle

    upsertMeta('description', description)
    upsertMeta('keywords', keywords)
    upsertMeta('author', SITE_NAME)
    upsertMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    upsertMeta('googlebot', noindex ? 'noindex, nofollow' : 'index, follow')
    upsertMeta('application-name', SITE_NAME)
    upsertMeta('theme-color', '#3b82f6')

    upsertLink('canonical', url)

    upsertMeta('og:title', pageTitle, 'property')
    upsertMeta('og:description', description, 'property')
    upsertMeta('og:url', url, 'property')
    upsertMeta('og:type', type, 'property')
    upsertMeta('og:site_name', SITE_NAME, 'property')
    upsertMeta('og:locale', 'en_IN', 'property')
    upsertMeta('og:image', image, 'property')
    upsertMeta('og:image:alt', `${SITE_NAME} — IBPS SO IT Officer & TCS NQT mock tests`, 'property')

    upsertMeta('twitter:card', 'summary_large_image')
    upsertMeta('twitter:title', pageTitle)
    upsertMeta('twitter:description', description)
    upsertMeta('twitter:image', image)

    const baseGraph = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        alternateName: ['IT Officer Hub', 'ItOfficerHub', 'It Officer Hub'],
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        inLanguage: 'en-IN',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/mocks?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.svg`,
        description: DEFAULT_DESCRIPTION,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: SITE_NAME,
        url: SITE_URL,
        description: 'Free online mock tests for IBPS SO IT Officer, PSU IT exams, and TCS NQT aptitude preparation.',
        areaServed: 'IN',
      },
    ]

    const extra = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []
    upsertJsonLd([...baseGraph, ...extra])
  }, [title, description, keywords, path, image, type, noindex, JSON.stringify(jsonLd)])

  return null
}
