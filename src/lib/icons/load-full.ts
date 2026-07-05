// Dynamic full-library loader.
//
// Called from two places:
//   1. EditableIcon (picker) — loads the full set when the picker opens.
//   2. SectionIcon (renderer) — lazy-renders non-curated icons picked via the picker.
//
// Each library is fetched at most once per browser session (module-level cache).
//
// WHY the careful filtering:
// Icon libraries export utility/base components alongside actual icons. Rendering
// those without their required internal props crashes. Two defences are applied:
//   A) Strict $$typeof check — only forward_ref and memo pass; context/provider/lazy
//      are automatically excluded.
//   B) Name-based exclusion — known base components that ARE forward_ref but crash
//      without internal props (e.g. Phosphor's IconBase) are excluded by name.

import type { ComponentType } from 'react'
import type { IconSet } from './parse'

type IconMap = Record<string, ComponentType<any>>

const CACHE: Partial<Record<IconSet, IconMap>> = {}
const PENDING: Partial<Record<IconSet, Promise<IconMap>>> = {}

// Symbols for the only $$typeof values we accept:
//   forward_ref — standard icon component wrapper
//   memo        — some libraries wrap icons in React.memo
const FORWARD_REF = Symbol.for('react.forward_ref')
const REACT_MEMO  = Symbol.for('react.memo')

function isIconComponent(val: unknown): val is ComponentType<any> {
  if (!val) return false
  // Plain function components (rare in modern icon libs but keep as fallback)
  if (typeof val === 'function') return true
  if (typeof val !== 'object') return false
  const t = (val as Record<string, unknown>).$$typeof
  // Strictly accept only renderable component wrappers.
  // This auto-excludes React.createContext (react.context), React.lazy (react.lazy),
  // Context.Provider (react.provider), and any other exotic React objects.
  return t === FORWARD_REF || t === REACT_MEMO
}

// PascalCase → kebab-case  (ArrowRight → arrow-right, CPUChip → cpu-chip)
export function toKebab(s: string): string {
  return s
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

export function loadFullLibrary(set: IconSet): Promise<IconMap> {
  if (CACHE[set]) return Promise.resolve(CACHE[set]!)
  if (PENDING[set]) return PENDING[set]!

  const promise = (async (): Promise<IconMap> => {
    switch (set) {
      // ── Lucide ─────────────────────────────────────────────────────────────
      // Uses the canonical `icons` named export — a plain object containing
      // only the 1700+ actual icon components (no base component, no utilities).
      case 'lucide': {
        const m = await import('lucide-react')
        const lib: IconMap = {}
        const source = (m as any).icons as Record<string, unknown> | undefined
        if (source) {
          for (const [name, val] of Object.entries(source)) {
            if (isIconComponent(val)) lib[toKebab(name)] = val
          }
        } else {
          // Fallback: filter all named exports, exclude the bare `Icon` base component
          for (const [name, val] of Object.entries(m as Record<string, unknown>)) {
            if (isIconComponent(val) && /^[A-Z][a-z]/.test(name) && name !== 'Icon') {
              lib[toKebab(name)] = val as ComponentType<any>
            }
          }
        }
        CACHE.lucide = lib
        return lib
      }

      // ── Phosphor ───────────────────────────────────────────────────────────
      // Exports two non-icon components from ./lib:
      //   • IconContext — React.createContext() → excluded by strict $$typeof check
      //   • IconBase   — forwardRef renderer (needs paths prop) → excluded by name
      // All other forwardRef exports are actual icons.
      case 'phosphor': {
        const m = await import('@phosphor-icons/react')
        const lib: IconMap = {}
        for (const [name, val] of Object.entries(m as Record<string, unknown>)) {
          if (
            isIconComponent(val) &&
            /^[A-Z][a-z]/.test(name) &&
            name !== 'IconBase' // base renderer — crashes without paths prop
          ) {
            lib[toKebab(name)] = val as ComponentType<any>
          }
        }
        CACHE.phosphor = lib
        return lib
      }

      // ── Tabler ─────────────────────────────────────────────────────────────
      // All icons are named IconXxx (length > 4). The only non-icon export is
      // `ReactNode` which is a TypeScript type (no runtime value). Safe as-is.
      case 'tabler': {
        const m = await import('@tabler/icons-react')
        const lib: IconMap = {}
        for (const [name, val] of Object.entries(m as Record<string, unknown>)) {
          if (name.startsWith('Icon') && name.length > 4 && isIconComponent(val)) {
            lib[toKebab(name.slice(4))] = val as ComponentType<any>
          }
        }
        CACHE.tabler = lib
        return lib
      }

      // ── Heroicons ──────────────────────────────────────────────────────────
      // Outline package. All exports follow the XxxIcon pattern (length > 4).
      // No non-icon exports at runtime. Safe as-is.
      case 'heroicons': {
        const m = await import('@heroicons/react/24/outline')
        const lib: IconMap = {}
        for (const [name, val] of Object.entries(m as Record<string, unknown>)) {
          if (name.endsWith('Icon') && name.length > 4 && isIconComponent(val)) {
            lib[toKebab(name.slice(0, -4))] = val as ComponentType<any>
          }
        }
        CACHE.heroicons = lib
        return lib
      }
    }
  })()

  PENDING[set] = promise
  return promise
}

// Synchronous read — returns null if the library hasn't loaded yet.
export function getFullLibraryCached(set: IconSet): IconMap | null {
  return CACHE[set] ?? null
}
