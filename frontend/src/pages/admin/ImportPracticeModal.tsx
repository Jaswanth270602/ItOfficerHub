import { useState } from 'react'
import api, { apiErrorMessage } from '@/lib/api'
import { encodeImportBody } from '@/lib/encodedImport'
import { buildPracticePrompt } from '@/lib/buildPracticePrompt'
import {
  PRACTICE_INITIAL_TARGET_PER_SUBTOPIC,
  practiceImportBatchSize,
  practiceSubtopicDisplayTarget,
} from '@/lib/practiceCatalog'
import { toast } from '@/components/ui/toast'
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
  const [copied, setCopied] = useState(false)
  const displayTarget = practiceSubtopicDisplayTarget(existingCount)
  const batchSize = practiceImportBatchSize(existingCount)
  const atCap = batchSize === 0

  const copyPrompt = async () => {
    if (!sectionId || !subtopicSlug) {
      toast.warning('Select a subtopic first')
      return
    }
    if (atCap) {
      toast.warning(`This subtopic already has ${PRACTICE_INITIAL_TARGET_PER_SUBTOPIC} questions`)
      return
    }
    try {
      const text = buildPracticePrompt(
        sectionId,
        subtopicSlug,
        sectionTitle ?? sectionId,
        subtopicTitle ?? subtopicSlug,
        existingCount
      )
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Claude prompt copied to clipboard')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Could not copy prompt')
    }
  }

  const submit = async () => {
    setLoading(true)
    try {
      const body = JSON.parse(stripMarkdownFences(jsonText))
      const payload = Array.isArray(body) ? { questions: body } : body.questions ? body : { questions: [body] }
      const res = await api.post('/admin/practice/import-safe', encodeImportBody(payload))
      onSuccess()
      onOpenChange(false)
      setJsonText('')
      toast.success(`Imported ${res.data.imported} practice question(s).`)
    } catch (e: unknown) {
      if (e instanceof SyntaxError) {
        toast.error('Invalid JSON — check commas and quotes')
      } else {
        toast.error(apiErrorMessage(e, 'Import failed'))
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
          {atCap ? (
            <>This subtopic is full ({PRACTICE_INITIAL_TARGET_PER_SUBTOPIC}/{PRACTICE_INITIAL_TARGET_PER_SUBTOPIC}).</>
          ) : (
            <>
              Next batch: up to <strong className="text-white">{batchSize}</strong> new MCQs (appended after existing). Current:{' '}
              <strong className="text-white">{existingCount}</strong> / {displayTarget}. Goal:{' '}
              {PRACTICE_INITIAL_TARGET_PER_SUBTOPIC} per subtopic.
            </>
          )}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer gap-2 w-full sm:w-auto"
          onClick={() => void copyPrompt()}
          disabled={!sectionId || !subtopicSlug || atCap}
        >
          <Copy className="h-4 w-4" /> {copied ? 'Prompt copied!' : `Copy Claude prompt (${batchSize} Qs)`}
        </Button>
        <textarea
          className="w-full h-64 rounded-lg border border-cyber-700 bg-cyber-900/80 p-3 text-xs font-mono text-slate-200"
          placeholder={`{ "questions": [ { "sectionId": "${sectionId ?? 'networking'}", "subtopicSlug": "${subtopicSlug ?? 'osi-tcp-ip'}", "questionNumber": 1, ... } ] }`}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="cursor-pointer" disabled={loading || !jsonText.trim() || atCap} onClick={submit}>
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
