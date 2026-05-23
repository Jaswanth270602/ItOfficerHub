import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import type { PracticeQuestion, PracticeReveal } from '@/lib/practiceCatalog'
import { useStudyCatalog } from '@/components/study/StudyHubShell'
import { SolutionExplanation } from '@/components/exam/SolutionExplanation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CheckCircle2, ChevronLeft, ChevronRight, XCircle } from 'lucide-react'

type Choice = 'A' | 'B' | 'C' | 'D'

export function StudyQuestionPage() {
  const { sectionId, subtopicSlug, questionNum } = useParams<{
    sectionId: string
    subtopicSlug: string
    questionNum: string
  }>()
  const qNum = Math.max(1, parseInt(questionNum ?? '1', 10) || 1)
  const { sectionById } = useStudyCatalog()
  const [question, setQuestion] = useState<PracticeQuestion | null>(null)
  const [reveal, setReveal] = useState<PracticeReveal | null>(null)
  const [selected, setSelected] = useState<Choice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const section = sectionId ? sectionById(sectionId) : undefined
  const subtopic = section?.subtopics.find((s) => s.slug === subtopicSlug)

  useEffect(() => {
    if (!sectionId || !subtopicSlug) return
    setLoading(true)
    setError('')
    setReveal(null)
    setSelected(null)
    api
      .get(`/public/practice/sections/${sectionId}/topics/${subtopicSlug}/questions/${qNum}`)
      .then((r) => setQuestion(r.data))
      .catch((e) => setError(apiErrorMessage(e, 'Question not available yet')))
      .finally(() => setLoading(false))
  }, [sectionId, subtopicSlug, qNum])

  const checkAnswer = () => {
    if (!selected || !sectionId || !subtopicSlug) return
    api
      .get(`/public/practice/sections/${sectionId}/topics/${subtopicSlug}/questions/${qNum}/reveal`)
      .then((r) => setReveal(r.data))
      .catch((e) => setError(apiErrorMessage(e, 'Could not load solution')))
  }

  const options: { label: Choice; text: string }[] = question
    ? [
        { label: 'A', text: question.optionA },
        { label: 'B', text: question.optionB },
        { label: 'C', text: question.optionC },
        { label: 'D', text: question.optionD },
      ]
    : []

  const answered = reveal != null
  const correct = reveal?.correctOption as Choice | undefined
  const total = question?.totalInSubtopic ?? 0

  return (
    <div className="max-w-3xl">
      <nav className="text-xs text-slate-500 mb-4 flex flex-wrap items-center gap-1">
        <Link to="/study" className="hover:text-neon-cyan">
          Study
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/study/${sectionId}`} className="hover:text-neon-cyan truncate max-w-[120px] sm:max-w-none">
          {section?.title}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/study/${sectionId}/${subtopicSlug}`} className="hover:text-neon-cyan truncate max-w-[120px]">
          {subtopic?.title ?? question?.subtopicTitle}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-300">Q{qNum}</span>
      </nav>

      {loading && <p className="text-slate-500 py-12 text-center">Loading question...</p>}

      {error && !loading && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6 text-center">
          <p className="text-amber-200 mb-4">{error}</p>
          <Link to={`/study/${sectionId}/${subtopicSlug}`}>
            <Button variant="outline" className="cursor-pointer">
              Back to questions
            </Button>
          </Link>
        </div>
      )}

      {question && !loading && (
        <>
          <div className="mb-2 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-cyber-800 text-neon-cyan border border-cyber-600">
              {question.topic.replace(/_/g, ' ')}
            </span>
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-cyber-800 text-slate-400">
              Q {qNum}{total > 0 ? ` / ${total}` : ''} · Practice
            </span>
          </div>

          <h1 className="text-lg sm:text-xl font-semibold text-white mb-6 leading-relaxed">
            {question.questionText}
          </h1>

          <div className="space-y-2.5 mb-6">
            {options.map(({ label, text }) => {
              const isSelected = selected === label
              const isCorrect = answered && label === correct
              const isWrong = answered && isSelected && label !== correct
              return (
                <button
                  key={label}
                  type="button"
                  disabled={answered}
                  onClick={() => !answered && setSelected(label)}
                  className={cn(
                    'w-full text-left flex gap-3 p-3.5 sm:p-4 rounded-lg border-2 transition-all cursor-pointer min-h-[52px]',
                    !answered && isSelected && 'border-neon-cyan bg-neon-cyan/10',
                    !answered && !isSelected && 'border-cyber-700 bg-cyber-900/50 hover:border-slate-500',
                    isCorrect && 'border-emerald-500 bg-emerald-950/30',
                    isWrong && 'border-red-500/80 bg-red-950/20',
                    answered && !isCorrect && !isWrong && 'border-cyber-800 opacity-60 cursor-default'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded font-bold text-sm',
                      isCorrect && 'bg-emerald-500 text-cyber-950',
                      isWrong && 'bg-red-500 text-white',
                      !isCorrect && !isWrong && (isSelected ? 'bg-neon-cyan text-cyber-950' : 'bg-cyber-800 text-neon-cyan')
                    )}
                  >
                    {label}
                  </span>
                  <span className="pt-1 text-sm sm:text-base text-slate-200 flex-1">{text}</span>
                  {isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
                  {isWrong && <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
                </button>
              )
            })}
          </div>

          {!answered && (
            <Button
              className="w-full sm:w-auto cursor-pointer min-h-[48px] mb-8"
              disabled={!selected}
              onClick={checkAnswer}
            >
              Check answer &amp; view solution
            </Button>
          )}

          {reveal && (
            <div className="rounded-xl border border-cyber-600 bg-cyber-900/50 p-4 sm:p-6 mb-8">
              <p className="text-sm font-medium text-white mb-3">
                {selected === correct ? (
                  <span className="text-emerald-400">Correct!</span>
                ) : (
                  <span className="text-amber-300">
                    Correct answer: <strong>{correct}</strong>
                  </span>
                )}
              </p>
              <SolutionExplanation text={reveal.explanation} correctOption={correct ?? undefined} />
              {reveal.solutionImageUrl && (
                <img
                  src={reveal.solutionImageUrl}
                  alt="Solution diagram"
                  className="mt-4 rounded-lg border border-cyber-700 max-w-full h-auto"
                />
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-4 border-t border-cyber-800">
            {qNum > 1 && (
              <Link to={`/study/${sectionId}/${subtopicSlug}/q/${qNum - 1}`}>
                <Button variant="outline" size="sm" className="cursor-pointer gap-1">
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
              </Link>
            )}
            {total > 0 && qNum < total && (
              <Link to={`/study/${sectionId}/${subtopicSlug}/q/${qNum + 1}`}>
                <Button variant="outline" size="sm" className="cursor-pointer gap-1">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link to={`/study/${sectionId}/${subtopicSlug}`}>
              <Button variant="outline" size="sm" className="cursor-pointer">
                All questions
              </Button>
            </Link>
            <Link to="/mocks">
              <Button size="sm" className="cursor-pointer">
                Take a full mock
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
