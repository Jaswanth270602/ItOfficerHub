import { useState } from 'react'
import api, { apiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarClock } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mockId: number
  mockTitle: string
  onSuccess: () => void
}

function todayIso() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function ScheduleMockModal({ open, onOpenChange, mockId, mockTitle, onSuccess }: Props) {
  const [liveOn, setLiveOn] = useState(todayIso())
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      await api.patch(`/admin/mocks/${mockId}/schedule`, { liveOn })
      onSuccess()
      onOpenChange(false)
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not schedule mock'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="mobile-dialog-sheet border-cyber-600 bg-cyber-950 sm:max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-neon-cyan" /> Schedule go-live
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-400">
          <strong className="text-slate-200">{mockTitle}</strong> will appear as today&apos;s mock from{' '}
          <strong className="text-neon-cyan">12:00 AM IST</strong> on the date you pick. Students see it after they refresh.
        </p>
        <div className="space-y-2">
          <Label htmlFor="liveOn">Go-live date (IST)</Label>
          <Input
            id="liveOn"
            type="date"
            min={todayIso()}
            value={liveOn}
            onChange={(e) => setLiveOn(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" className="cursor-pointer" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="cursor-pointer" disabled={busy || !liveOn} onClick={submit}>
            Schedule mock
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
