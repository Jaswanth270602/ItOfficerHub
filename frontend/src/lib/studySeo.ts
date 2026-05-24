import catalogData from '@/data/practice-catalog-seo.json'
import type { SeoProps } from '@/lib/seo'
import { SITE_NAME } from '@/lib/seo'

export type StaticStudySection = (typeof catalogData.sections)[number]
export type StaticStudySubtopic = StaticStudySection['subtopics'][number]

export const STUDY_CATALOG_STATIC = catalogData.sections

const sectionById = (id: string) => STUDY_CATALOG_STATIC.find((s) => s.id === id)

export function buildStudySeoFromPath(pathname: string): SeoProps {
  const base = {
    keywords:
      'IBPS SO IT Officer practice questions, IT Officer MCQ, PSU IT Officer study, topic wise IT officer Q&A, free IT officer preparation',
  }

  if (pathname === '/study' || pathname === '/study/') {
    return {
      path: '/study',
      title: 'IBPS SO IT Officer Practice Questions — Topic-wise Study Q&A',
      description:
        'Free topic-wise MCQs for IBPS SO IT Officer & PSU IT exams — Computer Networks, DBMS, OS, Security, DSA & more. Solutions included, no login.',
      ...base,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${SITE_NAME} Study Q&A`,
        description: 'Topic-wise IBPS SO IT Officer practice questions with solutions.',
        url: 'https://itofficerhub.in/study',
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: 'https://itofficerhub.in' },
      },
    }
  }

  const questionMatch = pathname.match(/^\/study\/([^/]+)\/([^/]+)\/q\/(\d+)\/?$/)
  if (questionMatch) {
    const [, sectionId, subtopicSlug, num] = questionMatch
    const section = sectionById(sectionId)
    const subtopic = section?.subtopics.find((t) => t.slug === subtopicSlug)
    const path = `/study/${sectionId}/${subtopicSlug}/q/${num}`
    const topicLabel = subtopic?.title ?? subtopicSlug
    const sectionLabel = section?.title ?? sectionId
    return {
      path,
      title: `${topicLabel} — Practice Q${num} | ${sectionLabel}`,
      description: `IBPS SO IT Officer MCQ: ${topicLabel} (${sectionLabel}). Question ${num} with answer & solution — free on ${SITE_NAME}.`,
      type: 'article',
      ...base,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        name: `${topicLabel} — Question ${num}`,
        description: `Practice question for ${topicLabel} in ${sectionLabel}.`,
        url: `https://itofficerhub.in${path}`,
        learningResourceType: 'Practice problem',
        educationalLevel: 'Professional',
        inLanguage: 'en-IN',
        isPartOf: {
          '@type': 'Course',
          name: sectionLabel,
          url: `https://itofficerhub.in/study/${sectionId}`,
        },
      },
    }
  }

  const subtopicMatch = pathname.match(/^\/study\/([^/]+)\/([^/]+)\/?$/)
  if (subtopicMatch) {
    const [, sectionId, subtopicSlug] = subtopicMatch
    const section = sectionById(sectionId)
    const subtopic = section?.subtopics.find((t) => t.slug === subtopicSlug)
    const path = `/study/${sectionId}/${subtopicSlug}`
    const topicLabel = subtopic?.title ?? subtopicSlug
    const sectionLabel = section?.title ?? sectionId
    return {
      path,
      title: `${topicLabel} MCQs — ${sectionLabel} | IBPS IT Officer`,
      description: `Practice ${topicLabel} questions for IBPS SO IT Officer & PSU IT (${sectionLabel}). Free MCQs with detailed solutions on ${SITE_NAME}.`,
      ...base,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        name: topicLabel,
        description: section?.description,
        url: `https://itofficerhub.in${path}`,
        learningResourceType: 'Study guide',
        inLanguage: 'en-IN',
        isPartOf: {
          '@type': 'Course',
          name: sectionLabel,
          url: `https://itofficerhub.in/study/${sectionId}`,
        },
      },
    }
  }

  const sectionMatch = pathname.match(/^\/study\/([^/]+)\/?$/)
  if (sectionMatch) {
    const [, sectionId] = sectionMatch
    const section = sectionById(sectionId)
    const path = `/study/${sectionId}`
    const title = section?.title ?? sectionId
    return {
      path,
      title: `${title} — IBPS SO IT Officer Practice Topics`,
      description:
        section?.description ??
        `Topic-wise ${title} MCQs for IBPS SO IT Officer & PSU IT exams — free practice with solutions.`,
      ...base,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: title,
        description: section?.description,
        url: `https://itofficerhub.in${path}`,
        provider: { '@type': 'Organization', name: SITE_NAME, url: 'https://itofficerhub.in' },
        hasPart: section?.subtopics.map((t) => ({
          '@type': 'LearningResource',
          name: t.title,
          url: `https://itofficerhub.in/study/${sectionId}/${t.slug}`,
        })),
      },
    }
  }

  return {
    path: '/study',
    title: 'IBPS SO IT Officer Practice Questions — Topic-wise Study Q&A',
    description: 'Free topic-wise MCQs for IBPS SO IT Officer & PSU IT exams.',
    ...base,
  }
}
