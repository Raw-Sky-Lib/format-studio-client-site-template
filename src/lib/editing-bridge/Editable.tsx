'use client'

// <Editable path="hero.headline">{headline}</Editable>
// In production: zero-overhead pass-through, no wrapper element.
// In edit mode: contentEditable span. Emits FIELD_CHANGE on blur.

import { useEffect, useRef, type ReactNode } from 'react'
import {
  BRIDGE_FOCUS_EVENT,
  useBridgeRegisterPath,
  useBridgeSend,
  useEditMode,
} from './provider'
import { PROTOCOL_VERSION } from './types'

interface EditableProps {
  path: string
  children: ReactNode  // Expected to be string at runtime; non-string children render verbatim and don't emit.
  /**
   * Ghost text shown when the field is empty in edit mode. Without this an
   * empty editable is a 0-width invisible span — users can't see where to
   * click. The placeholder also gives them a hint about what to type.
   * Implemented in CSS via `:empty::before { content: attr(data-placeholder) }`.
   */
  placeholder?: string
}

export function Editable({ path, children, placeholder }: EditableProps) {
  const { active } = useEditMode()
  const send = useBridgeSend()
  const registerPath = useBridgeRegisterPath()
  const ref = useRef<HTMLSpanElement | null>(null)
  const focusedRef = useRef(false)

  // Register this path with the provider so BRIDGE_READY can advertise it.
  useEffect(() => {
    return registerPath(path)
  }, [path, registerPath])

  // Receive PORTAL_FOCUS_FIELD for newly-inserted list items, etc.
  useEffect(() => {
    if (!active) return
    function handler(e: Event) {
      const ce = e as CustomEvent<string>
      if (ce.detail !== path) return
      ref.current?.focus()
      // Place caret at end
      const sel = window.getSelection()
      if (sel && ref.current) {
        const range = document.createRange()
        range.selectNodeContents(ref.current)
        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
    window.addEventListener(BRIDGE_FOCUS_EVENT, handler)
    return () => window.removeEventListener(BRIDGE_FOCUS_EVENT, handler)
  }, [active, path])

  // Keep the DOM in sync with `children` when external updates arrive — but
  // never while the user is mid-typing in this field (would jump the caret).
  useEffect(() => {
    if (!active || !ref.current) return
    if (focusedRef.current) return
    const next = typeof children === 'string' ? children : String(children ?? '')
    if (ref.current.innerText !== next) ref.current.innerText = next
  }, [children, active])

  if (!active) {
    return <>{children}</>
  }

  const initial = typeof children === 'string' ? children : String(children ?? '')

  return (
    <span
      ref={(el) => {
        ref.current = el
        // Set initial content imperatively so React doesn't fight contentEditable.
        if (el && el.innerText !== initial) el.innerText = initial
      }}
      contentEditable
      suppressContentEditableWarning
      data-path={path}
      data-placeholder={placeholder}
      className="__bridge-editable"
      onFocus={() => {
        focusedRef.current = true
        if (ref.current) {
          const r = ref.current.getBoundingClientRect()
          send({ type: 'FIELD_FOCUS', protocolVersion: PROTOCOL_VERSION, path, anchorRect: { top: r.top, left: r.left, width: r.width, height: r.height } })
        }
      }}
      onBlur={(e) => {
        focusedRef.current = false
        send({ type: 'FIELD_BLUR', protocolVersion: PROTOCOL_VERSION, path })
        const value = (e.currentTarget.innerText ?? '').trim()
        if (value !== initial) {
          send({ type: 'FIELD_CHANGE', protocolVersion: PROTOCOL_VERSION, path, value })
        }
      }}
      // Disable line breaks in single-line fields; Shift+Enter would otherwise add <br>
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement).blur()
        }
      }}
    />
  )
}
