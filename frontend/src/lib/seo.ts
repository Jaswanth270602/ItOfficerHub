/** Canonical site URL — set VITE_SITE_URL at build time (e.g. https://itofficerhub.in) */
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')
  || 'https://itofficerhub.in'

export const SITE_NAME = 'ItOfficerHub'
export const SITE_TAGLINE = 'Free IBPS SO IT Officer, PSU IT & TCS NQT Mock Tests'

export const DEFAULT_DESCRIPTION =
  'ItOfficerHub — free mock tests for IBPS SO IT Officer, PSU IT Officer, NIACL/LIC/GIC IT, and TCS NQT aptitude (quant, reasoning, verbal). All-India rank, cutoff, solutions. 100% free.'

export const DEFAULT_KEYWORDS = [
  'ItOfficerHub',
  'IT Officer Hub',
  'it officer hub',
  'IBPS SO IT Officer',
  'IBPS IT Officer mock test',
  'IBPS Specialist Officer IT',
  'PSU IT Officer',
  'bank IT officer preparation',
  'NIACL IT Officer',
  'LIC IT Officer',
  'RBI IT Officer',
  'TCS NQT',
  'TCS NQT mock test',
  'TCS National Qualifier Test',
  'aptitude mock test',
  'quantitative aptitude practice',
  'logical reasoning mock',
  'verbal ability test',
  'campus placement aptitude',
  'free mock test IT officer',
  'computer networks mock',
  'DBMS mock test',
  'operating system MCQ',
  'IT officer professional knowledge',
].join(', ')

export interface SeoProps {
  title?: string
  description?: string
  keywords?: string
  path?: string
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

export function fullTitle(pageTitle?: string): string {
  if (!pageTitle) return `${SITE_NAME} — ${SITE_TAGLINE}`
  return `${pageTitle} | ${SITE_NAME}`
}

export function canonicalUrl(path = '/'): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${p === '/' ? '' : p}`
}
