import { useState } from 'react'
import api, { apiErrorMessage } from '@/lib/api'
import { buildPracticePrompt } from '@/lib/buildPracticePrompt'
import { PRACTICE_TARGET_PER_SUBTOPIC } from '@/lib/practiceCatalog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Copy, FileJson } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  sectionId?: string
  subtopicSlug?: string
  sectionTitle?: string
  subtopicTitle?: string
  existingCount?: number
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

export function ImportPracticeModal({
  open,
  onOpenChange,
  onSuccess,
  sectionId,
  subtopicSlug,
  sectionTitle,
  subtopicTitle,
  existingCount = 0,
}: Props) {
  const [jsonText, setJsonText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const copyPrompt = async () => {
    if (!sectionId || !subtopicSlug) {
      setError('Select a subtopic first')
      return
    }
    try {
      const text = buildPracticePrompt(
        sectionId,
        subtopicSlug,
        sectionTitle ?? sectionId,
        subtopicTitle ?? subtopicSlug
      )
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setError('Could not copy prompt')
    }
  }

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      const body = JSON.parse(stripMarkdownFences(jsonText))
      const payload = Array.isArray(body) ? { questions: body } : body.questions ? body : { questions: [body] }
      const res = await api.post('/admin/practice/import', payload)
      onSuccess()
      onOpenChange(false)
      setJsonText('')
      alert(`Imported ${res.data.imported} practice question(s).`)
    } catch (e: unknown) {
      if (e instanceof SyntaxError) {
        setError('Invalid JSON — check commas and quotes')
      } else {
        setError(apiErrorMessage(e, 'Import failed'))
      }
    } finally {
      setLoading(false)
    }
  }

  const title = subtopicTitle ? `${sectionTitle} → ${subtopicTitle}` : 'Import practice questions'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mobile-dialog-sheet border-cyber-600 bg-cyber-950 sm:max-w-2xl overflow-y-auto max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left">
            <FileJson className="h-5 w-5 text-neon-cyan shrink-0" />
            <span className="break-words">{title}</span>
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-400 leading-relaxed">
          Import up to {PRACTICE_TARGET_PER_SUBTOPIC} MCQs per subtopic with detailed explanations. Current:{' '}
          <strong className="text-white">{existingCount}</strong> / {PRACTICE_TARGET_PER_SUBTOPIC}. Upserts by{' '}
          <code className="text-neon-cyan text-xs">questionNumber</code>.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer gap-2 w-full sm:w-auto"
          onClick={() => void copyPrompt()}
          disabled={!sectionId || !subtopicSlug}
        >
          <Copy className="h-4 w-4" /> {copied ? 'Prompt copied!' : `Copy Claude prompt (${PRACTICE_TARGET_PER_SUBTOPIC} Qs)`}
        </Button>
        <textarea
          className="w-full h-64 rounded-lg border border-cyber-700 bg-cyber-900/80 p-3 text-xs font-mono text-slate-200"
          placeholder={`{ "questions": [ { "sectionId": "${sectionId ?? 'networking'}", "subtopicSlug": "${subtopicSlug ?? 'osi-tcp-ip'}", "questionNumber": 1, ... } ] }`}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="cursor-pointer" disabled={loading || !jsonText.trim()} onClick={submit}>
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
