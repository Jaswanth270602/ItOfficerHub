export const LANDING_FAQ = [
  {
    q: 'What is ItOfficerHub (IT Officer Hub)?',
    a: 'ItOfficerHub is a free online platform for IBPS SO IT Officer, PSU IT Officer (NIACL, LIC, GIC, RBI), and TCS NQT aptitude mock tests. Practice with timed mocks, All-India rank, cutoff analysis, and detailed solutions.',
  },
  {
    q: 'Is ItOfficerHub free for IBPS SO IT Officer preparation?',
    a: 'Yes — 100% free. All IBPS Specialist Officer IT professional knowledge mocks, sectional tests, and solutions are free with no payment or subscription.',
  },
  {
    q: 'Does ItOfficerHub have TCS NQT aptitude mock tests?',
    a: 'Yes. We offer TCS NQT (National Qualifier Test) style mocks covering quantitative aptitude, logical reasoning, and verbal ability for campus hiring and college students.',
  },
  {
    q: 'Which subjects are covered for IT Officer exams?',
    a: 'Computer Networks, DBMS, Operating Systems, Security, Web Technologies, Data Structures, Computer Organization, Software Engineering, Cloud Computing, and Digital Electronics — aligned with IBPS SO IT and PSU IT syllabi.',
  },
  {
    q: 'How is marking done in ItOfficerHub mocks?',
    a: 'IBPS SO IT PK-style marking: +2 for each correct answer (P), −0.5 for each wrong answer (N), and 0 for unattempted. Mocks are 25 questions / 50 marks in 20 minutes.',
  },
  {
    q: 'Can I practice subject-wise mocks (CN, OS, DBMS)?',
    a: 'Yes. Filter mocks by subject — Computer Networks (CN), Operating Systems (OS), DBMS, Security, and more — or take full cumulative syllabus mocks.',
  },
]

export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: LANDING_FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}
