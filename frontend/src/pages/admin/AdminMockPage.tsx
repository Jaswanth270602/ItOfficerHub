import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { toast } from '@/components/ui/toast'
import { buildMockPrompt, mockImportBatchSize } from '@/lib/buildMockPrompt'
import { EXAM_TARGET_LABELS, MOCK_CATEGORY_LABELS } from '@/lib/catalog'
import {
  QuestionEditorDialog,
  emptyQuestionForm,
  type QuestionFormValues,
} from '@/components/admin/QuestionEditorDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowLeft, Copy, Pencil, Plus, Save, Trash2 } from 'lucide-react'

interface MockMeta {
  id: number
  title: string
  description: string
  difficulty: string
  questionCount: number
  timeLimitMinutes: number
  mockCode: string | null
  examTarget: string
  mockCategory: string
  allowRetake: boolean
}

interface Question {
  id: number
  orderIndex: number
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: string
  explanation: string
  topic: string
  topicTag: string | null
}

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const

const textareaClass =
  'w-full min-h-[88px] rounded-lg border border-cyber-700 bg-cyber-900/80 px-3 py-2 text-sm text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-neon-blue resize-y'

const selectClass =
  'h-10 w-full rounded-lg border border-cyber-700 bg-cyber-900 px-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue'

function toForm(q: Question): QuestionFormValues {
  return {
    questionText: q.questionText,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctOption: q.correctOption,
    explanation: q.explanation,
    topic: q.topic ?? 'NETWORKING',
    topicTag: q.topicTag ?? '',
    orderIndex: q.orderIndex,
  }
}

function optionText(q: Question, key: 'A' | 'B' | 'C' | 'D') {
  return q[`option${key}` as keyof Pick<Question, 'optionA' | 'optionB' | 'optionC' | 'optionD'>]
}

