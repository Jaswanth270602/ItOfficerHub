import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '@/lib/api'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
}

const textareaClass =
  'w-full min-h-[200px] rounded-lg border border-cyber-700 bg-cyber-900/80 px-3 py-2 text-sm text-white font-mono leading-relaxed whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-neon-blue resize-y'

export function AdminMockPage() {
  const { id } = useParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [form, setForm] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    explanation: '',
    topic: 'NETWORKING',
  })

  const load = () => api.get(`/admin/mocks/${id}/questions`).then((r) => setQuestions(r.data))

  useEffect(() => { load() }, [id])

  const addQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/admin/questions', { mockTestId: Number(id), ...form })
    setForm({ questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: '', topic: 'NETWORKING' })
    load()
  }

  const deleteQ = async (qid: number) => {
    if (!(await toast.confirm('Delete question?'))) return
    await api.delete(`/admin/questions/${qid}`)
    load()
    toast.success('Question deleted')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Manage Questions ({questions.length})</h1>

      <Card className="mb-8">
        <CardHeader><CardTitle>Add Question</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={addQuestion} className="space-y-3">
            <div><Label>Question</Label><Input value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>A</Label><Input value={form.optionA} onChange={(e) => setForm({ ...form, optionA: e.target.value })} required /></div>
              <div><Label>B</Label><Input value={form.optionB} onChange={(e) => setForm({ ...form, optionB: e.target.value })} required /></div>
              <div><Label>C</Label><Input value={form.optionC} onChange={(e) => setForm({ ...form, optionC: e.target.value })} required /></div>
              <div><Label>D</Label><Input value={form.optionD} onChange={(e) => setForm({ ...form, optionD: e.target.value })} required /></div>
            </div>
            <div className="flex flex-wrap gap-4 items-start">
              <div>
                <Label>Correct</Label>
                <select
                  className="h-10 rounded border border-cyber-700 bg-cyber-900 px-2 mt-1 block"
                  value={form.correctOption}
                  onChange={(e) => setForm({ ...form, correctOption: e.target.value })}
                >
                  {['A', 'B', 'C', 'D'].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[min(100%,20rem)]">
                <Label>Topic</Label>
                <Input
                  className="mt-1"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="NETWORKING"
                />
              </div>
            </div>
            <div>
              <Label>Detailed solution</Label>
              <p className="text-xs text-slate-500 mt-0.5 mb-1">
                Use line breaks. Include &quot;Option breakdown:&quot; with Option A–D, ✓ CORRECT on the right answer.
              </p>
              <textarea
                className={textareaClass}
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                placeholder={'Core concept:\n• ...\n\nOption breakdown:\n• Option A — ...\n• Option B — ...\n• Option C — ✓ CORRECT — ...\n• Option D — ...'}
                required
              />
            </div>
            <Button type="submit">Add Question</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {questions.map((q) => (
          <Card key={q.id}>
            <CardContent className="pt-4 flex justify-between gap-4">
              <div>
                <p className="font-medium">Q{q.orderIndex}. {q.questionText}</p>
                <p className="text-xs text-slate-500 mt-1">Answer: {q.correctOption} · {q.topic}</p>
              </div>
              <Button size="sm" variant="destructive" onClick={() => deleteQ(q.id)}>Delete</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
