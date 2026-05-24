import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { toast } from '@/components/ui/toast'
import { buildMockPrompt, mockImportBatchSize } from '@/lib/buildMockPrompt'
import {
  QuestionEditorDialog,
  emptyQuestionForm,
  type QuestionFormValues,
} from '@/components/admin/QuestionEditorDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Copy, Pencil, Plus, Trash2 } from 'lucide-react'

interface MockMeta {
  id: number
  title: string
  description: string
  difficulty: string
  questionCount: number
  timeLimitMinutes: number
  mockCode: string | null
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

export function AdminMockPage() {
  const { id } = useParams()
  const mockId = Number(id)
  const [mock, setMock] = useState<MockMeta | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [settings, setSettings] = useState({ questionCount: 20, timeLimitMinutes: 15 })
  const [savingSettings, setSavingSettings] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<QuestionFormValues>(emptyQuestionForm())

  const load = () => {
    if (!mockId) return
    api.get(`/admin/mocks/${mockId}`).then((r) => {
      setMock(r.data)
      setSettings({ questionCount: r.data.questionCount, timeLimitMinutes: r.data.timeLimitMinutes })
    })
    api.get(`/admin/mocks/${mockId}/questions`).then((r) => setQuestions(r.data))
  }

  useEffect(() => { load() }, [mockId])

  const atLimit = questions.length >= (mock?.questionCount ?? settings.questionCount)
  const batchSize = mockImportBatchSize(mock?.questionCount ?? settings.questionCount, questions.length)

  const saveSettings = async () => {
    if (!mock) return
    setSavingSettings(true)
    try {
      await api.put(`/admin/mocks/${mockId}`, {
        title: mock.title,
        description: mock.description,
        difficulty: mock.difficulty,
        questionCount: settings.questionCount,
        timeLimitMinutes: settings.timeLimitMinutes,
      })
      load()
      toast.success('Mock settings saved')
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Could not save settings'))
    } finally {
      setSavingSettings(false)
    }
  }

  const copyPrompt = async () => {
    if (!mock || batchSize === 0) {
      toast.warning('Question limit reached — increase limit or delete questions')
      return
    }
    try {
      const text = buildMockPrompt({
        title: mock.title,
        difficulty: mock.difficulty,
        questionLimit: mock.questionCount,
        existingCount: questions.length,
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
          <h1 className="text-2xl font-bold">{mock.title}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {mock.mockCode && <span className="font-mono text-neon-cyan mr-2">{mock.mockCode}</span>}
            {questions.length} / {mock.questionCount} questions · {mock.timeLimitMinutes} min
          </p>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Mock settings</CardTitle></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="q-limit">Question limit</Label>
            <Input
              id="q-limit"
              type="number"
              min={1}
              max={100}
              className="mt-1"
              value={settings.questionCount}
              onChange={(e) => setSettings((s) => ({ ...s, questionCount: Number(e.target.value) || 20 }))}
            />
            <p className="text-xs text-slate-500 mt-1">Claude prompt generates up to this many questions.</p>
          </div>
          <div className="flex-1">
            <Label htmlFor="time-limit">Time limit (minutes)</Label>
            <Input
              id="time-limit"
              type="number"
              min={5}
              max={180}
              className="mt-1"
              value={settings.timeLimitMinutes}
              onChange={(e) => setSettings((s) => ({ ...s, timeLimitMinutes: Number(e.target.value) || 15 }))}
            />
          </div>
          <Button className="cursor-pointer shrink-0" disabled={savingSettings} onClick={() => void saveSettings()}>
            {savingSettings ? 'Saving…' : 'Save settings'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 mb-6">
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
            <CardContent className="pt-4 flex flex-col sm:flex-row justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium leading-snug">Q{q.orderIndex}. {q.questionText}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Answer: {q.correctOption} · {q.topic}
                  {q.topicTag ? ` · ${q.topicTag}` : ''}
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
            </CardContent>
          </Card>
        ))}
        {questions.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No questions yet — set question limit, copy Claude prompt, or add manually.</p>
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
