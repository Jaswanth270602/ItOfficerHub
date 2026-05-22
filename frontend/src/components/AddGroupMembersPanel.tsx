import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Check, Search, UserPlus, X } from 'lucide-react'

export interface StudentPick {
  userId: number
  displayName: string
  avatarEmoji: string
  canMessage: boolean
}

interface Props {
  open: boolean
  onClose: () => void
  conversationId: number
  existingMemberIds: number[]
  onAdded: () => void
}

export function AddGroupMembersPanel({ open, onClose, conversationId, existingMemberIds, onAdded }: Props) {
  const [students, setStudents] = useState<StudentPick[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setSelected(new Set())
    setQuery('')
    setError('')
    api.get('/social/users').then((r) => {
      setStudents(
        r.data.map((s: StudentPick & { blockedMe?: boolean }) => ({
          userId: s.userId,
          displayName: s.displayName,
          avatarEmoji: s.avatarEmoji,
          canMessage: s.canMessage !== false,
        }))
      )
    })
  }, [open])

  const available = useMemo(() => {
    const inGroup = new Set(existingMemberIds)
    return students.filter((s) => !inGroup.has(s.userId))
  }, [students, existingMemberIds])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 1) return available
    return available.filter((s) => s.displayName.toLowerCase().includes(q))
  }, [available, query])

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const addSelected = async () => {
    if (selected.size === 0) return
    setLoading(true)
    setError('')
    try {
      await api.post(`/social/conversations/${conversationId}/members`, {
        userIds: Array.from(selected),
      })
      onAdded()
      onClose()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Could not add members')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-cyber-600 bg-cyber-950 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyber-700">
          <h3 className="font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-neon-cyan" /> Add friends to group
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-cyber-800 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          <p className="text-xs text-slate-400">
            Pick students from the directory. They must have Prep Mail enabled and not be blocked.
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              className="pl-9"
              placeholder="Filter by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              No students available. Ask friends to enable &quot;Show in directory&quot; under Privacy.
            </p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((s) => {
                const on = selected.has(s.userId)
                return (
                  <button
                    key={s.userId}
                    type="button"
                    disabled={!s.canMessage}
                    onClick={() => s.canMessage && toggle(s.userId)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg text-left cursor-pointer transition-colors',
                      on ? 'bg-neon-blue/15 border border-neon-blue/40' : 'hover:bg-cyber-800/80 border border-transparent',
                      !s.canMessage && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span
                      className={cn(
                        'w-5 h-5 rounded border flex items-center justify-center shrink-0',
                        on ? 'bg-neon-blue border-neon-blue' : 'border-cyber-600'
                      )}
                    >
                      {on && <Check className="h-3 w-3 text-white" />}
                    </span>
                    <span>
                      {s.avatarEmoji} {s.displayName}
                    </span>
                    {!s.canMessage && <span className="text-xs text-slate-500 ml-auto">DM off / blocked</span>}
                  </button>
                )
              })}
            </ul>
          )}
        </div>
        <div className="p-4 border-t border-cyber-700 flex gap-2">
          <Button variant="outline" className="flex-1 cursor-pointer" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1 cursor-pointer" disabled={selected.size === 0 || loading} onClick={addSelected}>
            {loading ? 'Adding...' : `Add ${selected.size || ''} member${selected.size === 1 ? '' : 's'}`}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Inline picker for create-group flow */
export function MemberPickerList({
  students,
  selected,
  onToggle,
  existingIds = [],
}: {
  students: StudentPick[]
  selected: Set<number>
  onToggle: (id: number) => void
  existingIds?: number[]
}) {
  const inSet = new Set(existingIds)
  const list = students.filter((s) => !inSet.has(s.userId))
  if (list.length === 0) {
    return <p className="text-xs text-slate-500">No students in directory yet.</p>
  }
  return (
    <ul className="max-h-40 overflow-y-auto border border-cyber-700 rounded-lg divide-y divide-cyber-800">
      {list.map((s) => (
        <label
          key={s.userId}
          className={cn(
            'flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-cyber-800/50',
            !s.canMessage && 'opacity-50'
          )}
        >
          <input
            type="checkbox"
            checked={selected.has(s.userId)}
            disabled={!s.canMessage}
            onChange={() => s.canMessage && onToggle(s.userId)}
          />
          {s.avatarEmoji} {s.displayName}
        </label>
      ))}
    </ul>
  )
}
