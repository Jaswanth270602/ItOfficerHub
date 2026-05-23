import { cn } from '@/lib/utils'

function splitExplanation(text: string): { body: string; diagram: string | null } {
  const lines = text.split('\n')
  const diagramStart = lines.findIndex((l) => {
    const t = l.trim().toLowerCase()
    return (
      t.includes('graph ') ||
      t.includes('flowchart') ||
      t.includes('sequencediagram') ||
      t.startsWith('flow:') ||
      t.includes('ascii diagram') ||
      l.includes('-->') ||
      l.includes('→')
    )
  })
  if (diagramStart < 0) return { body: text, diagram: null }
  let diagramEnd = diagramStart
  while (diagramEnd < lines.length && lines[diagramEnd].trim() !== '' && !lines[diagramEnd].trim().toLowerCase().startsWith('references:')) {
    diagramEnd++
  }
  const diagramLines = lines.slice(diagramStart, diagramEnd)
  const bodyLines = [...lines.slice(0, diagramStart), ...lines.slice(diagramEnd)]
  return {
    body: bodyLines.join('\n').trim(),
    diagram: diagramLines.join('\n').trim() || null,
  }
}

export function SolutionExplanation({ text, className }: { text: string; className?: string }) {
  const { body, diagram } = splitExplanation(text)

  return (
    <div className={cn('space-y-4', className)}>
      <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">{body}</div>
      {diagram && (
        <div className="rounded-xl border border-neon-cyan/30 bg-cyber-950/80 p-4 overflow-x-auto">
          <p className="text-[10px] uppercase tracking-widest text-neon-cyan mb-2 font-semibold">Flowchart / diagram</p>
          <pre className="text-sm font-mono text-emerald-200/90 leading-snug whitespace-pre">{diagram}</pre>
        </div>
      )}
    </div>
  )
}
