import { useState } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Copy, FileJson, ExternalLink } from 'lucide-react'

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

export function ImportMockModal({ open, onOpenChange, onSuccess }: Props) {
  const [jsonText, setJsonText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

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
      if (!parsed.title) {
        setError('JSON must include a "title" field')
        return
      }
      if (!parsed.difficulty) {
        setError('JSON must include a "difficulty" field (EASY, MEDIUM, or HARD)')
        return
      }
      await api.post('/admin/mocks/import', parsed)
      onSuccess()
      onOpenChange(false)
      setJsonText('')
    } catch (err: unknown) {
      if (err instanceof SyntaxError) {
        setError('Invalid JSON — remove markdown code fences and try again')
      } else {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        setError(msg || 'Import failed')
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
            <FileJson className="h-5 w-5 text-neon-cyan" /> Import Mock (Paste JSON)
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Open{' '}
            <a href="https://claude.ai" target="_blank" rel="noreferrer" className="text-neon-blue hover:underline inline-flex items-center gap-1">
              Claude.ai <ExternalLink className="h-3 w-3" />
            </a>
            , paste the daily prompt (detailed solutions + diagrams + references), paste JSON back here.
          </p>
          <Button type="button" variant="outline" className="w-full cursor-pointer" onClick={copyClaudePrompt}>
            <Copy className="h-4 w-4" /> {copied ? 'Prompt copied!' : 'Copy Claude prompt to clipboard'}
          </Button>
          <div>
            <Label>JSON from Claude (full mock object)</Label>
            <textarea
              className="mt-2 w-full h-64 rounded-lg border border-cyber-700 bg-cyber-900/80 p-3 text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-neon-blue"
              placeholder='{"title":"...","difficulty":"MEDIUM","questions":[...]}'
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button className="w-full" onClick={importMock} disabled={loading || !jsonText.trim()}>
            {loading ? 'Importing...' : 'Create Mock from JSON'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
