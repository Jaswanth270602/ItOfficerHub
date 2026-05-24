/** Mirrors backend MockCodeService — for UI preview when API is unavailable. */

const PREFIX: Record<string, string> = {
  IBPS_SO_IT: 'IBPS',
  TCS_NQT: 'TCS',
  NIACL_IT: 'NIACL',
  LIC_IT: 'LIC',
  GIC_IT: 'GIC',
  RBI_IT: 'RBI',
  PSU_IT_GENERAL: 'PSU',
  MIXED: 'MIX',
}

export function mockCodePrefix(examTarget: string): string {
  return PREFIX[examTarget] ?? 'MIX'
}

export function formatMockCode(examTarget: string, sequence: number): string {
  return `${mockCodePrefix(examTarget)}-${String(sequence).padStart(3, '0')}`
}

/** Next code from mock count for an exam target (same logic as server preview). */
export function estimateNextMockCode(examTarget: string, mocksForTarget: number): string {
  return formatMockCode(examTarget, mocksForTarget + 1)
}
