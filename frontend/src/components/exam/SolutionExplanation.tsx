import { cn } from '@/lib/utils'

const SECTION_HEADERS = [
  'core concept',
  'solution steps',
  'option breakdown',
  'common trap',
  'key distinction',
  'exam tip',
  'flowchart',
  'mermaid',
  'diagram',
  'references',
] as const

const MERMAID_START =
  /^(graph\s+(TD|LR|BT|RL)|flowchart\s+(TD|LR)|sequenceDiagram|classDiagram|stateDiagram)/i

function isSectionHeader(line: string): boolean {
  const t = line.trim().replace(/:$/, '').toLowerCase()
  return SECTION_HEADERS.some((h) => t === h || t.startsWith(h + ':'))
}

function isDiagramHeaderLine(line: string): boolean {
  const t = line.trim().toLowerCase()
  const bare = t.replace(/:$/, '')
  return (
    bare === 'flowchart' ||
    bare === 'mermaid' ||
    bare === 'diagram' ||
    bare.startsWith('ascii diagram') ||
    t.startsWith('flowchart:') ||
    t.startsWith('mermaid:') ||
    t.startsWith('diagram:')
  )
}

/** Lines that belong to a Mermaid/ASCII block (not general explanation prose). */
function isDiagramContinuationLine(line: string): boolean {
  const t = line.trim()
  if (!t) return true
  if (MERMAID_START.test(t)) return true
  if (/^subgraph\b/i.test(t)) return true
  if (/^end\s*$/i.test(t)) return true
  if (/^style\b/i.test(t)) return true
  if (/^classDef\b/i.test(t)) return true
  // Mermaid edges / node lines only (avoid matching "Option A — … — INCORRECT")
  if ((t.includes('-->') || t.includes('-.->') || /\s--\s/.test(t)) && !t.startsWith('•') && !/^option\s/i.test(t)) {
    return /^[\s\w\[\]()"':;.#-]+$/i.test(t) || /^[A-Za-z0-9_]+\s*[\[\(]/.test(t)
  }
  return false
}

function findDiagramRange(lines: string[]): { start: number; end: number } | null {
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const t = raw.trim()

    if (isDiagramHeaderLine(raw)) {
      let end = i + 1
      while (end < lines.length) {
        const lt = lines[end].trim().toLowerCase()
        if (lt.startsWith('references:')) break
        if (lines[end].trim() && isSectionHeader(lines[end]) && !isDiagramHeaderLine(lines[end])) break
        if (lines[end].trim() && !isDiagramContinuationLine(lines[end]) && end > i + 1) break
        end++
      }
      return { start: i, end: Math.max(i + 1, end) }
    }

    if (MERMAID_START.test(t)) {
      let end = i + 1
      while (end < lines.length) {
        const lt = lines[end].trim().toLowerCase()
        if (lt.startsWith('references:')) break
        if (lines[end].trim() && isSectionHeader(lines[end])) break
        if (lines[end].trim() && !isDiagramContinuationLine(lines[end])) break
        end++
      }
      return { start: i, end: Math.max(i + 1, end) }
    }
  }
  return null
}

function splitExplanation(text: string): { body: string; diagram: string | null; references: string | null } {
  const lines = text.split('\n')
  const refStart = lines.findIndex((l) => l.trim().toLowerCase().startsWith('references:'))
  const bodyEnd = refStart >= 0 ? refStart : lines.length
  const bodySlice = lines.slice(0, bodyEnd)

  const diagramRange = findDiagramRange(bodySlice)
  let diagram: string | null = null
  let references: string | null = null

  if (diagramRange) {
    diagram = bodySlice.slice(diagramRange.start, diagramRange.end).join('\n').trim() || null
  }

  if (refStart >= 0) {
    references = lines.slice(refStart).join('\n').trim() || null
  }

  let bodyLines = bodySlice
  if (diagramRange) {
    bodyLines = [...bodySlice.slice(0, diagramRange.start), ...bodySlice.slice(diagramRange.end)]
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
          <pre className="text-sm font-mono text-emerald-200/90 leading-snug whitespace-pre-wrap break-words">
            {diagram.replace(/^(flowchart|mermaid|diagram):\s*/i, '')}
          </pre>
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
