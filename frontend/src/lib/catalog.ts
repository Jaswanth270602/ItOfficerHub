export const MOCK_CATEGORY_LABELS: Record<string, string> = {
  FULL: 'Full mock',
  SECTIONAL: 'Sectional',
  PYQ: 'Previous year',
  CHALLENGE: '30-day plan',
}

export const EXAM_TARGET_LABELS: Record<string, string> = {
  IBPS_SO_IT: 'IBPS SO IT',
  NIACL_IT: 'NIACL IT',
  LIC_IT: 'LIC IT',
  GIC_IT: 'GIC IT',
  RBI_IT: 'RBI IT',
  PSU_IT_GENERAL: 'PSU IT',
  MIXED: 'Mixed PSU',
  TCS_NQT: 'TCS NQT',
}

export const TCS_NQT_TARGET = 'TCS_NQT'

export type ExamTrack = 'it' | 'tcs'

export function matchesTrack(examTarget: string | undefined, track: ExamTrack): boolean {
  if (track === 'tcs') return examTarget === TCS_NQT_TARGET
  return examTarget !== TCS_NQT_TARGET
}

export type MockCategoryFilter = 'ALL' | 'FULL' | 'SECTIONAL' | 'PYQ' | 'CHALLENGE'
export type ExamTargetFilter = 'ALL' | string

export function matchesCategoryFilter(mockCategory: string | undefined, filter: MockCategoryFilter): boolean {
  if (filter === 'ALL') return true
  return mockCategory === filter
}

export function matchesExamFilter(examTarget: string | undefined, filter: ExamTargetFilter): boolean {
  if (filter === 'ALL') return true
  return examTarget === filter
}
