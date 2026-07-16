import { useEffect, useMemo, useState } from 'react'
import api, { apiErrorMessage } from '@/lib/api'
import { encodeImportBody, isWafBlockedResponse, WAF_IMPORT_HINT } from '@/lib/encodedImport'
import { buildMockPrompt } from '@/lib/buildMockPrompt'
import { parseMockImportJson } from '@/lib/parseImportJson'
import { estimateNextMockCode } from '@/lib/mockCode'
import { useAuth } from '@/lib/auth'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertCircle, CheckCircle2, Copy, FileJson, Hash } from 'lucide-react'
import { EXAM_TARGET_LABELS, MOCK_CATEGORY_LABELS } from '@/lib/catalog'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const inputClass =
  'mt-1 w-full rounded-lg border border-cyber-700 bg-cyber-900/80 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue'

export function ImportMockModal({ open, onOpenChange, onSuccess }: Props) {
  const { user, refreshSession } = useAuth()
  const [jsonText, setJsonText] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState('MEDIUM')
  const [examTarget, setExamTarget] = useState('IBPS_SO_IT')
  const [mockCategory, setMockCategory] = useState('FULL')
  const [questionCount, setQuestionCount] = useState(25)
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20)
  const [seriesDay, setSeriesDay] = useState('')
  const [nextCode, setNextCode] = useState('')
  const [nextCodeLoading, setNextCodeLoading] = useState(false)
  const [nextCodeEstimated, setNextCodeEstimated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hint, setHint] = useState('')
  const [copied, setCopied] = useState(false)

  const [serverAdmin, setServerAdmin] = useState(false)
  const isAdmin = serverAdmin && user?.role === 'ADMIN'

  const preview = useMemo(() => {
    if (!jsonText.trim()) return null
    return parseMockImportJson(jsonText)
  }, [jsonText])

  const refreshNextCode = async () => {
    if (!isAdmin) {
      setNextCode('')
      setNextCodeEstimated(false)
      return
    }
    setNextCodeLoading(true)
    try {
      const r = await api.get<{ nextCode: string }>('/admin/mocks/next-code', { params: { examTarget } })
      setNextCode(r.data.nextCode)
      setNextCodeEstimated(false)
    } catch {
      try {
        const list = await api.get<{ examTarget?: string }[]>('/admin/mocks')
        const count = list.data.filter((m) => (m.examTarget ?? 'IBPS_SO_IT') === examTarget).length
        setNextCode(estimateNextMockCode(examTarget, count))
        setNextCodeEstimated(true)
      } catch {
        setNextCode(estimateNextMockCode(examTarget, 0))
        setNextCodeEstimated(true)
      }
    } finally {
      setNextCodeLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return
    setError('')
    setHint('')
    void (async () => {
      const fresh = await refreshSession()
      const ok = fresh?.role === 'ADMIN'
      setServerAdmin(ok)
      if (!ok) {
        setError(
          fresh
            ? `Signed in as ${fresh.email} with role ${fresh.role}. Use /admin login with your ADMIN row from the database.`
            : 'Session invalid. Open /admin and sign in again.'
        )
        setNextCode('')
        return
      }
      await refreshNextCode()
    })()
  }, [open, examTarget, refreshSession])

  const copyClaudePrompt = async () => {
    if (!title.trim()) {
      setError('Enter a mock title first — it is used in the Claude prompt')
      setHint('')
      return
    }
    setError('')
    setHint('')
    try {
      const text = buildMockPrompt({
        title: title.trim(),
        description: description.trim(),
        difficulty,
        questionLimit: questionCount,
        existingCount: 0,
        examTarget,
        mockCategory,
      })
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(`Claude prompt copied (${questionCount} Qs) — paste in Claude, copy JSON-only reply`)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setError('Could not copy prompt')
    }
  }

  const importMock = async () => {
    const fresh = await refreshSession()
    if (fresh?.role !== 'ADMIN') {
      setServerAdmin(false)
      setError(
        fresh
          ? `Server says you are ${fresh.email} (${fresh.role}), not ADMIN. Log out → /admin → login with administrator email.`
          : 'Session expired. Log in again at /admin.'
      )
      return
    }
    setServerAdmin(true)

    setLoading(true)
    setError('')
    setHint('')

    const parsed = parseMockImportJson(jsonText)
    if (!parsed.ok) {
      setError(parsed.message)
      setHint(parsed.hint ?? '')
      setLoading(false)
      return
    }

    try {
      const payload = {
        ...parsed.data,
        title: title.trim() || parsed.data.title,
        description: description.trim() || parsed.data.description || '',
        difficulty: difficulty || parsed.data.difficulty,
        examTarget,
        mockCategory,
        questionCount,
        timeLimitMinutes,
        seriesDay: seriesDay ? parseInt(seriesDay, 10) : parsed.data.seriesDay ?? null,
      }
      if (!payload.title) {
        setError('Enter a mock title above (or include title in JSON)')
        setLoading(false)
        return
      }
      const res = await api.post<{ mockCode?: string | null; title?: string }>(
        '/admin/mocks/import-safe',
        encodeImportBody(payload)
      )
      const code = res.data.mockCode
      toast.success(
        code
          ? `Mock saved as ${code} — ${parsed.data.questions.length} question(s)`
          : `Mock imported — ${parsed.data.questions.length} question(s)`
      )
      onSuccess()
      onOpenChange(false)
      setJsonText('')
      setTitle('')
      setDescription('')
    } catch (err: unknown) {
      const msg = apiErrorMessage(err, 'Import failed')
      setError(msg)
      if (isWafBlockedResponse(err)) {
        setHint(WAF_IMPORT_HINT)
      } else if (msg.toLowerCase().includes('explain')) {
        setHint('Each question needs explanation + explainA, explainB, explainC, explainD (one short sentence each). No flowcharts or References required.')
      } else if (msg.toLowerCase().includes('topic')) {
        setHint('Use uppercase topic codes from the prompt (e.g. NETWORKING, DBMS).')
      }
      toast.error(msg)
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
          {!isAdmin && user && (
            <div className="flex gap-2 rounded-lg border border-amber-500/40 bg-amber-950/20 px-3 py-2 text-sm text-amber-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Logged in as <strong>{user.email}</strong> (not admin). Use <a href="/admin" className="underline text-neon-cyan">/admin</a> to sign in.</span>
            </div>
          )}

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
                placeholder="25 Q · 20 min · PK section pattern"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="q-count">Question limit *</Label>
              <input
                id="q-count"
                type="number"
                min={1}
                max={100}
                className={inputClass}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value) || 25)}
              />
              <p className="text-xs text-slate-500 mt-1">Claude prompt uses this count.</p>
            </div>
            <div>
              <Label htmlFor="time-limit">Time (minutes)</Label>
              <input
                id="time-limit"
                type="number"
                min={5}
                max={180}
                className={inputClass}
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value) || 20)}
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
            <div className="sm:col-span-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neon-cyan font-mono bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg px-3 py-2">
              <Hash className="h-4 w-4 shrink-0" />
              <span className="text-slate-400 font-sans">Auto ID on save:</span>
              <strong className="text-white">
                {nextCodeLoading ? 'Loading…' : nextCode || (isAdmin ? '—' : 'Admin login required')}
              </strong>
              {nextCode && !nextCodeLoading && (
                <span className="text-slate-500 font-sans text-xs">
                  {nextCodeEstimated ? '(estimated)' : '(next in sequence for this exam track)'}
                </span>
              )}
            </div>
          </div>

          <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
            <li>Set title &amp; question limit</li>
            <li>Copy Claude prompt → paste in Claude.ai</li>
            <li>Copy <strong className="text-slate-300">only</strong> Claude&apos;s JSON reply (starts with {'{'}, has &quot;questions&quot;)</li>
            <li>Paste below — green check = ready to import</li>
          </ol>

          <Button type="button" variant="outline" className="w-full cursor-pointer" onClick={() => void copyClaudePrompt()}>
            <Copy className="h-4 w-4" /> {copied ? 'Prompt copied!' : `Copy Claude prompt (${questionCount} Qs)`}
          </Button>

          <div>
            <Label>Questions JSON</Label>
            <textarea
              className="mt-2 w-full h-52 rounded-lg border border-cyber-700 bg-cyber-900/80 p-3 text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-neon-blue"
              placeholder='{"title":"...","questions":[{...}]}'
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value)
                setError('')
                setHint('')
              }}
            />
            {preview && (
              <p
                className={cn(
                  'mt-2 text-xs flex items-start gap-1.5',
                  preview.ok ? 'text-emerald-400' : 'text-amber-400'
                )}
              >
                {preview.ok ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    Ready: {preview.data.questions.length} question(s)
                    {preview.data.questions.length > 0 && (
                      <>
                        {' '}
                        · Q
                        {String(
                          (preview.data.questions[0].orderIndex as number) ?? 1
                        )}
                        –
                        {String(
                          (preview.data.questions[preview.data.questions.length - 1].orderIndex as number) ??
                            preview.data.questions.length
                        )}
                      </>
                    )}
                    {preview.warnings.length > 0 && (
                      <span className="text-amber-300/90"> · {preview.warnings.length} note(s) — import still allowed</span>
                    )}
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {preview.message}
                  </>
                )}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-800/50 bg-red-950/20 px-3 py-2">
              <p className="text-red-400 text-sm">{error}</p>
              {hint && <p className="text-slate-400 text-xs mt-1">{hint}</p>}
            </div>
          )}

          <Button
            className="w-full cursor-pointer"
            onClick={() => void importMock()}
            disabled={loading || !jsonText.trim() || !isAdmin || (preview !== null && !preview.ok)}
          >
            {loading ? 'Importing…' : 'Create mock'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
