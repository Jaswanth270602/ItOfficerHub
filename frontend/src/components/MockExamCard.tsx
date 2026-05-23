import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { EXAM_TARGET_LABELS, MOCK_CATEGORY_LABELS } from '@/lib/catalog'
import { topicShort } from '@/lib/topics'
import type { MockExam } from '@/types/mock'
import { Calendar, CheckCircle2, Clock, FileQuestion, Play, RotateCcw, Users } from 'lucide-react'

function formatReleaseDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

const DIFFICULTY_STYLE: Record<string, string> = {
  EASY: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  MEDIUM: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  HARD: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
}

interface Props {
  mock: MockExam
  onStart: (mockId: number) => void
  compact?: boolean
}

function MetaChip({ children, tone }: { children: React.ReactNode; tone: 'blue' | 'purple' | 'amber' | 'muted' }) {
  const styles = {
    blue: 'bg-sky-500/10 text-sky-300/90 border-sky-500/20',
    purple: 'bg-violet-500/10 text-violet-300/90 border-violet-500/20',
    amber: 'bg-amber-500/10 text-amber-300/90 border-amber-500/20',
    muted: 'bg-cyber-800/60 text-slate-500 border-cyber-700/50',
  }
  return <span className={cn('text-[10px] px-2 py-0.5 rounded-md border', styles[tone])}>{children}</span>
}

export function MockExamCard({ mock, onStart, compact }: Props) {
  const diffClass = DIFFICULTY_STYLE[mock.difficulty] ?? DIFFICULTY_STYLE.MEDIUM
  const examLabel = mock.examTarget ? EXAM_TARGET_LABELS[mock.examTarget] : null
  const categoryLabel = mock.mockCategory ? MOCK_CATEGORY_LABELS[mock.mockCategory] : null
  const topicLimit = compact ? 3 : 5

  return (
    <Card
      className={cn(
        'overflow-hidden border-cyber-700/80 bg-gradient-to-br from-cyber-900/90 to-cyber-950',
        'transition-all duration-200 hover:border-neon-blue/35 hover:shadow-xl hover:shadow-neon-blue/5',
        mock.attempted && 'border-l-2 border-l-emerald-500/70',
        mock.featuredToday && 'ring-1 ring-neon-cyan/25'
      )}
    >
      <CardContent className={compact ? 'p-4' : 'p-5'}>
        <div className="mb-3">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {mock.mockCode && (
              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/25">
                {mock.mockCode}
              </span>
            )}
            <span className={cn('text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border', diffClass)}>
              {mock.difficulty}
            </span>
            {mock.attempted && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Attempted
              </span>
            )}
          </div>
          <h3 className={cn('font-semibold text-white leading-snug', compact ? 'text-base' : 'text-lg')}>{mock.title}</h3>
          {!compact && mock.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{mock.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {examLabel && <MetaChip tone="blue">{examLabel}</MetaChip>}
          {categoryLabel && (
            <MetaChip tone="purple">
              {categoryLabel}
              {mock.seriesDay != null && ` · Day ${mock.seriesDay}`}
            </MetaChip>
          )}
          {mock.cumulative && <MetaChip tone="amber">Mixed syllabus</MetaChip>}
          {mock.publishedAt && (
            <MetaChip tone="muted">
              <Calendar className="h-3 w-3 inline mr-0.5 -mt-px" />
              {formatReleaseDate(mock.publishedAt)}
            </MetaChip>
          )}
        </div>

        {mock.topics && mock.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {mock.topics.slice(0, topicLimit).map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-cyber-800/80 text-slate-400 font-mono">
                {topicShort(t)}
              </span>
            ))}
            {mock.topics.length > topicLimit && (
              <span className="text-[10px] text-slate-600 self-center">+{mock.topics.length - topicLimit}</span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-4 pb-4 border-b border-cyber-800/80">
          <span className="flex items-center gap-1.5">
            <FileQuestion className="h-3.5 w-3.5" /> {mock.questionCount} questions
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {mock.timeLimitMinutes} min
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {mock.attemptsCount} attempts
          </span>
        </div>

        {mock.attempted && mock.bestNetScore != null && (
          <p className="text-sm mb-4">
            Best net <strong className="text-neon-cyan tabular-nums">{mock.bestNetScore.toFixed(2)}</strong>
            <span className={mock.latestClearedCutoff ? ' text-emerald-400' : ' text-amber-400/90'}>
              {mock.latestClearedCutoff ? ' · Cleared cutoff' : ' · Below cutoff'}
            </span>
          </p>
        )}

        <div className="flex gap-2">
          {mock.attempted && mock.latestAttemptId && (
            <Link to={`/result/${mock.latestAttemptId}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full cursor-pointer border-cyber-600">
                Report
              </Button>
            </Link>
          )}
          {(!mock.attempted || mock.allowRetake) && (
            <Button
              size="sm"
              className={cn('cursor-pointer flex-1 bg-gradient-to-r from-neon-blue to-neon-purple', mock.attempted && 'gap-1.5')}
              onClick={() => onStart(mock.id)}
            >
              {mock.attempted ? (
                <>
                  <RotateCcw className="h-4 w-4" /> Retake
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Start mock
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function MockExamCardSkeleton() {
  return (
    <Card className="border-cyber-700 animate-pulse">
      <CardContent className="p-5 space-y-3">
        <div className="h-4 bg-cyber-800 rounded w-20" />
        <div className="h-5 bg-cyber-800 rounded w-3/4" />
        <div className="h-9 bg-cyber-800 rounded" />
      </CardContent>
    </Card>
  )
}
