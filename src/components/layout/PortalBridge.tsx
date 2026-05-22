'use client'

import { useEffect } from 'react'

const ACTIVE_CLASS = '__portal-section-active'
const STYLE_ID = '__portal-bridge-styles'

const EDIT_BODY_CLASS = '__portal-edit-mode'

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    body.${EDIT_BODY_CLASS} section[id] { cursor: pointer; }
    body.${EDIT_BODY_CLASS} section[id]:hover { outline: 1px dashed rgba(0,102,255,0.30) !important; outline-offset: -2px; }
    .${ACTIVE_CLASS} { outline: 2px solid rgba(0, 102, 255, 0.55) !important; outline-offset: -2px; background: rgba(0,102,255,0.02) !important; }
  `
  document.head.appendChild(style)
}

function setEditMode(enabled: boolean) {
  if (enabled) {
    document.body.classList.add(EDIT_BODY_CLASS)
  } else {
    document.body.classList.remove(EDIT_BODY_CLASS)
    document.querySelectorAll(`section[id].${ACTIVE_CLASS}`)
      .forEach(el => el.classList.remove(ACTIVE_CLASS))
  }
}

function highlightSection(id: string) {
  document.querySelectorAll(`section[id].${ACTIVE_CLASS}`)
    .forEach(el => el.classList.remove(ACTIVE_CLASS))
  document.getElementById(id)?.classList.add(ACTIVE_CLASS)
}

/**
 * Mounted once in the root layout. When loaded inside the portal CMS iframe:
 * - Listens for PORTAL_SCROLL_TO → scrolls to section + highlights it
 * - Observes section visibility → sends PORTAL_SECTION_VISIBLE to parent as the user scrolls
 * - Click handler → sends PORTAL_SECTION_CLICK to parent when a section is clicked
 *
 * Has no effect in normal browser tabs (window.self === window.top guard).
 * No origin restriction: portal domain is unknown at build time; the only actions
 * are scrolling and postMessage back — no data is read or mutated.
 */
export default function PortalBridge() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.self === window.top) return

    ensureStyles()
    // Default to edit mode — portal sends PORTAL_SET_MODE:'preview' to disable interaction
    setEditMode(true)

    // Portal → iframe: scroll to section and apply highlight
    function handleMessage(event: MessageEvent) {
      if (!event.data || typeof event.data !== 'object') return

      if (event.data.type === 'PORTAL_SET_MODE') {
        setEditMode(event.data.mode === 'edit')
        return
      }

      if (
        event.data.type !== 'PORTAL_SCROLL_TO' ||
        typeof event.data.section !== 'string' ||
        event.data.section.length === 0 ||
        event.data.section.length > 64
      ) return
      const el = document.getElementById(event.data.section)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      highlightSection(event.data.section)
    }
    window.addEventListener('message', handleMessage)

    // Iframe → portal: intercept all clicks in edit mode.
    // preventDefault stops link navigation; stopPropagation blocks site JS handlers.
    function handleClick(e: MouseEvent) {
      if (!document.body.classList.contains(EDIT_BODY_CLASS)) return
      e.preventDefault()
      e.stopPropagation()
      const section = (e.target as HTMLElement).closest('section[id]') as HTMLElement | null
      if (!section?.id) return
      highlightSection(section.id)
      window.parent.postMessage({ type: 'PORTAL_SECTION_CLICK', section: section.id }, '*')
    }
    document.addEventListener('click', handleClick, { capture: true })

    // Iframe → portal: send most-visible section as user scrolls
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    const ratioMap = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id
          if (id) ratioMap.set(id, entry.intersectionRatio)
        }
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          let bestId = ''
          let bestRatio = -1
          ratioMap.forEach((ratio, id) => {
            if (ratio > bestRatio) { bestRatio = ratio; bestId = id }
          })
          if (bestId && bestRatio > 0) {
            window.parent.postMessage({ type: 'PORTAL_SECTION_VISIBLE', section: bestId }, '*')
          }
        }, 120)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    document.querySelectorAll('section[id]').forEach(el => observer.observe(el))

    return () => {
      window.removeEventListener('message', handleMessage)
      document.removeEventListener('click', handleClick, { capture: true })
      observer.disconnect()
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [])

  return null
}
