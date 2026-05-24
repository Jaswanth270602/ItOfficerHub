/** Section icons for sidebar (lucide names mapped in component) */
export const SECTION_ICONS: Record<string, string> = {
  networking: 'Network',
  dbms: 'Database',
  'operating-systems': 'Cpu',
  security: 'Shield',
  'web-technologies': 'Globe',
  'data-structures': 'GitBranch',
  'computer-organization': 'Microchip',
  'software-engineering': 'Code2',
  'cloud-digital': 'Cloud',
}

export const PRACTICE_INITIAL_TARGET_PER_SUBTOPIC = 50

/** Default goal per subtopic (legacy alias). */
export const PRACTICE_TARGET_PER_SUBTOPIC = PRACTICE_INITIAL_TARGET_PER_SUBTOPIC

/** Denominator for X/Y — goal is 50; grows with count once above 50. */
export function practiceSubtopicDisplayTarget(questionCount: number): number {
  return Math.max(questionCount, PRACTICE_INITIAL_TARGET_PER_SUBTOPIC)
}

/** How many questions to generate/import in the next batch (0 when at cap). */
export function practiceImportBatchSize(existingCount: number): number {
  return Math.max(0, PRACTICE_INITIAL_TARGET_PER_SUBTOPIC - existingCount)
}

export interface PracticeSubtopic {
  slug: string
  title: string
  questionCount: number
}

export interface PracticeSection {
  id: string
  title: string
  topic: string
  topicLabel: string
  description: string
  subtopicCount: number
  availableCount: number
  subtopics: PracticeSubtopic[]
}

export interface PracticeCatalog {
  sections: PracticeSection[]
  totalSubtopics: number
  availableQuestions: number
  filledSubtopics: number
}

export interface PracticeQuestionSummary {
  questionNumber: number
  id: number
}

export interface PracticeQuestion {
  id: number
  sectionId: string
  sectionTitle: string
  subtopicSlug: string
  subtopicTitle: string
  topic: string
  questionNumber: number
  totalInSubtopic: number
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  explanation: string | null
  solutionImageUrl: string | null
}

export interface PracticeReveal {
  correctOption: string
  explanation: string
  solutionImageUrl: string | null
}

export interface DailyActivity {
  date: string
  attemptCount: number
  bestNetScore: number
}
