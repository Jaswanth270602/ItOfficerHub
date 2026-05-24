import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Target, Trophy } from 'lucide-react'

export type ScoreShareCardData = {
  mockTitle: string
  netScore: number
  maxMarks: number
  cutoffMarks: number
  clearedCutoff: boolean
  correctCount: number
  wrongCount: number
  unattemptedCount: number
  rank: number | string
  percentile: number | null
  uniqueStudents: number
  timeTakenSeconds: number
  accuracy: number
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${sec}s`
}

export const ScoreShareCard = forwardRef<HTMLDivElement, { data: ScoreShareCardData }>(
  function ScoreShareCard({ data }, ref) {
    const ringPct = data.maxMarks > 0 ? (data.netScore / data.maxMarks) * 100 : 0

    return (
      <div
        ref={ref}
        className="w-[560px] rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0c1222] via-[#070b14] to-[#151d33] p-8 text-white shadow-2xl"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-500/30 ring-2 ring-cyan-500/40 flex items-center justify-center text-2xl shrink-0">
            🎯
          </div>
          <div>
            <p className="text-lg font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              ItOfficerHub
            </p>
            <p className="text-xs text-slate-400 uppercase tracking-widest">Mock test score card</p>
          </div>
        </div>

        <p className="text-base font-semibold text-slate-200 leading-snug mb-6">{data.mockTitle}</p>

        <div className="flex items-center gap-8 mb-6">
          <div className="relative shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(ringPct / 100) * 327} 327`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tabular-nums">{data.netScore.toFixed(1)}</span>
              <span className="text-[10px] text-slate-500">/ {data.maxMarks}</span>
            </div>
          </div>

          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase">All-India rank</p>
                <p className="text-xl font-bold text-cyan-300 tabular-nums">#{data.rank}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Percentile</p>
              <p className="text-xl font-bold text-green-400 tabular-nums">
                {data.percentile != null ? Math.round(data.percentile) : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5 text-center text-sm">
          <div className="rounded-lg bg-green-950/40 border border-green-800/40 py-2 px-1">
            <p className="font-bold text-green-400 tabular-nums">{data.correctCount}</p>
            <p className="text-[10px] text-slate-500">Correct</p>
          </div>
          <div className="rounded-lg bg-red-950/40 border border-red-800/40 py-2 px-1">
            <p className="font-bold text-red-400 tabular-nums">{data.wrongCount}</p>
            <p className="text-[10px] text-slate-500">Wrong</p>
          </div>
          <div className="rounded-lg bg-amber-950/30 border border-amber-800/30 py-2 px-1">
            <p className="font-bold text-amber-300 tabular-nums">{data.unattemptedCount}</p>
            <p className="text-[10px] text-slate-500">Skipped</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-5">
          <span>Time · {formatTime(data.timeTakenSeconds)}</span>
          <span>·</span>
          <span>Accuracy · {data.accuracy}%</span>
          <span>·</span>
          <span>{data.uniqueStudents} aspirants</span>
        </div>

        <div
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border mb-6',
            data.clearedCutoff
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          )}
        >
          <Target className="h-3.5 w-3.5" />
          {data.clearedCutoff ? `Cleared cutoff (${data.cutoffMarks})` : `Cutoff ${data.cutoffMarks} marks`}
        </div>

        <p className="text-xs text-slate-500 border-t border-slate-700/80 pt-4">
          Free daily IBPS SO IT mocks · itofficerhub.in
        </p>
      </div>
    )
  }
)

