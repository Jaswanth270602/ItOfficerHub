import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AttemptSummary {
  attemptId: number
  mockTitle: string
  netScore: number
  maxMarks: number
  correctCount: number
  wrongCount: number
  percentage: number
  percentile: number
  rank: number
  totalTestTakers: number
}

export function HistoryPage() {
  const [history, setHistory] = useState<AttemptSummary[]>([])

  useEffect(() => {
    api.get('/attempts/history').then((r) => setHistory(r.data)).catch(() => {})
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">My Attempts</h1>
      <div className="space-y-4">
        {history.map((h) => (
          <Card key={h.attemptId} className="hover:border-neon-blue/40 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">{h.mockTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <span>Net: <strong className="text-neon-cyan">{h.netScore?.toFixed(2)}</strong> / {h.maxMarks}</span>
                <span>{h.correctCount}✓ {h.wrongCount}✗</span>
                <span>#{h.rank} of {h.totalTestTakers}</span>
                <span className="text-green-400">{h.percentile} percentile</span>
              </div>
              <Link to={`/result/${h.attemptId}`} className="text-neon-blue text-sm hover:underline cursor-pointer">
                Full Report →
              </Link>
            </CardContent>
          </Card>
        ))}
        {history.length === 0 && (
          <p className="text-slate-500 text-center">
            No attempts yet. <Link to="/dashboard" className="text-neon-blue cursor-pointer">Start a mock</Link>
          </p>
        )}
      </div>
    </div>
  )
}
