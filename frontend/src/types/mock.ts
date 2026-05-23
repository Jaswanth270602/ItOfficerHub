export interface MockExam {
  id: number
  title: string
  description: string
  difficulty: string
  questionCount: number
  timeLimitMinutes: number
  attemptsCount: number
  allowRetake: boolean
  showExamDate?: boolean
  publishedAt?: string
  featuredToday?: boolean
  attempted: boolean
  userAttemptCount: number
  bestNetScore: number | null
  latestAttemptId: number | null
  latestClearedCutoff: boolean
  topics?: string[]
  cumulative?: boolean
  mockCategory?: string
  examTarget?: string
  seriesDay?: number | null
  mockCode?: string | null
}

export function normalizeMock(m: MockExam & { attempted?: boolean }): MockExam {
  return {
    ...m,
    attempted: m.attempted ?? false,
    userAttemptCount: m.userAttemptCount ?? 0,
    bestNetScore: m.bestNetScore ?? null,
    latestAttemptId: m.latestAttemptId ?? null,
    latestClearedCutoff: m.latestClearedCutoff ?? false,
    featuredToday: m.featuredToday ?? false,
    topics: m.topics ?? [],
    cumulative: m.cumulative ?? false,
    mockCategory: m.mockCategory,
    examTarget: m.examTarget,
    seriesDay: m.seriesDay ?? null,
    mockCode: m.mockCode ?? null,
    showExamDate: m.showExamDate ?? false,
  }
}
