'use client'

// <EditableIcon path="features.items[0].icon" value={item.icon} size={28} className="…" />
//
// Production: renders <SectionIcon>.
// Edit mode: click opens a picker. Four tabs (Library / Emoji / SVG / URL).
// Library tab has a set selector (Lucide / Phosphor / Tabler / Heroicons).
// Picker emits FIELD_CHANGE with a prefixed string ("lucide:rocket" etc.)
// SectionIcon understands every prefix (and legacy bare names).

import { LayoutGrid, Smile, Code2, Link as LinkIcon, Pencil, Search } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { SectionIcon } from '@/lib/icons/SectionIcon'
import { ICON_LIBRARY, ICON_NAMES } from '@/lib/icons/library'
import { PHOSPHOR_LIBRARY, PHOSPHOR_NAMES } from '@/lib/icons/phosphor'
import { TABLER_LIBRARY, TABLER_NAMES } from '@/lib/icons/tabler'
import { HEROICONS_LIBRARY, HEROICONS_NAMES } from '@/lib/icons/heroicons'
import { EMOJI_SET } from '@/lib/icons/emoji'
import { parseIconValue, serializeIconValue } from '@/lib/icons/parse'
import type { IconSet } from '@/lib/icons/parse'
import { loadFullLibrary } from '@/lib/icons/load-full'
import { useBridgeRegisterPath, useBridgeSend, useEditMode } from './provider'
import { PROTOCOL_VERSION } from './types'

interface EditableIconProps {
  path: string
  value?: string | null
  size?: number
  className?: string
}

const PANEL_W = 380
const PANEL_H = 460
const MARGIN  = 12
const GAP     = 8
const UNFILTERED_CAP = 300

export function EditableIcon({ path, value, size = 28, className }: EditableIconProps) {
  const { active } = useEditMode()
  const registerPath = useBridgeRegisterPath()

  useEffect(() => registerPath(path), [path, registerPath])

  if (!active) {
    if (!value) return null
    return <SectionIcon name={value} size={size} className={className} />
  }
  return <EditableIconActive path={path} value={value ?? ''} size={size} className={className} />
}

function EditableIconActive({
  path,
  value,
  size,
  className,
}: { path: string; value: string; size: number; className?: string }) {
  const send = useBridgeSend()
  const [pickerOpen, setPickerOpen] = useState(false)
  const wrapperRef = useRef<HTMLSpanElement | null>(null)

  function pick(stored: string) {
    setPickerOpen(false)
    if (stored !== value) {
      send({ type: 'FIELD_CHANGE', protocolVersion: PROTOCOL_VERSION, path, value: stored })
    }
  }

  function openPicker(e: React.SyntheticEvent) {
    e.preventDefault()
    e.stopPropagation()
    setPickerOpen(true)
  }

  return (
    <span
      ref={wrapperRef}
      className="__bridge-editable-icon-wrap"
      onClick={openPicker}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openPicker(e) }}
      role="button"
      tabIndex={0}
      title={value ? `Edit icon` : 'Choose an icon'}
    >
      <SectionIcon name={value || 'lucide:sparkles'} size={size} className={className} />
      <span className="__bridge-editable-icon-hint" aria-hidden>
        <Pencil size={9} strokeWidth={2.5} />
      </span>

      {pickerOpen && (
        <IconPicker
          anchorRef={wrapperRef}
          current={value}
          onClose={() => setPickerOpen(false)}
          onPick={pick}
        />
      )}
    </span>
  )
}

// ── Picker ──────────────────────────────────────────────────────────────────

type PickerTab = 'library' | 'emoji' | 'svg' | 'url'

const ICON_SETS: { id: IconSet; label: string }[] = [
  { id: 'lucide',    label: 'Lucide' },
  { id: 'phosphor',  label: 'Phosphor' },
  { id: 'tabler',    label: 'Tabler' },
  { id: 'heroicons', label: 'Heroicons' },
]

