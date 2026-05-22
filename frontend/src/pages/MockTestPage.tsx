import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { AlertTriangle, Bookmark, ChevronLeft, ChevronRight, Flag, Send, X } from 'lucide-react'

interface Question {
  id: number
  orderIndex: number
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
}

export function MockTestPage() {
  const { mockId } = useParams()
  const navigate = useNavigate()
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [title, setTitle] = useState('')
  const [timeLimit, setTimeLimit] = useState(15)
  const [marksCorrect, setMarksCorrect] = useState(1)
  const [marksWrong, setMarksWrong] = useState(0.25)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [marked, setMarked] = useState<Record<number, boolean>>({})
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [started, setStarted] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const submitTest = useCallback(async () => {
    if (!attemptId) return
    const timeTaken = timeLimit * 60 - secondsLeft
    const answerList = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId: Number(questionId),
      selectedOption,
    }))
    const { data } = await api.post(`/attempts/${attemptId}/submit`, {
      timeTakenSeconds: timeTaken,
      answers: answerList,
    })
    navigate(`/result/${data.attemptId}`)
  }, [attemptId, answers, timeLimit, secondsLeft, navigate])

  useEffect(() => {
    api
      .post('/attempts/start', { mockTestId: Number(mockId) })
      .then(async (r) => {
        const id = r.data.attemptId
        setAttemptId(id)
        setQuestions(r.data.questions)
        setTitle(r.data.mockTitle)
        setTimeLimit(r.data.timeLimitMinutes)
        setMarksCorrect(r.data.marksPerCorrect ?? 1)
        setMarksWrong(r.data.negativePerWrong ?? 0.25)
        setSecondsLeft(r.data.timeLimitMinutes * 60)
        setStarted(true)
        try {
          const prog = await api.get(`/attempts/${id}/progress`)
          const ans: Record<number, string> = {}
          const mrk: Record<number, boolean> = {}
          for (const a of prog.data.answers) {
            if (a.selectedOption) ans[a.questionId] = a.selectedOption
            if (a.markedForReview) mrk[a.questionId] = true
          }
          setAnswers(ans)
          setMarked(mrk)
        } catch {
          /* fresh attempt */
        }
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [mockId, navigate])

  useEffect(() => {
    if (!started || secondsLeft <= 0) return
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [started, secondsLeft])

  useEffect(() => {
    if (secondsLeft === 0 && started && attemptId) {
      submitTest()
    }
  }, [secondsLeft, started, attemptId, submitTest])

  const persist = async (questionId: number, patch: { selectedOption?: string; markedForReview?: boolean }) => {
    if (!attemptId) return
    try {
      await api.post(`/attempts/${attemptId}/answers`, { questionId, ...patch })
    } catch {
      /* ignore */
    }
  }

  const selectAnswer = async (option: string) => {
    const q = questions[current]
    setAnswers((prev) => ({ ...prev, [q.id]: option }))
    await persist(q.id, { selectedOption: option })
  }

  const clearAnswer = async () => {
    const q = questions[current]
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[q.id]
      return next
    })
    await persist(q.id, { selectedOption: '' })
  }

  const toggleMark = async (value: boolean, goNext?: boolean) => {
    const q = questions[current]
    setMarked((prev) => ({ ...prev, [q.id]: value }))
    await persist(q.id, { markedForReview: value })
    if (goNext && current < questions.length - 1) setCurrent((c) => c + 1)
  }

  const goNext = () => {
    if (current < questions.length - 1) setCurrent((c) => c + 1)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const attempted = Object.keys(answers).length
  const markedCount = Object.values(marked).filter(Boolean).length
  const unattempted = questions.length - attempted
  const projectedMax = questions.length * marksCorrect

  const paletteClass = (ques: Question, i: number) => {
    const answered = !!answers[ques.id]
    const isMarked = !!marked[ques.id]
    if (i === current) {
      return cn(
        'ring-2 ring-neon-blue',
        answered && isMarked && 'bg-violet-600/90 text-white',
        answered && !isMarked && 'bg-green-600/90 text-white',
        !answered && isMarked && 'bg-violet-700/80 text-white',
        !answered && !isMarked && 'bg-cyber-700 text-white'
      )
    }
    if (answered && isMarked) return 'bg-violet-600/70 text-white hover:bg-violet-600'
    if (answered) return 'bg-green-600/80 text-white hover:bg-green-600'
    if (isMarked) return 'bg-violet-800/80 text-violet-100 hover:bg-violet-700'
    return 'bg-cyber-800 text-slate-400 hover:bg-cyber-700'
  }

  if (loading) return <div className="text-center py-20 text-slate-400">Loading mock test...</div>
  if (!questions.length) return <div className="text-center py-20 text-red-400">Failed to load test. Please login.</div>

  const q = questions[current]
  const isMarked = !!marked[q.id]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-slate-400 text-sm">
            Q {current + 1} / {questions.length} · Answered {attempted} · Marked {markedCount}
          </p>
        </div>
        <div
          className={cn(
            'text-2xl font-mono font-bold px-4 py-2 rounded-lg border tabular-nums',
            secondsLeft < 60 ? 'border-red-500 text-red-400 animate-pulse' : 'border-cyber-600 text-neon-cyan'
          )}
        >
          {formatTime(secondsLeft)}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm mb-6 p-4 rounded-lg border border-cyber-700 bg-cyber-900/40">
        <span className="text-green-400">+{marksCorrect} correct</span>
        <span className="text-red-400">−{marksWrong} wrong</span>
        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-medium">{unattempted} not answered</span>
        <span className="px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 font-medium">{markedCount} for review</span>
        <span className="text-slate-500">Max {projectedMax} · Cutoff 10</span>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardContent className="pt-6">
            <p className="text-lg mb-6 leading-relaxed">{q.questionText}</p>
            {(['A', 'B', 'C', 'D'] as const).map((label) => {
              const text = label === 'A' ? q.optionA : label === 'B' ? q.optionB : label === 'C' ? q.optionC : q.optionD
              const selected = answers[q.id] === label
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => selectAnswer(label)}
                  className={cn(
                    'w-full text-left p-4 mb-3 rounded-lg border transition-all cursor-pointer',
                    selected
                      ? 'border-neon-blue bg-neon-blue/15'
                      : 'border-cyber-700 hover:border-cyber-500 bg-cyber-900/40'
                  )}
                >
                  <span className="font-bold text-neon-cyan mr-3">{label}.</span>
                  {text}
                </button>
              )
            })}

            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-cyber-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn('cursor-pointer', isMarked && 'border-violet-500 text-violet-300 bg-violet-950/40')}
                onClick={() => toggleMark(!isMarked)}
              >
                <Bookmark className={cn('h-4 w-4', isMarked && 'fill-current')} />
                {isMarked ? 'Unmark review' : 'Mark for review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer border-violet-600/50 text-violet-200"
                onClick={() => toggleMark(true, true)}
              >
                <Flag className="h-4 w-4" /> Mark &amp; next
              </Button>
              {answers[q.id] && (
                <Button type="button" variant="ghost" size="sm" className="cursor-pointer text-slate-400" onClick={clearAnswer}>
                  <X className="h-4 w-4" /> Clear response
                </Button>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" className="cursor-pointer" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              {current < questions.length - 1 ? (
                <Button className="cursor-pointer" onClick={goNext}>
                  Save &amp; next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
                  <DialogTrigger asChild>
                    <Button className="cursor-pointer">
                      <Send className="h-4 w-4" /> Submit test
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" /> Submit mock test?
                      </DialogTitle>
                    </DialogHeader>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>Answered: {attempted} / {questions.length}</li>
                      <li>Marked for review: {markedCount}</li>
                      <li>Unattempted: {unattempted} (0 marks, no negative)</li>
                    </ul>
                    <div className="flex gap-3 justify-end">
                      <Button variant="outline" className="cursor-pointer" onClick={() => setSubmitOpen(false)}>
                        Continue test
                      </Button>
                      <Button className="cursor-pointer" onClick={submitTest}>
                        Submit now
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>

        <div>
          <p className="text-sm font-medium text-slate-300 mb-3">Question palette</p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((ques, i) => (
              <button
                key={ques.id}
                type="button"
                onClick={() => setCurrent(i)}
                className={cn('h-9 rounded text-sm font-medium cursor-pointer transition-colors', paletteClass(ques, i))}
                title={
                  marked[ques.id] && answers[ques.id]
                    ? 'Answered + marked'
                    : marked[ques.id]
                      ? 'Marked for review'
                      : answers[ques.id]
                        ? 'Answered'
                        : 'Not visited'
                }
              >
                {i + 1}
              </button>
            ))}
          </div>
          <ul className="text-xs text-slate-500 mt-3 space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-green-600" /> Answered
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-violet-600" /> Marked for review
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-cyber-800 border border-cyber-600" /> Not answered
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
