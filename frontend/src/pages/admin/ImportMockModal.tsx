import { useEffect, useState } from 'react'
import api, { apiErrorMessage } from '@/lib/api'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Copy, FileJson, Hash } from 'lucide-react'
import { EXAM_TARGET_LABELS, MOCK_CATEGORY_LABELS } from '@/lib/catalog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  }
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start >= 0 && end > start) {
    cleaned = cleaned.substring(start, end + 1)
  }
  return cleaned
}

const inputClass =
  'mt-1 w-full rounded-lg border border-cyber-700 bg-cyber-900/80 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue'

export function ImportMockModal({ open, onOpenChange, onSuccess }: Props) {
  const [jsonText, setJsonText] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState('MEDIUM')
  const [examTarget, setExamTarget] = useState('IBPS_SO_IT')
  const [mockCategory, setMockCategory] = useState('FULL')
  const [seriesDay, setSeriesDay] = useState('')
  const [nextCode, setNextCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    api
      .get('/admin/mocks/next-code', { params: { examTarget } })
      .then((r) => setNextCode(r.data.nextCode))
      .catch(() => setNextCode(''))
  }, [open, examTarget])

  const copyClaudePrompt = async () => {
    try {
      const res = await fetch('/claude-quiz-prompt.txt')
      const text = await res.text()
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setError('Could not load prompt file')
    }
  }

  const importMock = async () => {
    setLoading(true)
    setError('')
    try {
      const parsed = JSON.parse(stripMarkdownFences(jsonText))
      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        setError('JSON must include a "questions" array with at least 1 question')
        return
      }
      const payload = {
        ...parsed,
        title: title.trim() || parsed.title,
        description: description.trim() || parsed.description || '',
        difficulty: difficulty || parsed.difficulty,
        examTarget,
        mockCategory,
        seriesDay: seriesDay ? parseInt(seriesDay, 10) : parsed.seriesDay ?? null,
      }
      if (!payload.title) {
        setError('Enter a mock title above (or include title in JSON)')
        return
      }
      await api.post('/admin/mocks/import', payload)
      toast.success('Mock imported successfully')
      onSuccess()
      onOpenChange(false)
      setJsonText('')
      setTitle('')
      setDescription('')
    } catch (err: unknown) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON — remove markdown code fences and try again')
      } else {
        const msg = apiErrorMessage(err, 'Import failed')
        setError(msg)
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-neon-cyan" /> Import mock
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl border border-cyber-700 bg-cyber-950/50">
            <div className="sm:col-span-2">
              <Label htmlFor="mock-title">Test title *</Label>
              <input
                id="mock-title"
                className={inputClass}
                placeholder="IBPS SO IT — Networking Mock 1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="mock-desc">Subtitle / description</Label>
              <input
                id="mock-desc"
                className={inputClass}
                placeholder="20 Q · 15 min · mixed syllabus"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="exam-target">Category (exam track)</Label>
              <select
                id="exam-target"
                className={inputClass}
                value={examTarget}
                onChange={(e) => setExamTarget(e.target.value)}
              >
                {Object.entries(EXAM_TARGET_LABELS).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="mock-type">Mock type</Label>
              <select
                id="mock-type"
                className={inputClass}
                value={mockCategory}
                onChange={(e) => setMockCategory(e.target.value)}
              >
                {Object.entries(MOCK_CATEGORY_LABELS).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <select id="difficulty" className={inputClass} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div>
              <Label htmlFor="series-day">Challenge day (optional)</Label>
              <input
                id="series-day"
                type="number"
                min={1}
                max={30}
                className={inputClass}
                placeholder="1–30"
                value={seriesDay}
                onChange={(e) => setSeriesDay(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 text-sm text-neon-cyan font-mono bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg px-3 py-2">
              <Hash className="h-4 w-4 shrink-0" />
              Auto ID on save: <strong>{nextCode || '…'}</strong>
              <span className="text-slate-500 font-sans text-xs ml-1">(sequential per category)</span>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            Paste Claude JSON below. Each explanation needs full option breakdown (A–D), line breaks via \n, and Solution steps or a flowchart.
          </p>
          <Button type="button" variant="outline" className="w-full cursor-pointer" onClick={copyClaudePrompt}>
            <Copy className="h-4 w-4" /> {copied ? 'Prompt copied!' : 'Copy Claude prompt'}
          </Button>
          <div>
            <Label>Questions JSON</Label>
            <textarea
              className="mt-2 w-full h-52 rounded-lg border border-cyber-700 bg-cyber-900/80 p-3 text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-neon-blue"
              placeholder='{"questions":[...]} or full mock object'
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button className="w-full cursor-pointer" onClick={importMock} disabled={loading || !jsonText.trim()}>
            {loading ? 'Importing…' : 'Create mock'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