// Curated synchronous data, always available — no loading dance, no flicker.
const CURATED: Record<IconSet, { names: string[]; lib: Record<string, ComponentType<any>> }> = {
  lucide:    { names: ICON_NAMES,      lib: ICON_LIBRARY as Record<string, ComponentType<any>> },
  phosphor:  { names: PHOSPHOR_NAMES,  lib: PHOSPHOR_LIBRARY as Record<string, ComponentType<any>> },
  tabler:    { names: TABLER_NAMES,    lib: TABLER_LIBRARY as Record<string, ComponentType<any>> },
  heroicons: { names: HEROICONS_NAMES, lib: HEROICONS_LIBRARY as Record<string, ComponentType<any>> },
}

function renderSetIcon(set: IconSet, Cmp: ComponentType<any>) {
  if (set === 'heroicons') return <Cmp style={{ width: 20, height: 20 }} aria-hidden />
  if (set === 'tabler')    return <Cmp size={20} stroke={1.5} aria-hidden />
  if (set === 'phosphor')  return <Cmp size={20} weight="regular" aria-hidden />
  return <Cmp size={20} aria-hidden />
}

function IconPicker({
  anchorRef,
  current,
  onClose,
  onPick,
}: {
  anchorRef: React.RefObject<HTMLElement | null>
  current: string
  onClose: () => void
  onPick: (stored: string) => void
}) {
  const parsed = useMemo(() => parseIconValue(current), [current])

  const initialTab: PickerTab =
    parsed?.kind === 'emoji' ? 'emoji'
    : parsed?.kind === 'svg' ? 'svg'
    : parsed?.kind === 'url' ? 'url'
    : 'library'

  const initialSet: IconSet =
    parsed?.kind === 'phosphor'  ? 'phosphor'
    : parsed?.kind === 'tabler'    ? 'tabler'
    : parsed?.kind === 'heroicons' ? 'heroicons'
    : 'lucide'

  const [tab, setTab] = useState<PickerTab>(initialTab)
  const [iconSet, setIconSet] = useState<IconSet>(initialSet)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  // Position the panel
  useLayoutEffect(() => {
    function place() {
      const a = anchorRef.current?.getBoundingClientRect()
      if (!a) return
      const vw = window.innerWidth
      const vh = window.innerHeight
      let top = a.bottom + GAP
      if (top + PANEL_H > vh - MARGIN) top = a.top - PANEL_H - GAP
      top = Math.max(MARGIN, Math.min(top, vh - PANEL_H - MARGIN))
      let left = a.left + a.width / 2 - PANEL_W / 2
      left = Math.max(MARGIN, Math.min(left, vw - PANEL_W - MARGIN))
      setPos({ top, left })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [anchorRef])

  // Esc to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    <>
      <span
        className="__bridge-icon-backdrop"
        onClick={(e) => { e.stopPropagation(); onClose() }}
        onMouseDown={stop}
      />
      <div
        className="__bridge-icon-panel"
        style={pos ? { top: pos.top, left: pos.left, width: PANEL_W, height: PANEL_H } : { visibility: 'hidden' }}
        onClick={stop}
        onMouseDown={stop}
        role="dialog"
        aria-label="Choose icon"
      >
        <div className="__bridge-icon-panel-header">
          <span className="__bridge-icon-panel-title">Choose icon</span>
          <button
            type="button"
            className="__bridge-icon-clear"
            onClick={() => onPick('')}
            title="Remove icon"
          >
            No icon
          </button>
        </div>

        <nav className="__bridge-icon-tabs">
          <TabBtn active={tab === 'library'} onClick={() => setTab('library')}><LayoutGrid size={11} /> Library</TabBtn>
          <TabBtn active={tab === 'emoji'}   onClick={() => setTab('emoji')}><Smile size={11} /> Emoji</TabBtn>
          <TabBtn active={tab === 'svg'}     onClick={() => setTab('svg')}><Code2 size={11} /> SVG</TabBtn>
          <TabBtn active={tab === 'url'}     onClick={() => setTab('url')}><LinkIcon size={11} /> URL</TabBtn>
        </nav>

        {tab === 'library' && (
          <LibraryTab
            iconSet={iconSet}
            onSetChange={setIconSet}
            current={current}
            onPick={onPick}
          />
        )}
        {tab === 'emoji' && <EmojiGrid current={current} onPick={onPick} />}
        {tab === 'svg'   && <SvgPaste  current={current} onPick={onPick} />}
        {tab === 'url'   && <UrlPaste  current={current} onPick={onPick} />}
      </div>
    </>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`__bridge-icon-tab${active ? ' __bridge-icon-tab--active' : ''}`}
    >
      {children}
    </button>
  )
}

