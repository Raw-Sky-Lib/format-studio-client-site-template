'use client'

// One renderer for every icon source. Reads the parsed kind + value and
// dispatches: curated library (instant), full library (lazy-loaded once),
// emoji text, raw SVG markup, or remote image.
//
// Production fast-path: curated ~90 icons per set render synchronously with
// zero async work. Any icon NOT in the curated set (including legacy bare
// Lucide names like "air-vent" stored before the picker existed) falls through
// to LazyIcon which loads the full library once and caches it.

import { useEffect, useState } from 'react'
import { ICON_LIBRARY } from './library'
import { PHOSPHOR_LIBRARY } from './phosphor'
import { TABLER_LIBRARY } from './tabler'
import { HEROICONS_LIBRARY } from './heroicons'
import { parseIconValue } from './parse'
import { getFullLibraryCached, loadFullLibrary } from './load-full'
import type { IconSet } from './parse'

interface SectionIconProps {
  name?: string | null
  size?: number
  className?: string
  fallback?: string
}

export function SectionIcon({ name, size = 24, className, fallback = 'lucide:sparkles' }: SectionIconProps) {
  const effective = name && String(name).trim() ? name : fallback
  const parsed = parseIconValue(effective)
  if (!parsed) return null

  switch (parsed.kind) {
    case 'lucide': {
      const Cmp = ICON_LIBRARY[parsed.value]
      if (Cmp) return <Cmp size={size} className={className} aria-hidden />
      // Not in the ~70-icon curated set — lazy-load the full 1700+ Lucide library.
      // This handles legacy bare names ("air-vent", "align-center-vertical", etc.)
      // that were stored before the picker existed and may not be in the curated set.
      return <LazyIcon set="lucide" name={parsed.value} size={size} className={className} />
    }

    case 'phosphor': {
      const Cmp = PHOSPHOR_LIBRARY[parsed.value]
      if (Cmp) return <Cmp size={size} weight="regular" className={className} aria-hidden />
      return <LazyIcon set="phosphor" name={parsed.value} size={size} className={className} />
    }

    case 'tabler': {
      const Cmp = TABLER_LIBRARY[parsed.value]
      if (Cmp) return <Cmp size={size} stroke={1.5} className={className} aria-hidden />
      return <LazyIcon set="tabler" name={parsed.value} size={size} className={className} />
    }

    case 'heroicons': {
      const Cmp = HEROICONS_LIBRARY[parsed.value]
      if (Cmp) return <Cmp style={{ width: size, height: size }} className={className} aria-hidden />
      return <LazyIcon set="heroicons" name={parsed.value} size={size} className={className} />
    }

    case 'emoji':
      return <span className={className} style={{ fontSize: size, lineHeight: 1 }} aria-hidden>{parsed.value}</span>

    case 'svg':
      return (
        <span
          className={className}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, lineHeight: 0 }}
          aria-hidden
          dangerouslySetInnerHTML={{ __html: parsed.value }}
        />
      )

    case 'url':
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <img
          src={parsed.value}
          alt=""
          width={size}
          height={size}
          style={{ width: size, height: size, objectFit: 'contain' }}
          className={className}
          aria-hidden
        />
      )
  }
}

// ── Lazy renderer for non-curated icons ────────────────────────────────────

type LazyIconProps = { set: IconSet; name: string; size: number; className?: string }

function LazyIcon({ set, name, size, className }: LazyIconProps) {
  // Re-derive Cmp from the cache on every render so when `name` or `set` change,
  // we look up the NEW icon — not the one we captured on mount.
  // setVersion just forces a re-render after a background load completes.
  const [, setVersion] = useState(0)
  const Cmp = getFullLibraryCached(set)?.[name] ?? null

  useEffect(() => {
    if (Cmp) return
    let cancelled = false
    loadFullLibrary(set)
      .then(() => { if (!cancelled) setVersion((v) => v + 1) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [set, name, Cmp])

  if (!Cmp) {
    // Invisible placeholder — holds the space, no layout shift, no text shown
    return <span style={{ display: 'inline-block', width: size, height: size, opacity: 0 }} aria-hidden />
  }

  if (set === 'heroicons') return <Cmp style={{ width: size, height: size }} className={className} aria-hidden />
  if (set === 'tabler')    return <Cmp size={size} stroke={1.5} className={className} aria-hidden />
  if (set === 'lucide')    return <Cmp size={size} className={className} aria-hidden />
  return <Cmp size={size} weight="regular" className={className} aria-hidden />
}