export function AdminMockPage() {
  const { id } = useParams()
  const mockId = Number(id)
  const [mock, setMock] = useState<MockMeta | null>(null)
  const [metaForm, setMetaForm] = useState({
    title: '',
    description: '',
    difficulty: 'MEDIUM',
    examTarget: 'IBPS_SO_IT',
    mockCategory: 'FULL',
    questionCount: 20,
    timeLimitMinutes: 15,
    allowRetake: false,
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [savingMock, setSavingMock] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<QuestionFormValues>(emptyQuestionForm())
  const [expandedQ, setExpandedQ] = useState<number | null>(null)

  const load = () => {
    if (!mockId) return
    api.get(`/admin/mocks/${mockId}`).then((r) => {
      const data = r.data as MockMeta
      setMock(data)
      setMetaForm({
        title: data.title,
        description: data.description ?? '',
        difficulty: data.difficulty ?? 'MEDIUM',
        examTarget: data.examTarget ?? 'IBPS_SO_IT',
        mockCategory: data.mockCategory ?? 'FULL',
        questionCount: data.questionCount,
        timeLimitMinutes: data.timeLimitMinutes,
        allowRetake: data.allowRetake ?? false,
      })
    })
    api.get(`/admin/mocks/${mockId}/questions`).then((r) => setQuestions(r.data))
  }

  useEffect(() => { load() }, [mockId])

  const atLimit = questions.length >= metaForm.questionCount
  const batchSize = mockImportBatchSize(metaForm.questionCount, questions.length)

  const saveMock = async () => {
    if (!metaForm.title.trim()) {
      toast.warning('Title is required')
      return
    }
    setSavingMock(true)
    try {
      await api.put(`/admin/mocks/${mockId}`, {
        title: metaForm.title.trim(),
        description: metaForm.description,
        difficulty: metaForm.difficulty,
        examTarget: metaForm.examTarget,
        mockCategory: metaForm.mockCategory,
        questionCount: metaForm.questionCount,
        timeLimitMinutes: metaForm.timeLimitMinutes,
        allowRetake: metaForm.allowRetake,
      })
      load()
      toast.success('Mock saved')
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Could not save mock'))
    } finally {
      setSavingMock(false)
    }
  }

  const copyPrompt = async () => {
    if (batchSize === 0) {
      toast.warning('Question limit reached — increase limit or delete questions')
      return
    }
    try {
      const text = buildMockPrompt({
        title: metaForm.title.trim() || 'Mock',
        difficulty: metaForm.difficulty,
        questionLimit: metaForm.questionCount,
        existingCount: questions.length,
        examTarget: metaForm.examTarget,
        mockCategory: metaForm.mockCategory,
      })
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(`Claude prompt copied (${batchSize} Qs)`)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Could not copy prompt')
    }
  }

  const openAdd = () => {
    setEditingId(null)
    setForm({ ...emptyQuestionForm(), orderIndex: questions.length + 1 })
    setEditorOpen(true)
  }

  const openEdit = (q: Question) => {
    setEditingId(q.id)
    setForm(toForm(q))
    setEditorOpen(true)
  }

  const saveQuestion = async () => {
    try {
      const payload = {
        mockTestId: mockId,
        ...form,
        orderIndex: form.orderIndex ?? questions.length + 1,
      }
      if (editingId) {
        await api.put(`/admin/questions/${editingId}`, payload)
        toast.success('Question updated')
      } else {
        await api.post('/admin/questions', payload)
        toast.success('Question added')
      }
      setEditorOpen(false)
      load()
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Save failed'))
    }
  }

  const deleteQ = async (qid: number) => {
    if (!(await toast.confirm('Delete this question?'))) return
    try {
      await api.delete(`/admin/questions/${qid}`)
      load()
      toast.success('Question deleted')
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Delete failed'))
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 pb-12">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-neon-cyan mb-4">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      {mock && (
        <div className="mb-6">
          <p className="text-sm text-slate-400">
            {mock.mockCode && <span className="font-mono text-neon-cyan mr-2">{mock.mockCode}</span>}
            {questions.length} / {metaForm.questionCount} questions · {metaForm.timeLimitMinutes} min
          </p>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Edit mock</CardTitle>
          <CardDescription>Title, description, exam tags, timing, and question limit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mock-title">Title</Label>
            <Input
              id="mock-title"
              className="mt-1"
              value={metaForm.title}
              onChange={(e) => setMetaForm((s) => ({ ...s, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="mock-desc">Description</Label>
            <textarea
              id="mock-desc"
              className={cn(textareaClass, 'mt-1')}
              value={metaForm.description}
              onChange={(e) => setMetaForm((s) => ({ ...s, description: e.target.value }))}
              placeholder="What this mock covers — shown to students on the dashboard."
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mock-diff">Difficulty</Label>
              <select
                id="mock-diff"
                className={cn(selectClass, 'mt-1')}
                value={metaForm.difficulty}
                onChange={(e) => setMetaForm((s) => ({ ...s, difficulty: e.target.value }))}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="mock-exam">Exam target</Label>
              <select
                id="mock-exam"
                className={cn(selectClass, 'mt-1')}
                value={metaForm.examTarget}
                onChange={(e) => setMetaForm((s) => ({ ...s, examTarget: e.target.value }))}
              >
                {Object.entries(EXAM_TARGET_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="mock-cat">Category</Label>
              <select
                id="mock-cat"
                className={cn(selectClass, 'mt-1')}
                value={metaForm.mockCategory}
                onChange={(e) => setMetaForm((s) => ({ ...s, mockCategory: e.target.value }))}
              >
                {Object.entries(MOCK_CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="q-limit">Question limit</Label>
              <Input
                id="q-limit"
                type="number"
                min={1}
                max={100}
                className="mt-1"
                value={metaForm.questionCount}
                onChange={(e) => setMetaForm((s) => ({ ...s, questionCount: Number(e.target.value) || 20 }))}
              />
            </div>
            <div>
              <Label htmlFor="time-limit">Time limit (minutes)</Label>
              <Input
                id="time-limit"
                type="number"
                min={5}
                max={180}
                className="mt-1"
                value={metaForm.timeLimitMinutes}
                onChange={(e) => setMetaForm((s) => ({ ...s, timeLimitMinutes: Number(e.target.value) || 15 }))}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={metaForm.allowRetake}
              onChange={(e) => setMetaForm((s) => ({ ...s, allowRetake: e.target.checked }))}
            />
            Allow retakes after first attempt
          </label>
          <Button className="cursor-pointer gap-1.5" disabled={savingMock} onClick={() => void saveMock()}>
            <Save className="h-4 w-4" /> {savingMock ? 'Saving…' : 'Save mock'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 mb-4">
        <h2 className="text-lg font-semibold w-full sm:w-auto sm:flex-1">Questions</h2>
        <Button className="cursor-pointer gap-1.5" onClick={openAdd} disabled={atLimit}>
          <Plus className="h-4 w-4" /> Add question
        </Button>
        <Button variant="outline" className="cursor-pointer gap-1.5" onClick={() => void copyPrompt()} disabled={batchSize === 0}>
          <Copy className="h-4 w-4" /> {copied ? 'Copied!' : `Copy Claude prompt (${batchSize})`}
        </Button>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <Card key={q.id}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug">Q{q.orderIndex}. {q.questionText}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {q.topic}{q.topicTag ? ` · ${q.topicTag}` : ''}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="cursor-pointer gap-1" onClick={() => openEdit(q)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="cursor-pointer gap-1" onClick={() => void deleteQ(q.id)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-1.5 text-sm">
                {(['A', 'B', 'C', 'D'] as const).map((key) => (
                  <p
                    key={key}
                    className={cn(
                      'rounded-md px-2.5 py-1.5 border text-xs sm:text-sm',
                      q.correctOption === key
                        ? 'border-green-500/40 bg-green-950/30 text-green-300'
                        : 'border-cyber-700/80 bg-cyber-900/40 text-slate-400'
                    )}
                  >
                    <span className="font-semibold mr-1">{key}.</span>
                    {optionText(q, key)}
                    {q.correctOption === key && <span className="ml-1 text-green-400">✓</span>}
                  </p>
                ))}
              </div>

              <button
                type="button"
                className="text-xs text-neon-cyan hover:underline cursor-pointer"
                onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
              >
                {expandedQ === q.id ? 'Hide solution' : 'Show solution'}
              </button>
              {expandedQ === q.id && (
                <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans leading-relaxed rounded-lg border border-cyber-700 bg-cyber-900/50 p-3 max-h-48 overflow-y-auto">
                  {q.explanation}
                </pre>
              )}
            </CardContent>
          </Card>
        ))}
        {questions.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">
            No questions yet — set question limit, copy Claude prompt, or add manually.
          </p>
        )}
      </div>

      <QuestionEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        title={editingId ? `Edit Q${form.orderIndex ?? ''}` : 'Add question'}
        values={form}
        onChange={setForm}
        onSubmit={saveQuestion}
        submitLabel={editingId ? 'Update' : 'Add'}
        showOrderField="orderIndex"
        showTopicTag
      />
    </div>
  )
}
