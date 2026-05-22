import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { EXAM_TARGET_LABELS, MOCK_CATEGORY_LABELS } from '@/lib/catalog'
import { topicShort } from '@/lib/topics'
import type { MockExam } from '@/types/mock'
import { CheckCircle2, Clock, FileQuestion, Play, RotateCcw, Users } from 'lucide-react'

function formatReleaseDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

interface Props {
  mock: MockExam
  onStart: (mockId: number) => void
  compact?: boolean
}

export function MockExamCard({ mock, onStart, compact }: Props) {
  return (
    <Card
      className={cn(
        'transition-all hover:shadow-lg hover:shadow-neon-blue/5',
        mock.attempted ? 'border-green-600/30' : 'hover:border-neon-blue/40',
        mock.featuredToday && 'ring-1 ring-neon-cyan/30'
      )}
    >
      <CardHeader className={compact ? 'pb-2' : undefined}>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className={cn('pr-2', compact ? 'text-base' : 'text-lg')}>{mock.title}</CardTitle>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-xs px-2 py-1 rounded bg-neon-purple/20 text-neon-purple">
              {mock.difficulty}
            </span>
            {mock.mockCategory && MOCK_CATEGORY_LABELS[mock.mockCategory] && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/25">
                {MOCK_CATEGORY_LABELS[mock.mockCategory]}
                {mock.seriesDay != null && ` · D${mock.seriesDay}`}
              </span>
            )}
            {mock.examTarget && EXAM_TARGET_LABELS[mock.examTarget] && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-800 text-slate-400 border border-cyber-700">
                {EXAM_TARGET_LABELS[mock.examTarget]}
              </span>
            )}
            {mock.cumulative && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Full syllabus
              </span>
            )}
            {mock.publishedAt && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-800 text-slate-400 border border-cyber-700">
                {formatReleaseDate(mock.publishedAt)}
              </span>
            )}
            {mock.attempted && (
              <span className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Done
              </span>
            )}
          </div>
        </div>
        {!compact && <CardDescription>{mock.description}</CardDescription>}
        {mock.topics && mock.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {mock.topics.slice(0, compact ? 4 : 6).map((t) => (
              <span
                key={t}
                className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-800 text-slate-400 border border-cyber-700 font-mono"
              >
                {topicShort(t)}
              </span>
            ))}
            {mock.topics.length > (compact ? 4 : 6) && (
              <span className="text-[10px] text-slate-500">+{mock.topics.length - (compact ? 4 : 6)}</span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 text-sm text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <FileQuestion className="h-4 w-4" /> {mock.questionCount} Qs
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {mock.timeLimitMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" /> {mock.attemptsCount}
          </span>
        </div>
        {mock.attempted && mock.bestNetScore != null && (
          <p className="text-sm mb-3">
            Best net: <strong className="text-neon-cyan">{mock.bestNetScore.toFixed(2)}</strong>
            {mock.latestClearedCutoff ? (
              <span className="text-green-400 ml-2">· Cleared cutoff</span>
            ) : (
              <span className="text-amber-400 ml-2">· Below cutoff</span>
            )}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {mock.attempted && mock.latestAttemptId && (
            <Link to={`/result/${mock.latestAttemptId}`} className="flex-1 min-w-[100px]">
              <Button variant="outline" size={compact ? 'sm' : 'default'} className="w-full cursor-pointer">
                Report
              </Button>
            </Link>
          )}
          {(!mock.attempted || mock.allowRetake) && (
            <Button
              size={compact ? 'sm' : 'default'}
              className={cn('cursor-pointer flex-1 min-w-[100px]', mock.attempted && 'gap-2')}
              onClick={() => onStart(mock.id)}
            >
              {mock.attempted ? (
                <>
                  <RotateCcw className="h-4 w-4" /> Retake
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Start
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
      <CardHeader>
        <div className="h-5 bg-cyber-800 rounded w-3/4" />
        <div className="h-3 bg-cyber-800 rounded w-full mt-2" />
      </CardHeader>
      <CardContent>
        <div className="h-9 bg-cyber-800 rounded" />
      </CardContent>
    </Card>
  )
}
