import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export type QuestionFormValues = {
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: string
  explanation: string
  topic: string
  topicTag?: string
  orderIndex?: number
  questionNumber?: number
}

export const emptyQuestionForm = (topic = 'NETWORKING'): QuestionFormValues => ({
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'A',
  explanation: '',
  topic,
  topicTag: '',
})

const textareaClass =
  'w-full min-h-[180px] rounded-lg border border-cyber-700 bg-cyber-900/80 px-3 py-2 text-sm text-white font-mono leading-relaxed whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-neon-blue resize-y'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  values: QuestionFormValues
  onChange: (values: QuestionFormValues) => void
  onSubmit: () => void | Promise<void>
  submitLabel?: string
  showOrderField?: 'orderIndex' | 'questionNumber' | false
  showTopicTag?: boolean
}

export function QuestionEditorDialog({
  open,
  onOpenChange,
  title,
  values,
  onChange,
  onSubmit,
  submitLabel = 'Save',
  showOrderField = false,
  showTopicTag = false,
}: Props) {
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mobile-dialog-sheet border-cyber-600 bg-cyber-950 sm:max-w-2xl overflow-y-auto max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Question</Label>
            <Input
              value={values.questionText}
              onChange={(e) => onChange({ ...values, questionText: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['A', 'B', 'C', 'D'] as const).map((key) => (
              <div key={key}>
                <Label>{key}</Label>
                <Input
                  value={values[`option${key}` as keyof QuestionFormValues] as string}
                  onChange={(e) => onChange({ ...values, [`option${key}`]: e.target.value } as QuestionFormValues)}
                  required
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 items-start">
            <div>
              <Label>Correct</Label>
              <select
                className="h-10 rounded border border-cyber-700 bg-cyber-900 px-2 mt-1 block text-sm"
                value={values.correctOption}
                onChange={(e) => onChange({ ...values, correctOption: e.target.value })}
              >
                {['A', 'B', 'C', 'D'].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[10rem]">
              <Label>Topic</Label>
              <Input
                className="mt-1"
                value={values.topic}
                onChange={(e) => onChange({ ...values, topic: e.target.value })}
                placeholder="NETWORKING"
              />
            </div>
            {showTopicTag && (
              <div className="flex-1 min-w-[10rem]">
                <Label>Topic tag</Label>
                <Input
                  className="mt-1"
                  value={values.topicTag ?? ''}
                  onChange={(e) => onChange({ ...values, topicTag: e.target.value })}
                  placeholder="TCP/IP & OSI Model"
                />
              </div>
            )}
            {showOrderField === 'orderIndex' && (
              <div className="w-24">
                <Label>Order #</Label>
                <Input
                  type="number"
                  min={1}
                  className="mt-1"
                  value={values.orderIndex ?? ''}
                  onChange={(e) => onChange({ ...values, orderIndex: Number(e.target.value) || undefined })}
                />
              </div>
            )}
            {showOrderField === 'questionNumber' && (
              <div className="w-24">
                <Label>Q #</Label>
                <Input
                  type="number"
                  min={1}
                  className="mt-1"
                  value={values.questionNumber ?? ''}
                  onChange={(e) => onChange({ ...values, questionNumber: Number(e.target.value) || undefined })}
                />
              </div>
            )}
          </div>
          <div>
            <Label>Detailed solution</Label>
            <p className="text-xs text-slate-500 mt-0.5 mb-1">
              Include &quot;Option breakdown:&quot; with Option A–D and ✓ CORRECT on the right answer.
            </p>
            <textarea
              className={textareaClass}
              value={values.explanation}
              onChange={(e) => onChange({ ...values, explanation: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer" disabled={saving}>
              {saving ? 'Saving…' : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
