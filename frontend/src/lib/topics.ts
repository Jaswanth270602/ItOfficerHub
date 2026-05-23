export type TopicCode =
  | 'ALL'
  | 'CUMULATIVE'
  | 'NETWORKING'
  | 'DBMS'
  | 'OPERATING_SYSTEMS'
  | 'SECURITY'
  | 'WEB_TECHNOLOGIES'
  | 'DATA_STRUCTURES'
  | 'COMPUTER_ORGANIZATION'
  | 'SOFTWARE_ENGINEERING'
  | 'CLOUD_COMPUTING'
  | 'DIGITAL_ELECTRONICS'
  | 'QUANTITATIVE_APTITUDE'
  | 'LOGICAL_REASONING'
  | 'VERBAL_ABILITY'

export interface TopicCatalogItem {
  code: string
  shortLabel: string
  fullLabel: string
}

export const STATIC_TOPIC_FILTERS: { code: TopicCode; shortLabel: string; fullLabel: string }[] = [
  { code: 'ALL', shortLabel: 'All', fullLabel: 'All subjects' },
  { code: 'CUMULATIVE', shortLabel: 'Full', fullLabel: 'Cumulative / mixed syllabus' },
]

export const TOPIC_SHORT: Record<string, string> = {
  NETWORKING: 'CN',
  DBMS: 'DBMS',
  OPERATING_SYSTEMS: 'OS',
  SECURITY: 'SEC',
  WEB_TECHNOLOGIES: 'WEB',
  DATA_STRUCTURES: 'DS',
  COMPUTER_ORGANIZATION: 'CO',
  SOFTWARE_ENGINEERING: 'SE',
  CLOUD_COMPUTING: 'CLOUD',
  DIGITAL_ELECTRONICS: 'DE',
  QUANTITATIVE_APTITUDE: 'QUANT',
  LOGICAL_REASONING: 'LR',
  VERBAL_ABILITY: 'VERB',
}

export function topicShort(code: string): string {
  return TOPIC_SHORT[code] ?? code.slice(0, 4)
}

export function matchesTopicFilter(
  mockTopics: string[] | undefined,
  cumulative: boolean | undefined,
  filter: TopicCode
): boolean {
  if (filter === 'ALL') return true
  if (filter === 'CUMULATIVE') return cumulative === true || (mockTopics?.length ?? 0) >= 3
  return mockTopics?.includes(filter) ?? false
}
