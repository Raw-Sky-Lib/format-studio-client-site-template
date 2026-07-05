'use client'

// <EditableLink path="hero.cta_url" href={section.cta_url} className="…">
//   <Editable path="hero.cta_label">{section.cta_label}</Editable>
// </EditableLink>
//
// Wraps any clickable thing — button, card, image — and makes BOTH the URL
// and the inner content editable. Production renders as Next.js <Link> for
// internal hrefs or <a target="_blank"> for external (http/mailto/tel).
// Edit mode renders as <span> (no navigation), shows a discoverable URL pill
// in the corner, and pops a clean panel below the element to type the URL.

import Link from 'next/link'
import { Link2, Check, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useBridgeRegisterPath, useBridgeSend, useEditMode } from './provider'
import { PROTOCOL_VERSION } from './types'

interface EditableLinkProps {
  /** Path to the URL field in the section JSONB, e.g. "hero.cta_url". */
  path: string
  /** Current URL value. Optional — when missing, production renders just the children unwrapped. */
  href?: string | null
  /** Applied to the link / wrapper in BOTH modes. Caller controls the visual (button, card, etc.). */
  className?: string
  /** Open in a new tab. Defaults to true for http(s):// / mailto: / tel: URLs. */
  external?: boolean
  children: ReactNode
}

function looksExternal(url: string): boolean {
  return /^([a-z]+:)?\/\//.test(url) || url.startsWith('mailto:') || url.startsWith('tel:')
}

function shortenForDisplay(url: string): string {
  if (!url) return 'Add link'
  // Strip protocol for visual compactness
  const stripped = url.replace(/^(https?:)?\/\//, '').replace(/^mailto:/, '✉ ').replace(/^tel:/, '☎ ')
  if (stripped.length <= 28) return stripped
  return stripped.slice(0, 22) + '…'
}

export function EditableLink({ path, href, className, external, children }: EditableLinkProps) {
  const { active } = useEditMode()
  const registerPath = useBridgeRegisterPath()

  useEffect(() => registerPath(path), [path, registerPath])

  // ── Production ────────────────────────────────────────────────────────────
  if (!active) {
    if (!href) {
      return <span className={className}>{children}</span>
    }
    const isExternal = external ?? looksExternal(href)
    if (isExternal) {
      return (
        <a href={href} className={className} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    }
    return <Link href={href} className={className}>{children}</Link>
  }

  // ── Edit mode ─────────────────────────────────────────────────────────────
  return (
    <span
      className={`__bridge-editable-link${className ? ' ' + className : ''}`}
      data-path={path}
    >
      {children}
      <UrlEditor path={path} current={href ?? ''} />
    </span>
  )
}

// ── URL editor — discoverable pill + clean popover panel ────────────────────

// Panel sizing. Width is fixed; height is an estimate used for "would it
// overflow bottom?" flips — actual panel can grow slightly without issue.
const PANEL_W = 340
const PANEL_H = 180
const MARGIN  = 12   // viewport edge breathing room
const GAP     = 10   // gap between badge and panel

function UrlEditor({ path, current }: { path: string; current: string }) {
  const send = useBridgeSend()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(current)
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null)
  const badgeRef = useRef<HTMLButtonElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Keep local state in sync if the portal re-broadcasts a new URL while we're idle.
  useEffect(() => { if (!editing) setValue(current) }, [current, editing])

  // Measure the badge + position the panel viewport-aware so it never clips.
  // Prefers BELOW the badge, flips ABOVE if it would overflow, horizontally
  // centers on the badge and clamps to the iframe's viewport edges.
  useLayoutEffect(() => {
    if (!editing || !badgeRef.current) return

    function place() {
      const badge = badgeRef.current?.getBoundingClientRect()
      if (!badge) return
      const vw = window.innerWidth
      const vh = window.innerHeight

      // Vertical: below by default, flip above if it would overflow.
      let top = badge.bottom + GAP
      if (top + PANEL_H > vh - MARGIN) {
        top = badge.top - PANEL_H - GAP
      }
      // Clamp top so the panel still fits if the viewport is short.
      top = Math.max(MARGIN, Math.min(top, vh - PANEL_H - MARGIN))

      // Horizontal: center on the badge, then clamp inside viewport.
      let left = badge.left + badge.width / 2 - PANEL_W / 2
      left = Math.max(MARGIN, Math.min(left, vw - PANEL_W - MARGIN))

      setPanelPos({ top, left })
    }

    place()
    // Re-place on resize so the panel stays anchored if the user resizes.
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [editing])

  // Focus + select all when entering edit mode (after the panel has placed itself).
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  // Esc closes from anywhere in the document.
  useEffect(() => {
    if (!editing) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); cancel() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  function commit() {
    const next = value.trim()
    setEditing(false)
    if (next !== (current ?? '')) {
      send({ type: 'FIELD_CHANGE', protocolVersion: PROTOCOL_VERSION, path, value: next })
    }
  }

  function cancel() {
    setEditing(false)
    setValue(current ?? '')
  }

  const stop = (e: React.SyntheticEvent) => { e.stopPropagation() }

  return (
    <>
      <button
        ref={badgeRef}
        type="button"
        className={`__bridge-url-badge ${current ? '__bridge-url-badge--set' : '__bridge-url-badge--empty'}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(true) }}
        onMouseDown={stop}
        title={current ? `Edit link · ${current}` : 'Add a link'}
      >
        <Link2 size={11} strokeWidth={2.25} />
        <span className="__bridge-url-badge-text">{shortenForDisplay(current)}</span>
      </button>

      {editing && (
        <>
          {/* Backdrop catches outside clicks. Sits below the panel in z-stack. */}
          <span
            className="__bridge-url-backdrop"
            onClick={(e) => { e.stopPropagation(); cancel() }}
            onMouseDown={stop}
          />
          <div
            className="__bridge-url-panel"
            // Position is computed against the iframe viewport so the panel
            // never clips when the link sits near a viewport edge.
            style={panelPos ? { top: panelPos.top, left: panelPos.left, width: PANEL_W } : { visibility: 'hidden' }}
            onClick={stop}
            onMouseDown={stop}
            role="dialog"
            aria-label="Edit link"
          >
            <div className="__bridge-url-panel-header">
              <Link2 size={12} strokeWidth={2.25} />
              <span>Link to</span>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commit() }
              }}
              placeholder="https://example.com  /  /about  /  #contact"
              className="__bridge-url-input"
              spellCheck={false}
              autoComplete="off"
            />
            <p className="__bridge-url-panel-hint">
              Tip: paste a full URL, an internal path like <code>/about</code>, or an anchor like <code>#contact</code>.
            </p>
            <div className="__bridge-url-panel-footer">
              <button type="button" onClick={cancel} className="__bridge-url-btn __bridge-url-btn--ghost">
                <X size={11} strokeWidth={2.5} />
                Cancel
              </button>
              <button type="button" onClick={commit} className="__bridge-url-btn __bridge-url-btn--primary">
                <Check size={11} strokeWidth={2.5} />
                {current ? 'Save link' : 'Add link'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
