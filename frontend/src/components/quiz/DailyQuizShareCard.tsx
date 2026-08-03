import { forwardRef } from 'react'
import { Flame, Sparkles } from 'lucide-react'
import type { DailyQuizShareData } from '@/lib/dailyQuiz'

export const DailyQuizShareCard = forwardRef<HTMLDivElement, { data: DailyQuizShareData }>(
  function DailyQuizShareCard({ data }, ref) {
    return (
      <div
        ref={ref}
        className="w-[560px] rounded-2xl border border-cyan-500/35 bg-gradient-to-br from-[#0c1222] via-[#070b14] to-[#1a1030] p-8 text-white shadow-2xl"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="" className="h-12 w-12 rounded-full ring-2 ring-cyan-500/40" />
          <div>
            <p className="text-lg font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
              ItOfficerHub
            </p>
            <p className="text-xs text-slate-400 uppercase tracking-widest">Daily 10 · Study Q&A</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 text-amber-300">
          <Flame className="h-5 w-5" />
          <p className="text-sm font-semibold">{data.shareHeadline}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 mb-5 flex items-center gap-6">
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
                strokeDasharray={`${(data.scorePercent / 100) * 327} 327`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tabular-nums">
                {data.correctCount}/{data.totalQuestions}
              </span>
              <span className="text-[10px] text-slate-500">correct</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Score</p>
            <p className="text-4xl font-bold text-cyan-300 tabular-nums">{data.scorePercent}%</p>
            <p className="text-xs text-slate-400 mt-2">{data.quizDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-violet-300 mb-5">
          <Sparkles className="h-4 w-4" />
          Beat my Daily 10 — free, no login
        </div>

        <p className="text-xs text-slate-500 border-t border-slate-700/80 pt-4">
          Fresh 10 questions every day · itofficerhub.in/daily-quiz
        </p>
      </div>
    )
  }
)
