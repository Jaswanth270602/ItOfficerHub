import { cn } from '@/lib/utils'

const SECTION_HEADERS = [
  'core concept',
  'solution steps',
  'option breakdown',
  'common trap',
  'key distinction',
  'exam tip',
  'flowchart',
  'references',
] as const

function isSectionHeader(line: string): boolean {
  const t = line.trim().replace(/:$/, '').toLowerCase()
  return SECTION_HEADERS.some((h) => t === h || t.startsWith(h + ':'))
}

function splitExplanation(text: string): { body: string; diagram: string | null; references: string | null } {
  const lines = text.split('\n')
  const diagramStart = lines.findIndex((l) => {
    const t = l.trim().toLowerCase()
    return (
      t === 'flowchart:' ||
      t.startsWith('flowchart:') ||
      t.includes('graph td') ||
      t.includes('graph lr') ||
      (t.includes('graph ') && !t.startsWith('core concept')) ||
      t.includes('sequencediagram') ||
      t.startsWith('flow:') ||
      t.includes('ascii diagram') ||
      (l.includes('-->') && !l.trim().startsWith('•')) ||
      (l.includes('→') && !l.trim().startsWith('•'))
    )
  })

  const refStart = lines.findIndex((l) => l.trim().toLowerCase().startsWith('references:'))

  let diagram: string | null = null
  let references: string | null = null

  if (diagramStart >= 0) {
    let diagramEnd = diagramStart + 1
    while (diagramEnd < lines.length) {
      const t = lines[diagramEnd].trim().toLowerCase()
      if (t.startsWith('references:')) break
      diagramEnd++
    }
    diagram = lines.slice(diagramStart, diagramEnd).join('\n').trim() || null
  }

  if (refStart >= 0) {
    references = lines.slice(refStart).join('\n').trim() || null
  }

  const bodyEnd = refStart >= 0 ? refStart : lines.length
  let bodyLines = lines.slice(0, bodyEnd)
  if (diagramStart >= 0 && diagramStart < bodyEnd) {
    let diagramEnd = diagramStart + 1
    while (diagramEnd < bodyEnd && !lines[diagramEnd].trim().toLowerCase().startsWith('references:')) {
      diagramEnd++
    }
    bodyLines = [...lines.slice(0, diagramStart), ...lines.slice(diagramEnd, bodyEnd)]
  }

  return {
    body: bodyLines.join('\n').trim(),
    diagram,
    references,
  }
}

function optionLineClass(line: string, correctOption?: string): string | null {
  const m = line.match(/option\s*([A-D])/i)
  if (!m) return null
  const letter = m[1].toUpperCase()
  const isCorrect = line.includes('✓') || line.toUpperCase().includes('CORRECT')
  if (isCorrect || letter === correctOption?.toUpperCase()) {
    return 'border-l-2 border-emerald-500/70 pl-3 text-emerald-100/95'
  }
  if (line.toUpperCase().includes('INCORRECT') || line.includes('✗')) {
    return 'border-l-2 border-red-500/40 pl-3 text-slate-300'
  }
  return 'border-l-2 border-cyber-600 pl-3 text-slate-200'
}

function renderBodyLine(line: string, index: number, correctOption?: string) {
  const trimmed = line.trim()
  if (!trimmed) return <div key={`sp-${index}`} className="h-2" aria-hidden />

  if (isSectionHeader(trimmed)) {
    return (
      <p key={`hdr-${index}`} className="text-xs font-semibold uppercase tracking-wider text-neon-cyan/90 mt-4 first:mt-0 mb-1">
        {trimmed.replace(/:$/, '')}
      </p>
    )
  }

  const optClass = optionLineClass(trimmed, correctOption)
  if (optClass) {
    return (
      <p key={`opt-${index}`} className={cn('text-sm leading-relaxed whitespace-pre-wrap', optClass)}>
        {trimmed}
      </p>
    )
  }

  if (/^\d+\.\s/.test(trimmed)) {
    return (
      <p key={`step-${index}`} className="text-sm leading-relaxed text-slate-100 pl-4 whitespace-pre-wrap font-mono">
        {trimmed}
      </p>
    )
  }

  return (
    <p key={`ln-${index}`} className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
      {line}
    </p>
  )
}

export function SolutionExplanation({
  text,
  className,
  correctOption,
}: {
  text: string
  className?: string
  correctOption?: string
}) {
  const { body, diagram, references } = splitExplanation(text)
  const bodyLines = body.split('\n')

  return (
    <div className={cn('space-y-1', className)}>
      <div className="space-y-1">{bodyLines.map((line, i) => renderBodyLine(line, i, correctOption))}</div>

      {diagram && (
        <div className="rounded-xl border border-neon-cyan/30 bg-cyber-950/80 p-4 overflow-x-auto mt-4">
          <p className="text-[10px] uppercase tracking-widest text-neon-cyan mb-2 font-semibold">Flowchart / diagram</p>
          <pre className="text-sm font-mono text-emerald-200/90 leading-snug whitespace-pre">{diagram.replace(/^flowchart:\s*/i, '')}</pre>
        </div>
      )}

      {references && (
        <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-cyber-700 whitespace-pre-wrap leading-relaxed">
          {references}
        </p>
      )}
    </div>
  )
}
