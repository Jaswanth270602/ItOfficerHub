import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import {
  buildCheckpointPayload,
  cancelExamCheckpointSchedule,
  flushExamCheckpoint,
  scheduleExamCheckpoint,
} from '@/lib/examCheckpoint'
import { clearExamDraft, loadExamDraft, saveExamDraft } from '@/lib/examDraft'
import { ExamDisclaimerStrip } from '@/components/exam/ExamDisclaimerStrip'
import { ExamInstructionsPanel } from '@/components/exam/ExamInstructionsPanel'
import { ExamSandTimer } from '@/components/exam/ExamSandTimer'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useExamProctor, type ViolationReason } from '@/hooks/useExamProctor'
import { acknowledgeExamRules, getExamLanguage, setExamLanguage, type ExamLanguage } from '@/lib/examPreferences'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  X,
} from 'lucide-react'

interface Question {
  id: number
  orderIndex: number
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
}

type Phase = 'loading' | 'gate' | 'exam' | 'submitting' | 'error'

const VIOLATION_MSG: Record<ViolationReason, string> = {
  fullscreen: 'You exited fullscreen — the mock was submitted automatically.',
  visibility: 'You left the exam window (minimized or switched tab) — the mock was submitted.',
  manual: 'Time ended — mock submitted.',
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
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [phase, setPhase] = useState<Phase>('loading')
  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [violationNote, setViolationNote] = useState<string | null>(null)
  const [examLang, setExamLang] = useState<ExamLanguage>(() => getExamLanguage())
  const [rulesAcknowledged, setRulesAcknowledged] = useState(false)
  const [startError, setStartError] = useState('')
  const [startKey, setStartKey] = useState(0)
  const submittingRef = useRef(false)
  const timerStartedRef = useRef(false)
  const startRequestedRef = useRef(false)
  const answersRef = useRef(answers)
  const markedRef = useRef(marked)

  answersRef.current = answers
  markedRef.current = marked

  const submitTest = useCallback(
    async (reason?: ViolationReason) => {
      if (!attemptId || submittingRef.current) return
      submittingRef.current = true
      setPhase('submitting')
      setSubmitError('')
      if (reason) setViolationNote(VIOLATION_MSG[reason])
      cancelExamCheckpointSchedule()

      const timeTaken = Math.max(0, timeLimit * 60 - secondsLeft)
      const answerList = Object.entries(answersRef.current).map(([questionId, selectedOption]) => ({
        questionId: Number(questionId),
        selectedOption,
      }))
      try {
        const { data } = await api.post(`/attempts/${attemptId}/submit`, {
          timeTakenSeconds: timeTaken,
          answers: answerList,
        })
        clearExamDraft(attemptId)
        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(() => {})
        }
        navigate(`/result/${data.attemptId}`, { state: { violationNote: reason ? VIOLATION_MSG[reason] : null } })
      } catch (e) {
        submittingRef.current = false
        setPhase('exam')
        setSubmitError(apiErrorMessage(e, 'Could not submit your test. Please try again.'))
        setSubmitOpen(false)
      }
    },
    [attemptId, timeLimit, secondsLeft, navigate]
  )

  const onViolation = useCallback(
    (reason: ViolationReason) => {
      submitTest(reason)
    },
    [submitTest]
  )

  const { enterFullscreen } = useExamProctor(phase === 'exam', onViolation)

  useEffect(() => {
    const mockNum = Number(mockId)
    if (!mockNum || startRequestedRef.current) return
    startRequestedRef.current = true
    setStartError('')

    api
      .post('/attempts/start', { mockTestId: mockNum })
      .then(async (r) => {
        const id = r.data.attemptId
        setAttemptId(id)
        setQuestions(r.data.questions)
        setTitle(r.data.mockTitle)
        setTimeLimit(r.data.timeLimitMinutes)
        setMarksCorrect(r.data.marksPerCorrect ?? 1)
        setMarksWrong(r.data.negativePerWrong ?? 0.25)
        const total = r.data.timeLimitMinutes * 60
        setTotalSeconds(total)

        const local = loadExamDraft(id)
        if (local && local.mockId === mockNum) {
          setAnswers(local.answers)
          setMarked(local.marked)
          setSecondsLeft(Math.min(total, Math.max(0, local.secondsLeft)))
          setCurrent(Math.min(r.data.questions.length - 1, Math.max(0, local.current)))
        } else {
          setSecondsLeft(total)
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
            /* fresh */
          }
        }
        setPhase('gate')
      })
      .catch((e) => {
        startRequestedRef.current = false
        const status = (e as { response?: { status?: number } })?.response?.status
        if (status === 401 || status === 403) {
          const target = `/mock/${mockId}`
          navigate(`/login?redirect=${encodeURIComponent(target)}`, { replace: true })
          return
        }
        setStartError(apiErrorMessage(e, 'Could not start this mock. It may not be live yet or is still loading.'))
        setPhase('error')
      })
  }, [mockId, navigate, startKey])

  useEffect(() => {
    if (!attemptId || !mockId) return
    if (phase === 'submitting') return
    saveExamDraft({
      attemptId,
      mockId: Number(mockId),
      answers,
      marked,
      secondsLeft,
      current,
      savedAt: Date.now(),
    })
  }, [attemptId, mockId, answers, marked, secondsLeft, current, phase])

  useEffect(() => {
    if (phase !== 'exam' || !attemptId) return

    const runCheckpoint = (keepalive: boolean) => {
      const payload = buildCheckpointPayload(answersRef.current, markedRef.current)
      if (payload.answers.length === 0) return
      void flushExamCheckpoint(attemptId, payload, keepalive)
    }

    scheduleExamCheckpoint(attemptId, buildCheckpointPayload(answers, marked))

    const onPageHide = () => runCheckpoint(true)
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') runCheckpoint(true)
    }

    window.addEventListener('pagehide', onPageHide)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelExamCheckpointSchedule()
      window.removeEventListener('pagehide', onPageHide)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [phase, attemptId, answers, marked])

  const startExam = async () => {
    if (!rulesAcknowledged) return
    acknowledgeExamRules()
    const ok = await enterFullscreen()
    if (!ok) {
      setSubmitError('Fullscreen is required. Allow fullscreen in your browser, then try again.')
      return
    }
    setPhase('exam')
    timerStartedRef.current = true
  }

  const changeLang = (lang: ExamLanguage) => {
    setExamLang(lang)
    setExamLanguage(lang)
  }

  useEffect(() => {
    if (phase !== 'exam' || !timerStartedRef.current) return
    if (secondsLeft <= 0) return
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [phase, secondsLeft])

  useEffect(() => {
    if (phase === 'exam' && secondsLeft === 0 && attemptId) {
      submitTest('manual')
    }
  }, [secondsLeft, phase, attemptId, submitTest])

  const selectAnswer = (option: string) => {
    const q = questions[current]
    setAnswers((prev) => ({ ...prev, [q.id]: option }))
  }

  const clearAnswer = () => {
    const q = questions[current]
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[q.id]
      return next
    })
  }

  const toggleMark = (value: boolean, goNext?: boolean) => {
    const q = questions[current]
    setMarked((prev) => ({ ...prev, [q.id]: value }))
    if (goNext && current < questions.length - 1) setCurrent((c) => c + 1)
  }

  const paletteClass = (ques: Question, i: number) => {
    const answered = !!answers[ques.id]
    const isMarked = !!marked[ques.id]
    if (i === current) {
      return cn(
        'ring-2 ring-neon-cyan shadow-lg shadow-neon-cyan/20',
        answered && isMarked && 'bg-violet-500 text-white',
        answered && !isMarked && 'bg-emerald-500 text-white',
        !answered && isMarked && 'bg-violet-600/90 text-white',
        !answered && !isMarked && 'bg-slate-600 text-white'
      )
    }
    if (answered && isMarked) return 'bg-violet-500/80 text-white hover:bg-violet-500'
    if (answered) return 'bg-emerald-600/80 text-white hover:bg-emerald-600'
    if (isMarked) return 'bg-violet-800/70 text-violet-100 hover:bg-violet-700'
    return 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
  }

  if (phase === 'loading') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b14]">
        <p className="text-slate-400 animate-pulse">Preparing secure exam environment…</p>
      </div>
    )
  }

  if (phase === 'gate') {
    return (
      <ExamInstructionsPanel
        title={title}
        questionCount={questions.length}
        timeLimitMinutes={timeLimit}
        marksCorrect={marksCorrect}
        marksWrong={marksWrong}
        lang={examLang}
        onLangChange={changeLang}
        rulesAcknowledged={rulesAcknowledged}
        onRulesAckChange={setRulesAcknowledged}
        submitError={submitError || startError}
        onStart={startExam}
      />
    )
  }

  if (phase === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b14] gap-4 px-6 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-400" />
        <p className="text-slate-200 font-medium max-w-md">{startError}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              startRequestedRef.current = false
              setStartError('')
              setStartKey((k) => k + 1)
              setPhase('loading')
            }}
          >
            Try again
          </Button>
          <Button className="cursor-pointer" onClick={() => navigate('/mocks')}>
            Back to mocks
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'submitting') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b14] gap-4">
        <div className="h-12 w-12 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin" />
        <p className="text-slate-300">Submitting your mock…</p>
        {violationNote && <p className="text-amber-400 text-sm max-w-md text-center px-6">{violationNote}</p>}
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b14] text-red-400">
        Failed to load test.
      </div>
    )
  }

  const q = questions[current]
  const isMarked = !!marked[q.id]
  const attempted = Object.keys(answers).length
  const markedCount = Object.values(marked).filter(Boolean).length
  const unattempted = questions.length - attempted
  const progressPct = ((current + 1) / questions.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070b14] text-white overflow-hidden">
      <ExamDisclaimerStrip lang={examLang} marksCorrect={marksCorrect} marksWrong={marksWrong} />
      <header className="shrink-0 border-b border-white/10 bg-cyber-950/95 backdrop-blur-md px-2 sm:px-4 py-2 sm:py-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-neon-cyan/80 uppercase tracking-wider font-medium">Secure exam</p>
            <h1 className="font-semibold truncate text-sm md:text-base">{title}</h1>
          </div>
          <ExamSandTimer secondsLeft={secondsLeft} totalSeconds={totalSeconds} className="hidden sm:flex" />
          <div className="sm:hidden font-mono text-lg font-bold text-neon-cyan tabular-nums">
            {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
          </div>
          <Button
            size="sm"
            className="cursor-pointer shrink-0 min-h-[44px] sm:min-h-10 sm:h-11 bg-gradient-to-r from-emerald-600 to-neon-blue hover:opacity-90 gap-2 shadow-lg shadow-emerald-900/30 px-3 sm:px-4"
            onClick={() => setSubmitOpen(true)}
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Submit</span>
          </Button>
        </div>
        <div className="max-w-7xl mx-auto mt-2 h-1 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 overscroll-contain">
          <div className="max-w-4xl mx-auto pb-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 text-[10px] sm:text-xs">
              <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-300">
                Q <strong className="text-white">{current + 1}</strong>/{questions.length}
              </span>
              <span className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300">{attempted} done</span>
              <span className="hidden min-[400px]:inline px-2 py-1 rounded-full bg-violet-500/15 text-violet-300">{markedCount} mark</span>
              <span className="px-2 py-1 rounded-full bg-amber-500/15 text-amber-300">{unattempted} left</span>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-cyber-900/80 to-cyber-950 p-4 sm:p-6 md:p-8 shadow-xl mb-4 sm:mb-6">
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-100 mb-6 sm:mb-8">{q.questionText}</p>
              <div className="space-y-3">
                {(['A', 'B', 'C', 'D'] as const).map((label) => {
                  const text =
                    label === 'A' ? q.optionA : label === 'B' ? q.optionB : label === 'C' ? q.optionC : q.optionD
                  const selected = answers[q.id] === label
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => selectAnswer(label)}
                      className={cn(
                        'w-full text-left p-3 sm:p-4 md:p-5 rounded-xl border-2 transition-all cursor-pointer flex gap-3 sm:gap-4 items-start min-h-[52px]',
                        selected
                          ? 'border-neon-cyan bg-neon-cyan/10 shadow-md shadow-neon-cyan/10'
                          : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-800/50'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-sm',
                          selected ? 'bg-neon-cyan text-cyber-950' : 'bg-slate-800 text-neon-cyan'
                        )}
                      >
                        {label}
                      </span>
                      <span className="pt-1.5 text-slate-200">{text}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn('cursor-pointer border-slate-600 col-span-2 sm:col-span-1 text-xs sm:text-sm min-h-[44px]', isMarked && 'border-violet-500 bg-violet-950/50')}
                onClick={() => toggleMark(!isMarked)}
                title="Mark for review — revisit before submit; answer stays editable"
              >
                <Bookmark className={cn('h-4 w-4', isMarked && 'fill-current')} />
                {isMarked ? (examLang === 'hi' ? 'चिह्न हटाएँ' : 'Unmark review') : examLang === 'hi' ? 'समीक्षा' : 'Mark for review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer border-violet-600/40"
                onClick={() => toggleMark(true, true)}
              >
                <Flag className="h-4 w-4" /> Mark &amp; next
              </Button>
              {answers[q.id] && (
                <Button type="button" variant="ghost" size="sm" className="cursor-pointer text-slate-500" onClick={clearAnswer}>
                  <X className="h-4 w-4" /> Clear
                </Button>
              )}
            </div>

            <div className="flex justify-between items-stretch gap-2 sm:gap-3 pb-[env(safe-area-inset-bottom)]">
              <Button
                variant="outline"
                className="cursor-pointer border-slate-600 flex-1 sm:flex-none min-h-[44px] text-sm"
                disabled={current === 0}
                onClick={() => setCurrent((c) => c - 1)}
              >
                <ChevronLeft className="h-4 w-4 shrink-0" /> <span className="sr-only sm:not-sr-only sm:inline">Previous</span>
              </Button>
              {current < questions.length - 1 ? (
                <Button className="cursor-pointer flex-1 sm:flex-none min-h-[44px] text-sm" onClick={() => setCurrent((c) => c + 1)}>
                  <span className="sr-only sm:not-sr-only sm:inline">Next</span> <ChevronRight className="h-4 w-4 shrink-0" />
                </Button>
              ) : (
                <Button className="cursor-pointer gap-2 flex-1 sm:flex-none min-h-[44px] text-sm" onClick={() => setSubmitOpen(true)}>
                  <Send className="h-4 w-4 shrink-0" /> Submit
                </Button>
              )}
            </div>
          </div>
        </main>

        <aside className="hidden lg:flex w-56 xl:w-64 flex-col border-l border-white/10 bg-cyber-950/80 p-4 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Palette</p>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((ques, i) => (
              <button
                key={ques.id}
                type="button"
                onClick={() => setCurrent(i)}
                className={cn('h-9 rounded-md text-xs font-semibold cursor-pointer transition-all', paletteClass(ques, i))}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <ul className="text-[11px] text-slate-500 mt-4 space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-500" /> Answered
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-violet-500" /> Marked
            </li>
            <li className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-700" /> Pending
            </li>
          </ul>
          <p className="text-[10px] text-slate-600 mt-6 leading-relaxed">
            Do not exit fullscreen or switch apps. Your test will submit automatically.
          </p>
        </aside>
      </div>

      <div className="lg:hidden shrink-0 border-t border-white/10 bg-cyber-950 p-2 overflow-x-auto pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-1.5 min-w-max px-1">
          {questions.map((ques, i) => (
            <button
              key={ques.id}
              type="button"
              onClick={() => setCurrent(i)}
              className={cn('h-9 w-9 sm:h-8 sm:w-8 rounded text-xs font-semibold cursor-pointer touch-target', paletteClass(ques, i))}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="mobile-dialog-sheet border-cyber-600 bg-cyber-950 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" /> Submit mock test?
            </DialogTitle>
          </DialogHeader>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>Answered: {attempted} / {questions.length}</li>
            <li>Marked for review: {markedCount}</li>
            <li>Unattempted: {unattempted}</li>
          </ul>
          {submitError && <p className="text-sm text-red-400">{submitError}</p>}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <Button variant="outline" className="cursor-pointer w-full sm:w-auto min-h-[44px]" onClick={() => setSubmitOpen(false)}>
              Continue
            </Button>
            <Button className="cursor-pointer w-full sm:w-auto min-h-[44px]" onClick={() => submitTest()}>
              Submit now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