// ── Library tab ─────────────────────────────────────────────────────────────
// Always renders the curated set immediately. The full library loads in the
// background and replaces the curated set when ready. No loading flicker —
// the curated set is shown the whole time.

function LibraryTab({
  iconSet,
  onSetChange,
  current,
  onPick,
}: {
  iconSet: IconSet
  onSetChange: (s: IconSet) => void
  current: string
  onPick: (s: string) => void
}) {
  const [query, setQuery] = useState('')
  const [fullByset, setFullByset] = useState<Partial<Record<IconSet, Record<string, ComponentType<any>>>>>({})

  // Load full library for the active set (once, cached at module level)
  useEffect(() => {
    if (fullByset[iconSet]) return
    let cancelled = false
    loadFullLibrary(iconSet).then((lib) => {
      if (!cancelled) setFullByset((prev) => ({ ...prev, [iconSet]: lib }))
    }).catch(() => {})
    return () => { cancelled = true }
  }, [iconSet, fullByset])

  const fullLib = fullByset[iconSet]
  const lib = fullLib ?? CURATED[iconSet].lib
  const totalCount = fullLib ? Object.keys(fullLib).length : CURATED[iconSet].names.length

  // Filter / sort / cap
  const { visible, capped } = useMemo(() => {
    const all = fullLib ? Object.keys(fullLib).sort() : CURATED[iconSet].names
    const q = query.trim().toLowerCase()
    const filtered = q ? all.filter((n) => n.includes(q)) : all
    const capped = !q && filtered.length > UNFILTERED_CAP
    return { visible: capped ? filtered.slice(0, UNFILTERED_CAP) : filtered, capped }
  }, [fullLib, iconSet, query])

  // Highlight the currently-selected icon if it belongs to this set
  const currentName = useMemo(() => {
    const p = parseIconValue(current)
    return p?.kind === iconSet ? p.value : ''
  }, [current, iconSet])

  const setLabel = ICON_SETS.find((s) => s.id === iconSet)?.label ?? ''

  return (
    <>
      <div className="__bridge-icon-set-row">
        {ICON_SETS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`__bridge-icon-set-btn${iconSet === s.id ? ' __bridge-icon-set-btn--active' : ''}`}
            onClick={() => onSetChange(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={`Search ${totalCount.toLocaleString()} ${setLabel} icons…`}
      />

      <div className="__bridge-icon-grid">
        {visible.length === 0 && (
          <p className="__bridge-icon-empty">No matches.</p>
        )}
        {visible.map((name) => {
          const Cmp = lib[name]
          if (!Cmp) return null
          const isActive = name === currentName
          return (
            <button
              key={name}
              type="button"
              className={`__bridge-icon-cell${isActive ? ' __bridge-icon-cell--active' : ''}`}
              onClick={() => onPick(serializeIconValue({ kind: iconSet, value: name }))}
              title={name}
              aria-label={name}
            >
              {renderSetIcon(iconSet, Cmp)}
            </button>
          )
        })}
        {capped && (
          <p className="__bridge-icon-cap-hint">
            Showing first {UNFILTERED_CAP} — search to find more
          </p>
        )}
      </div>
    </>
  )
}

// ── Emoji tab ───────────────────────────────────────────────────────────────
function EmojiGrid({ current, onPick }: { current: string; onPick: (s: string) => void }) {
  const [draft, setDraft] = useState('')
  const currentEmoji = current.startsWith('emoji:') ? current.slice(6) : ''

  function useTyped() {
    const v = draft.trim()
    if (v) onPick(serializeIconValue({ kind: 'emoji', value: v }))
  }

  return (
    <>
      <div className="__bridge-icon-search">
        <Smile size={11} strokeWidth={2.5} />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Paste any emoji or pick below"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); useTyped() } }}
          autoFocus
        />
        {draft.trim() && (
          <button type="button" className="__bridge-icon-use" onClick={useTyped}>Use</button>
        )}
      </div>
      <div className="__bridge-icon-grid __bridge-icon-grid--emoji">
        {EMOJI_SET.map((e) => {
          const isActive = e === currentEmoji
          return (
            <button
              key={e}
              type="button"
              className={`__bridge-icon-cell${isActive ? ' __bridge-icon-cell--active' : ''}`}
              onClick={() => onPick(serializeIconValue({ kind: 'emoji', value: e }))}
              title={e}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden>{e}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

// ── SVG tab ─────────────────────────────────────────────────────────────────
function SvgPaste({ current, onPick }: { current: string; onPick: (s: string) => void }) {
  const initial = current.startsWith('svg:') ? current.slice(4) : (current.startsWith('<svg') ? current : '')
  const [svg, setSvg] = useState(initial)
  const trimmed = svg.trim()
  const looksValid = trimmed.startsWith('<svg') && trimmed.endsWith('>')

  return (
    <div className="__bridge-icon-form">
      <p className="__bridge-icon-form-hint">
        Paste raw SVG markup. Strip any <code>width</code> / <code>height</code> attributes so it scales with the icon size.
      </p>
      <textarea
        rows={8}
        value={svg}
        onChange={(e) => setSvg(e.target.value)}
        placeholder='<svg viewBox="0 0 24 24" fill="currentColor">...</svg>'
        spellCheck={false}
        className="__bridge-icon-textarea"
      />
      <div className="__bridge-icon-form-row">
        <div className="__bridge-icon-preview">
          {looksValid && (
            <span
              className="__bridge-icon-preview-box"
              dangerouslySetInnerHTML={{ __html: svg }}
              aria-hidden
            />
          )}
        </div>
        <button
          type="button"
          className="__bridge-icon-form-cta"
          disabled={!looksValid}
          onClick={() => onPick(serializeIconValue({ kind: 'svg', value: trimmed }))}
        >
          Use SVG
        </button>
      </div>
    </div>
  )
}

// ── URL tab ─────────────────────────────────────────────────────────────────
function UrlPaste({ current, onPick }: { current: string; onPick: (s: string) => void }) {
  const initial = current.startsWith('url:') ? current.slice(4) : (/^https?:\/\//.test(current) ? current : '')
  const [url, setUrl] = useState(initial)
  const trimmed = url.trim()
  const looksValid = /^https?:\/\//.test(trimmed)

  return (
    <div className="__bridge-icon-form">
      <p className="__bridge-icon-form-hint">
        Link to a hosted icon (PNG, SVG, JPG). Use this for icons not in the library — your own logo, a partner mark, etc.
      </p>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/icons/my-icon.svg"
        spellCheck={false}
        autoComplete="off"
        className="__bridge-icon-input"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && looksValid) {
            e.preventDefault()
            onPick(serializeIconValue({ kind: 'url', value: trimmed }))
          }
        }}
      />
      <div className="__bridge-icon-form-row">
        <div className="__bridge-icon-preview">
          {looksValid && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={trimmed} alt="" className="__bridge-icon-preview-img" />
          )}
        </div>
        <button
          type="button"
          className="__bridge-icon-form-cta"
          disabled={!looksValid}
          onClick={() => onPick(serializeIconValue({ kind: 'url', value: trimmed }))}
        >
          Use URL
        </button>
      </div>
    </div>
  )
}

// ── Shared search input ─────────────────────────────────────────────────────
function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="__bridge-icon-search">
      <Search size={11} strokeWidth={2.5} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        autoFocus
      />
    </div>
  )
}
