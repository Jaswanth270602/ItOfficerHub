/** Static reference data for /ibps-so-it-officer — CRP SPL-XVI (IBPS SO 2026) notification. */

export const IBPS_OFFICIAL_URL = 'https://www.ibps.in/'

export const HIGHLIGHTS = [
  { label: 'Conducting body', value: 'Institute of Banking Personnel Selection (IBPS)' },
  { label: 'Exam / post', value: 'CRP SPL-XVI — IT Officer (Scale I)' },
  { label: 'Selection stages', value: 'Prelims → Mains → Interview' },
  { label: 'Prelims', value: '29 August 2026 · 100 Q · 125 marks · 80 minutes' },
  { label: 'Mains', value: '1 November 2026 · 225 marks · 155 minutes' },
  { label: 'Final merit', value: '80% Mains + 20% Interview (Mains merit from Professional Knowledge only)' },
  { label: 'Negative marking', value: '0.25 marks deducted per wrong answer (objective papers)' },
  { label: 'IT Officer vacancies (2026)', value: '301 posts (Scale I)' },
] as const

/** Prelims pattern for IT Officer (also AFO / HR / Marketing) — CRP SPL-XVI revised. */
export const PRELIMS_PATTERN = {
  headers: ['Subject', 'Questions', 'Marks', 'Duration'],
  rows: [
    ['English Language', '25', '25', '20 min'],
    ['Reasoning', '25', '25', '20 min'],
    ['Quantitative Aptitude', '25', '25', '20 min'],
    ['Professional Knowledge (IT)', '25', '50', '20 min'],
    ['Total', '100', '125', '80 minutes'],
  ],
} as const

/** Mains pattern for IT Officer (also AFO / HR / Marketing) — CRP SPL-XVI revised. */
export const MAINS_PATTERN = {
  headers: ['Section', 'Questions', 'Marks'],
  rows: [
    ['English Language', '30', '30'],
    ['Reasoning', '40', '40'],
    ['Quantitative Aptitude', '30', '30'],
    ['Professional Knowledge — Objective (IT)', '50', '100'],
    ['Objective test total', '150', '200'],
    ['Descriptive Paper (English — 2 questions)', '—', '25'],
    ['Grand total', '150 + Descriptive', '225'],
  ],
  duration: '155 minutes',
  note: 'All sections except Professional Knowledge are qualifying. Mains merit for final selection is based only on Professional Knowledge marks.',
} as const

export const IMPORTANT_DATES_2026 = [
  { event: 'Notification released', date: '30 June 2026' },
  { event: 'Online registration', date: '1 July – 21 July 2026' },
  { event: 'Application correction window', date: '22 – 23 July 2026' },
  { event: 'Preliminary exam', date: '29 August 2026' },
  { event: 'Prelims result', date: 'September – October 2026' },
  { event: 'Main exam', date: '1 November 2026' },
  { event: 'Personality test & interview', date: 'November – December 2026' },
  { event: 'Provisional allotment', date: 'January 2027' },
] as const

/** Bank-wise IT Officer (Scale I) vacancies — CRP SPL-XVI. NR = not reported in summary tables. */
export const VACANCY_BANKWISE_IT_2026 = [
  { bank: 'Bank of India', count: 110 },
  { bank: 'Punjab National Bank', count: 100 },
  { bank: 'Central Bank of India', count: 50 },
  { bank: 'Indian Overseas Bank', count: 25 },
  { bank: 'Punjab & Sind Bank', count: 16 },
  { bank: 'Total (IT Officer)', count: 301 },
] as const

export const ELIGIBILITY_EDUCATION = [
  'Four-year engineering/technology degree in Computer Science, Computer Applications, IT, Electronics, Electronics & Telecom, Electronics & Communication, or Electronics & Instrumentation',
  'Postgraduate degree in Electronics, Electronics & Telecom, Electronics & Communication, Electronics & Instrumentation, Computer Science, IT, or Computer Applications',
  'Graduate who has passed DOEACC/NIELIT “B” level',
] as const

export const ELIGIBILITY_AGE = {
  min: 20,
  max: 30,
  asOn: '1 July 2026',
  relaxations: [
    { category: 'SC / ST', years: '+5' },
    { category: 'OBC (NCL)', years: '+3' },
    { category: 'Persons with benchmark disability', years: '+10' },
    { category: 'Ex-servicemen', years: '+5' },
    { category: 'Affected by 1984 riots', years: '+5' },
  ],
} as const

export const APPLICATION_FEE = [
  { category: 'General & Others', fee: '₹850 (incl. intimation charges)' },
  { category: 'SC / ST / PwD', fee: '₹175 (intimation charges only)' },
] as const

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

export const EXAMS_WE_TARGET = [
  'IBPS Specialist Officer (IT Officer)',
  'NIACL / LIC / GIC IT Officer',
  'Other PSU IT professional knowledge papers',
] as const

/** Subject-wise PK topics for mocks & Study Q&A — maps to mock filters. */
export const IT_SYLLABUS_SUBJECTS = [
  { code: 'NETWORKING', name: 'Computer Networks', points: ['OSI/TCP-IP', 'IP addressing & subnetting', 'Routing, switching, VLANs', 'DNS, DHCP, firewalls'] },
  { code: 'DBMS', name: 'DBMS & SQL', points: ['Normalization', 'SQL queries & joins', 'Indexing, transactions', 'ACID properties'] },
  { code: 'OPERATING_SYSTEMS', name: 'Operating Systems', points: ['Process & threads', 'Scheduling & deadlocks', 'Memory management', 'File systems'] },
  { code: 'SECURITY', name: 'Cyber Security', points: ['Encryption basics', 'Malware & attacks', 'OWASP / secure coding', 'Authentication'] },
  { code: 'WEB_TECHNOLOGIES', name: 'Web Technologies', points: ['HTTP/REST', 'HTML/CSS/JS basics', 'APIs & middleware', 'Web servers'] },
  { code: 'DATA_STRUCTURES', name: 'Data Structures', points: ['Arrays, stacks, queues', 'Trees & graphs', 'Sorting', 'Complexity'] },
  { code: 'COMPUTER_ORGANIZATION', name: 'Computer Organization', points: ['CPU & registers', 'Cache & memory', 'I/O', 'Instruction cycles'] },
  { code: 'SOFTWARE_ENGINEERING', name: 'Software Engineering', points: ['SDLC & Agile', 'Testing types', 'UML basics', 'Maintenance'] },
  { code: 'CLOUD_COMPUTING', name: 'Cloud Computing', points: ['IaaS/PaaS/SaaS', 'Virtualization', 'AWS/Azure basics', 'Containers intro'] },
  { code: 'DIGITAL_ELECTRONICS', name: 'Digital Electronics', points: ['Boolean algebra', 'Logic gates', 'Combinational circuits', 'Number systems'] },
] as const

export const TOC = [
  { id: 'overview', label: 'Overview' },
  { id: 'dates', label: 'Important dates' },
  { id: 'pattern', label: 'Exam pattern' },
  { id: 'syllabus', label: 'Syllabus & topics' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'vacancies', label: 'Vacancies' },
  { id: 'salary', label: 'Salary' },
  { id: 'cutoffs', label: 'Cut-offs' },
  { id: 'prepare', label: 'Prepare with us' },
] as const
