// Stored icon values use an explicit prefix so multiple sources coexist:
//   "lucide:check-circle"   curated lucide icon
//   "phosphor:rocket"       curated Phosphor icon (Regular weight)
//   "tabler:arrow-right"    curated Tabler icon (stroke 1.5)
//   "heroicons:check-circle" curated Heroicons outline icon
//   "emoji:✨"              curated (or any) emoji
//   "svg:<svg …>...</svg>"  raw SVG markup pasted by the client
//   "url:https://…/x.png"   external image URL
//
// Legacy / bare values are still supported by heuristic:
//   "rocket"                → lucide   (kebab-case ASCII)
//   "⚡"                    → emoji
//   "<svg …>"               → svg
//   "https://…"             → url

export type IconKind = 'lucide' | 'phosphor' | 'tabler' | 'heroicons' | 'emoji' | 'svg' | 'url'

// The four icon-set library kinds (excludes emoji/svg/url which aren't icon sets).
export type IconSet = Extract<IconKind, 'lucide' | 'phosphor' | 'tabler' | 'heroicons'>

export interface ParsedIcon {
  kind: IconKind
  value: string
}

export function parseIconValue(input: string | null | undefined): ParsedIcon | null {
  if (!input) return null
  const raw = String(input)
  if (!raw.trim()) return null

  // Explicit prefixes (only the meaningful payload is trimmed; SVG / URL
  // payloads may legitimately start with whitespace inside markup).
  if (raw.startsWith('lucide:'))    return { kind: 'lucide',    value: raw.slice(7).trim() }
  if (raw.startsWith('phosphor:')) return { kind: 'phosphor',  value: raw.slice(9).trim() }
  if (raw.startsWith('tabler:'))   return { kind: 'tabler',    value: raw.slice(7).trim() }
  if (raw.startsWith('heroicons:'))return { kind: 'heroicons', value: raw.slice(10).trim() }
  if (raw.startsWith('emoji:'))    return { kind: 'emoji',     value: raw.slice(6) }
  if (raw.startsWith('svg:'))      return { kind: 'svg',       value: raw.slice(4) }
  if (raw.startsWith('url:'))      return { kind: 'url',       value: raw.slice(4).trim() }

  // Heuristics — for legacy bare values.
  const trimmed = raw.trim()
  if (/^https?:\/\//.test(trimmed))   return { kind: 'url',    value: trimmed }
  if (trimmed.startsWith('<svg'))     return { kind: 'svg',    value: trimmed }
  if (/^[a-z][a-z0-9-]{0,40}$/.test(trimmed)) return { kind: 'lucide', value: trimmed }
  return { kind: 'emoji', value: trimmed }
}

export function serializeIconValue(parsed: ParsedIcon): string {
  return `${parsed.kind}:${parsed.value}`
}
