import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { toast } from '@/components/ui/toast'
import { buildPracticePrompt } from '@/lib/buildPracticePrompt'
import { PRACTICE_INITIAL_TARGET_PER_SUBTOPIC, practiceImportBatchSize } from '@/lib/practiceCatalog'
import { ImportPracticeModal } from '@/pages/admin/ImportPracticeModal'
import {
  QuestionEditorDialog,
  emptyQuestionForm,
  type QuestionFormValues,
} from '@/components/admin/QuestionEditorDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Copy, FileJson, Pencil, Plus, Trash2 } from 'lucide-react'

interface PracticeQuestion {
  id: number
  sectionId: string
  subtopicSlug: string
  questionNumber: number
  topic: string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: string
  explanation: string
  published: boolean
}

function toForm(q: PracticeQuestion): QuestionFormValues {
  return {
    questionText: q.questionText,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctOption: q.correctOption,
    explanation: q.explanation ?? '',
    topic: q.topic,
    questionNumber: q.questionNumber,
  }
}

export function AdminPracticeSubtopicPage() {
  const { sectionId, subtopicSlug } = useParams()
  const [sectionTitle, setSectionTitle] = useState('')
  const [subtopicTitle, setSubtopicTitle] = useState('')
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [importOpen, setImportOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<QuestionFormValues>(emptyQuestionForm())

  const load = () => {
    if (!sectionId || !subtopicSlug) return
    api.get('/admin/practice/catalog').then((r) => {
      const sec = r.data.sections.find((s: { id: string }) => s.id === sectionId)
      setSectionTitle(sec?.title ?? sectionId)
      const st = sec?.subtopics.find((s: { slug: string }) => s.slug === subtopicSlug)
      setSubtopicTitle(st?.title ?? subtopicSlug)
    })
    api
      .get(`/admin/practice/sections/${sectionId}/topics/${subtopicSlug}/questions`)
      .then((r) => setQuestions(r.data))
  }

  useEffect(() => { load() }, [sectionId, subtopicSlug])

  const batchSize = practiceImportBatchSize(questions.length)
  const atLimit = questions.length >= PRACTICE_INITIAL_TARGET_PER_SUBTOPIC

  const copyPrompt = async () => {
    if (!sectionId || !subtopicSlug || batchSize === 0) return
    try {
      const text = buildPracticePrompt(sectionId, subtopicSlug, sectionTitle, subtopicTitle, questions.length)
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Claude prompt copied')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Could not copy prompt')
    }
  }

  const openAdd = () => {
    setEditingId(null)
    setForm({ ...emptyQuestionForm(), questionNumber: questions.length + 1 })
    setEditorOpen(true)
  }

  const openEdit = (q: PracticeQuestion) => {
    setEditingId(q.id)
    setForm(toForm(q))
    setEditorOpen(true)
  }

  const saveQuestion = async () => {
    if (!sectionId || !subtopicSlug) return
    try {
      const payload = {
        sectionId,
        subtopicSlug,
        ...form,
        published: true,
      }
      if (editingId) {
        await api.put(`/admin/practice/questions/${editingId}`, payload)
        toast.success('Question updated')
      } else {
        await api.post('/admin/practice/questions', payload)
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
      await api.delete(`/admin/practice/questions/${qid}`)
      load()
      toast.success('Question deleted')
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Delete failed'))
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 pb-12">
      <Link to="/admin/practice" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-neon-cyan mb-4">
        <ArrowLeft className="h-4 w-4" /> Practice Q&amp;A
      </Link>
      <h1 className="text-2xl font-bold">{subtopicTitle}</h1>
      <p className="text-sm text-slate-400 mt-1">
        {sectionTitle} · {questions.length} / {PRACTICE_INITIAL_TARGET_PER_SUBTOPIC} questions
      </p>

      <div className="flex flex-wrap gap-2 my-6">
        <Button className="cursor-pointer gap-1.5" onClick={openAdd} disabled={atLimit}>
          <Plus className="h-4 w-4" /> Add question
        </Button>
        <Button variant="outline" className="cursor-pointer gap-1.5" onClick={() => setImportOpen(true)} disabled={atLimit}>
          <FileJson className="h-4 w-4" /> Import JSON
        </Button>
        <Button variant="outline" className="cursor-pointer gap-1.5" onClick={() => void copyPrompt()} disabled={batchSize === 0}>
          <Copy className="h-4 w-4" /> {copied ? 'Copied!' : `Copy prompt (${batchSize})`}
        </Button>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <Card key={q.id}>
            <CardContent className="pt-4 flex flex-col sm:flex-row justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium leading-snug">Q{q.questionNumber}. {q.questionText}</p>
                <p className="text-xs text-slate-500 mt-1">Answer: {q.correctOption} · {q.topic}</p>
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
          <p className="text-sm text-slate-400 text-center py-8">No questions — add manually, import JSON, or use Claude prompt.</p>
        )}
      </div>

      <QuestionEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        title={editingId ? `Edit Q${form.questionNumber ?? ''}` : 'Add question'}
        values={form}
        onChange={setForm}
        onSubmit={saveQuestion}
        submitLabel={editingId ? 'Update' : 'Add'}
        showOrderField="questionNumber"
      />

      <ImportPracticeModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={load}
        sectionId={sectionId}
        subtopicSlug={subtopicSlug}
        sectionTitle={sectionTitle}
        subtopicTitle={subtopicTitle}
        existingCount={questions.length}
      />
    </div>
  )
}
