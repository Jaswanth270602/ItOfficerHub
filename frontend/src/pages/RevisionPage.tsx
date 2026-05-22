import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { apiErrorMessage } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { BookMarked, RefreshCw, Trash2 } from 'lucide-react'

interface RevisionItem {
  questionId: number
  mockTestId: number
  mockTitle: string
  orderIndex: number
  questionText: string
  topic: string | null
  shortLabel: string | null
  correctOption: string
  explanation: string
  solutionImageUrl: string | null
}

export function RevisionPage() {
  const [items, setItems] = useState<RevisionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api
      .get('/attempts/revision')
      .then((r) => {
        setItems(r.data)
        setError('')
      })
      .catch((e) => setError(apiErrorMessage(e, 'Could not load revision list')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const remove = async (questionId: number) => {
    await api.delete(`/attempts/revision/${questionId}`)
    setItems((prev) => prev.filter((i) => i.questionId !== questionId))
  }

  return (
    <div className="page-container py-8 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BookMarked className="h-8 w-8 text-amber-400" />
            Revision bucket
          </h1>
          <p className="page-subtitle max-w-2xl">
            Questions you saved from mock reports — revise before the next attempt.
          </p>
        </div>
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={load} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
        </Button>
      </div>

      {error && <p className="text-red-400 text-sm mb-6">{error}</p>}
      {loading && <p className="text-slate-400 text-center py-12">Loading…</p>}

      {!loading && items.length === 0 && (
        <Card className="border-dashed border-cyber-700">
          <CardContent className="py-16 text-center text-slate-400">
            <p>No saved questions yet.</p>
            <p className="text-sm mt-2">After a mock, open your report and tap &quot;Save for revision&quot; on wrong answers.</p>
            <Link to="/mocks" className="inline-block mt-4">
              <Button className="cursor-pointer">Browse mocks</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.questionId} className="border-cyber-700">
            <CardHeader className="pb-2">
              <div className="flex justify-between gap-2">
                <CardTitle className="text-base font-medium leading-snug">{item.questionText}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer text-red-400 shrink-0"
                  onClick={() => remove(item.questionId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                {item.mockTitle} · Q{item.orderIndex}
                {item.shortLabel && <span className="ml-2 font-mono text-neon-cyan">{item.shortLabel}</span>}
              </p>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                Correct: <strong className="text-green-400">{item.correctOption}</strong>
              </p>
              {item.explanation && (
                <p className="text-slate-300 whitespace-pre-wrap line-clamp-4">{item.explanation}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
