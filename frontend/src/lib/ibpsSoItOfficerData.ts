/** Static reference data for /ibps-so-it-officer — align with official IBPS notifications when they release. */

export const IBPS_OFFICIAL_URL = 'https://www.ibps.in/'

export const HIGHLIGHTS = [
  { label: 'Conducting body', value: 'Institute of Banking Personnel Selection (IBPS)' },
  { label: 'Post', value: 'Specialist Officer — IT Officer (Scale I)' },
  { label: 'Selection stages', value: 'Prelims → Mains (Professional Knowledge) → Interview' },
  { label: 'Prelims (tentative)', value: '29 August 2026 · 125 marks · 2 hours' },
  { label: 'Mains (tentative)', value: '1 November 2026 · 60 marks · 45 minutes' },
  { label: 'Final merit', value: '80% Mains + 20% Interview (out of 100 each stage scaled)' },
  { label: 'Negative marking', value: '0.25 marks deducted per wrong answer (objective papers)' },
  { label: 'Last cycle vacancies (IT)', value: '170 (indicative — check new notification)' },
] as const

export const PRELIMS_PATTERN = {
  headers: ['Test', 'Medium', 'Questions', 'Marks', 'Duration'],
  rows: [
    ['English Language', 'English only', '50', '25', '40 min'],
    ['Reasoning', 'English & Hindi', '50', '50', '40 min'],
    ['Quantitative Aptitude', 'English & Hindi', '50', '50', '40 min'],
    ['Total', '—', '150', '125', '2 hours'],
  ],
} as const

export const MAINS_PATTERN = {
  headers: ['Test', 'Questions', 'Marks', 'Medium', 'Duration'],
  rows: [['Professional Knowledge (IT)', '60', '60', 'English & Hindi', '45 minutes']],
} as const

export const IMPORTANT_DATES_2026 = [
  { event: 'Notification & online registration', date: 'Expected June 2026 (per IBPS calendar)' },
  { event: 'Application fee payment', date: 'As per notification' },
  { event: 'Preliminary exam', date: '29 August 2026 (tentative)' },
  { event: 'Main exam', date: '1 November 2026 (tentative)' },
  { event: 'Interview', date: 'After mains result — participating banks' },
] as const

export const VACANCY_SUMMARY_LAST_CYCLE = [
  { category: 'Unreserved (UR)', count: 72 },
  { category: 'OBC (NCL)', count: 45 },
  { category: 'SC', count: 25 },
  { category: 'ST', count: 12 },
  { category: 'EWS', count: 16 },
  { category: 'Total (IT stream)', count: 170 },
] as const

export const ELIGIBILITY_EDUCATION = [
  'Four-year engineering/technology degree in Computer Science, Computer Applications, IT, Electronics, Electronics & Telecom, Electronics & Communication, or Electronics & Instrumentation',
  'Postgraduate degree in Electronics, Electronics & Telecom, Electronics & Communication, Electronics & Instrumentation, Computer Science, IT, or Computer Applications',
  'Graduate who has passed DOEACC/NIELIT “B” level',
] as const

export const ELIGIBILITY_AGE = {
  min: 20,
  max: 30,
  relaxations: [
    { category: 'SC / ST', years: '+5' },
    { category: 'OBC (NCL)', years: '+3' },
    { category: 'Persons with benchmark disability', years: '+10' },
    { category: 'Ex-servicemen', years: '+5' },
  ],
} as const

export const PK_SYLLABUS_TOPICS = [
  'Software fundamentals & engineering',
  'Data structures (C/Pascal level) & algorithms',
  'DBMS, RDBMS & SQL',
  'Operating systems',
  'Computer organisation & architecture',
  'Data communication & computer networks',
  'Object-oriented systems',
  'Systems analysis & design',
  'Web technologies & intelligent systems',
  'Numerical/statistical computing & IT in banking (as per notification)',
] as const

export const PRELIMS_CUTOFF_2025 = {
  overall: [
    { cat: 'SC', score: '58.25' },
    { cat: 'ST', score: '48.63' },
    { cat: 'OBC', score: '58.25' },
    { cat: 'EWS', score: '55.00' },
    { cat: 'UR', score: '58.25' },
  ],
  sectional: [
    { test: 'Reasoning (50)', reserved: '7.50', general: '10.25' },
    { test: 'English (25)', reserved: '3.00', general: '6.50' },
    { test: 'Quantitative Aptitude (50)', reserved: '5.75', general: '9.50' },
  ],
} as const

export const MAINS_CUTOFF_2025 = [
  { cat: 'SC', score: '14.75' },
  { cat: 'ST', score: '15.25' },
  { cat: 'OBC', score: '21.50' },
  { cat: 'EWS', score: '21.00' },
  { cat: 'UR', score: '23.25' },
] as const

export const MAINS_PK_SECTIONAL_2025 = {
  maxMarks: 60,
  reserved: '13.25',
  general: '17.50',
} as const

export const FINAL_CUTOFF_2025 = [
  { cat: 'SC', score: '40.67' },
  { cat: 'ST', score: '41.53' },
  { cat: 'OBC', score: '49.47' },
  { cat: 'EWS', score: '52.27' },
  { cat: 'UR', score: '57.93' },
] as const

export const TOC = [
  { id: 'overview', label: 'Overview' },
  { id: 'dates', label: 'Important dates' },
  { id: 'pattern', label: 'Exam pattern' },
  { id: 'syllabus', label: 'Syllabus' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'vacancies', label: 'Vacancies' },
  { id: 'salary', label: 'Salary' },
  { id: 'cutoffs', label: 'Cut-offs' },
  { id: 'prepare', label: 'Prepare with us' },
] as const
