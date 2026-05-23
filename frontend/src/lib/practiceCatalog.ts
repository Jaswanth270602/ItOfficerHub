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

export interface PracticeSubtopic {
  slug: string
  title: string
  hasQuestion: boolean
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
}

export interface PracticeQuestion {
  id: number
  sectionId: string
  sectionTitle: string
  subtopicSlug: string
  subtopicTitle: string
  topic: string
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
