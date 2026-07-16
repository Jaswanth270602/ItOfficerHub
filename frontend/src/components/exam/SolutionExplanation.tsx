import { cn } from '@/lib/utils'
import {
  extractMainExplanation,
  extractOptionExplains,
  type OptionLetter,
} from '@/lib/composeExplanation'

const LETTERS: OptionLetter[] = ['A', 'B', 'C', 'D']

export function SolutionExplanation({
  text,
  className,
  correctOption,
}: {
  text: string
  className?: string
  correctOption?: string
}) {
  const main = extractMainExplanation(text)
  const optionMap = extractOptionExplains(text)
  const hasOptions = LETTERS.some((l) => Boolean(optionMap[l]))
  const correct = correctOption?.trim().toUpperCase()

  return (
    <div className={cn('space-y-4', className)}>
      {main ? (
        <div className="rounded-lg border border-cyber-700/70 bg-cyber-950/40 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neon-cyan/80 mb-1.5">Explanation</p>
          <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">{main}</p>
        </div>
      ) : null}

      {hasOptions ? (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Option-wise</p>
          {LETTERS.map((letter) => {
            const body = optionMap[letter]
            if (!body) return null
            const isCorrect = letter === correct
            return (
              <div
                key={letter}
                className={cn(
                  'rounded-lg border px-3 py-2.5',
                  isCorrect
                    ? 'border-emerald-500/50 bg-emerald-950/30'
                    : 'border-cyber-700/60 bg-cyber-900/30'
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold',
                      isCorrect
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-cyber-800 text-slate-400'
                    )}
                  >
                    {letter}
                  </span>
                  <div className="min-w-0 flex-1">
                    {isCorrect && (
                      <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-400/90 mb-0.5">
                        Correct answer
                      </p>
                    )}
                    <p
                      className={cn(
                        'text-sm leading-relaxed whitespace-pre-wrap',
                        isCorrect ? 'text-emerald-50/95' : 'text-slate-300'
                      )}
                    >
                      {body.replace(/^[—:\-–]\s*/, '').replace(/^[✓✔]\s*CORRECT\s*[—:\-–]?\s*/i, '').trim()}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">{text}</p>
      )}
    </div>
  )
}
