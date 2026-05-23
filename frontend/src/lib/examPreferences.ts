export type ExamLanguage = 'en' | 'hi'

const LANG_KEY = 'itoh_exam_lang'
const RULES_KEY = 'itoh_exam_rules_ack'

export function getExamLanguage(): ExamLanguage {
  const v = localStorage.getItem(LANG_KEY)
  return v === 'hi' ? 'hi' : 'en'
}

export function setExamLanguage(lang: ExamLanguage) {
  localStorage.setItem(LANG_KEY, lang)
}

export function hasAcknowledgedExamRules(): boolean {
  return sessionStorage.getItem(RULES_KEY) === '1'
}

export function acknowledgeExamRules() {
  sessionStorage.setItem(RULES_KEY, '1')
}
