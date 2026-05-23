import { useState } from 'react'
import api, { apiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Copy, FileJson } from 'lucide-react'

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

export function ImportPracticeModal({ open, onOpenChange, onSuccess }: Props) {
  const [jsonText, setJsonText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const copyPrompt = async () => {
    try {
      const res = await fetch('/claude-practice-prompt.txt')
      const text = await res.text()
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setError('Could not load prompt file')
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mobile-dialog-sheet border-cyber-600 bg-cyber-950 sm:max-w-2xl overflow-y-auto max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-neon-cyan" /> Import practice questions
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-400">
          One MCQ per subtopic slot. Paste Claude JSON (single object or array). Upserts if the slot already exists.
        </p>
        <Button type="button" variant="outline" size="sm" className="cursor-pointer gap-2" onClick={copyPrompt}>
          <Copy className="h-4 w-4" /> {copied ? 'Copied!' : 'Copy Claude prompt'}
        </Button>
        <textarea
          className="w-full h-64 rounded-lg border border-cyber-700 bg-cyber-900/80 p-3 text-xs font-mono text-slate-200"
          placeholder='{ "questions": [ { "sectionId": "networking", "subtopicSlug": "osi-tcp-ip", ... } ] }'
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
