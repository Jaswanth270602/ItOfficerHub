/** Build a simple stored explanation from structured import fields. */

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const
export type OptionLetter = (typeof OPTION_LETTERS)[number]

export type OptionExplainMap = Partial<Record<OptionLetter, string>>

/** Pull "Option X — …" / "Option X:" lines from a free-text explanation. */
export function extractOptionExplains(text: string): OptionExplainMap {
  const out: OptionExplainMap = {}
  if (!text) return out
  const re = /(?:^|\n)\s*(?:•\s*)?Option\s+([A-D])\s*[—:\-–]\s*(.+?)(?=(?:\n\s*(?:•\s*)?Option\s+[A-D]\b)|$)/gis
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const letter = m[1].toUpperCase() as OptionLetter
    let body = m[2].trim()
    // Drop trailing section headers if the regex over-captured
    body = body.replace(/\n\s*(Core concept|Solution steps|Option breakdown|Common trap|Key distinction|Exam tip|References|Flowchart).*$/is, '').trim()
    if (body) out[letter] = body
  }
  return out
}

/** Main teaching text without Option A–D lines / legacy section chrome. */
export function extractMainExplanation(text: string): string {
  if (!text) return ''
  let main = text
    .replace(/\n\s*(?:•\s*)?Option\s+[A-D]\s*[—:\-–][\s\S]*/i, '')
    .replace(/^Option breakdown:\s*/gim, '')
    .replace(/^Core concept:\s*/gim, '')
    .replace(/^Solution steps:\s*/gim, '')
    .replace(/^Common trap:\s*/gim, '')
    .replace(/^Key distinction:\s*/gim, '')
    .replace(/^Exam tip:\s*/gim, '')
    .replace(/\n?References:[\s\S]*$/i, '')
    .replace(/\n?(?:Flowchart|Mermaid|Diagram|ASCII diagram):[\s\S]*$/i, '')
    .trim()
  return main
}

export function composeStoredExplanation(opts: {
  explanation?: string | null
  explainA?: string | null
  explainB?: string | null
  explainC?: string | null
  explainD?: string | null
  optionExplanations?: OptionExplainMap | null
}): string {
  const fromMap = opts.optionExplanations ?? {}
  const a = (opts.explainA ?? fromMap.A ?? '').trim()
  const b = (opts.explainB ?? fromMap.B ?? '').trim()
  const c = (opts.explainC ?? fromMap.C ?? '').trim()
  const d = (opts.explainD ?? fromMap.D ?? '').trim()
  const main = (opts.explanation ?? '').trim()

  if (a && b && c && d) {
    const head = main || 'See option explanations below.'
    return `${head}\n\nOption A — ${a}\nOption B — ${b}\nOption C — ${c}\nOption D — ${d}`
  }

  return main
}

export function hasAllOptionExplains(map: OptionExplainMap): boolean {
  return OPTION_LETTERS.every((l) => Boolean(map[l]?.trim()))
}
