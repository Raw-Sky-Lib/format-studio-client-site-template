'use client'

// EditingBridgeProvider — single React provider that mounts the bridge runtime.
// Inert in production (no ?portal=edit, or not embedded). Zero DOM and zero
// listener cost when inert. Activates only after a strict handshake.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { PageSection } from '@/types/content'
import {
  PROTOCOL_VERSION,
  type BridgeInbound,
  type BridgeOutbound,
  type BridgeStatus,
  type Manifest,
} from './types'
import { injectBridgeStyles } from './styles'

interface EditingBridgeValue {
  active: boolean
  status: BridgeStatus
  sections: PageSection[] | null
  send: (msg: BridgeOutbound) => void
  registerPath: (path: string) => () => void
}

const NOOP_VALUE: EditingBridgeValue = {
  active: false,
  status: 'inert',
  sections: null,
  send: () => {},
  registerPath: () => () => {},
}

const EditingBridgeContext = createContext<EditingBridgeValue>(NOOP_VALUE)

const FOCUS_EVENT = '__bridge_focus_field'

export function EditingBridgeProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false)
  const [status, setStatus] = useState<BridgeStatus>('inert')
  const [sections, setSections] = useState<PageSection[] | null>(null)
  const portalOriginRef = useRef<string | null>(null)
  const pathsRef = useRef<Set<string>>(new Set())
  // Element currently carrying the portal-driven selection outline.
  const selectedElRef = useRef<Element | null>(null)

  // Stable callback for the post-out side. Always calls window.parent.postMessage
  // with the locked portal origin so a hijacked parent can't intercept.
  const send = useCallback((msg: BridgeOutbound) => {
    if (typeof window === 'undefined') return
    const target = portalOriginRef.current
    if (!target) return
    window.parent.postMessage(msg, target)
  }, [])

  // Each Editable* component registers its path on mount, unregisters on unmount.
  // We use the snapshot in BRIDGE_READY (and any re-send if we add one later).
  const registerPath = useCallback((path: string) => {
    pathsRef.current.add(path)
    return () => {
      pathsRef.current.delete(path)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Activation precondition 1: explicit ?portal=edit URL param.
    const params = new URLSearchParams(window.location.search)
    if (params.get('portal') !== 'edit') {
      setStatus('inert')
      return
    }

    // Activation precondition 2: must be embedded. A standalone visit shows
    // nothing — protects against accidental edit-UI leak on the public site.
    if (window.self === window.top) {
      setStatus('inert-not-embedded')
      return
    }

    setStatus('awaiting-activation')
    injectBridgeStyles()

    // BRIDGE_READY is sent after first paint so child sections have mounted
    // and registered their paths via registerPath().
    const manifestTimer = setTimeout(() => {
      const manifest: Manifest = {
        protocolVersion: PROTOCOL_VERSION,
        sectionsRendered: Array.from(document.querySelectorAll('section[id]'))
          .map(el => el.id)
          .filter(Boolean),
        editablePaths: Array.from(pathsRef.current).sort(),
      }
      // Initial BRIDGE_READY uses '*' because we don't know the portal origin yet.
      // PORTAL_ACTIVATE arrives next; its event.origin becomes the locked target.
      window.parent.postMessage(
        { type: 'BRIDGE_READY', protocolVersion: PROTOCOL_VERSION, manifest },
        '*',
      )
    }, 0)

    function handleMessage(event: MessageEvent) {
      if (!event.data || typeof event.data !== 'object') return
      const msg = event.data as BridgeInbound
      if (msg.protocolVersion !== PROTOCOL_VERSION) return

      // PORTAL_ACTIVATE locks the parent origin on first receipt.
      if (msg.type === 'PORTAL_ACTIVATE') {
        if (!portalOriginRef.current) {
          portalOriginRef.current = event.origin
        }
        if (event.origin !== portalOriginRef.current) return
        setActive(true)
        setStatus('active')
        return
      }

      // Every other message must come from the locked portal origin.
      if (!portalOriginRef.current || event.origin !== portalOriginRef.current) return

      switch (msg.type) {
        case 'PORTAL_DEACTIVATE':
          if (selectedElRef.current) {
            selectedElRef.current.classList.remove('__bridge-selected')
            selectedElRef.current = null
          }
          setActive(false)
          setStatus('awaiting-activation')
          return
        case 'PORTAL_UPDATE_SECTIONS':
          if (Array.isArray(msg.sections)) {
            setSections(msg.sections as PageSection[])
          }
          return
        case 'PORTAL_SCROLL_TO': {
          const el = document.getElementById(msg.sectionType)
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
        case 'PORTAL_FOCUS_FIELD':
          // Editable components subscribe to this event by path.
          window.dispatchEvent(new CustomEvent(FOCUS_EVENT, { detail: msg.path }))
          return
        case 'PORTAL_SET_SELECTION': {
          // Move the dashed selection outline to the targeted element (or clear).
          if (selectedElRef.current) {
            selectedElRef.current.classList.remove('__bridge-selected')
            selectedElRef.current = null
          }
          const target = msg.target
          let el: Element | null = null
          if (target?.kind === 'field') el = document.querySelector(`[data-path="${target.path}"]`)
          else if (target?.kind === 'section') el = document.getElementById(target.sectionType)
          if (el) {
            el.classList.add('__bridge-selected')
            selectedElRef.current = el
          }
          return
        }
      }
    }

    window.addEventListener('message', handleMessage)

    // Expose a tiny inspection handle for the test harness + DevTools.
    // Read-only snapshot — does NOT let outside code change bridge state.
    Object.defineProperty(window, '__editingBridge', {
      configurable: true,
      get() {
        return {
          status,
          active,
          portalOrigin: portalOriginRef.current,
          paths: Array.from(pathsRef.current),
        }
      },
    })

    return () => {
      window.removeEventListener('message', handleMessage)
      clearTimeout(manifestTimer)
      try { delete (window as unknown as Record<string, unknown>).__editingBridge } catch {}
    }
    // We intentionally run this once. `active`/`status` updates re-bind the getter
    // via the getter closure; nothing else here needs to react to renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When bridge is active, detect clicks on section containers and fire SECTION_FOCUS
  // with the bounding rect so the portal can show a section-level popup.
  // Clicks already handled by an .__bridge-editable (FIELD_FOCUS) are skipped.
  useEffect(() => {
    if (!active) return
    function handleClick(e: MouseEvent) {
      if ((e.target as Element).closest('.__bridge-editable')) return
      const section = (e.target as Element).closest('section[id]')
      if (!section) return
      const r = section.getBoundingClientRect()
      send({
        type: 'SECTION_FOCUS',
        protocolVersion: PROTOCOL_VERSION,
        sectionType: section.id,
        anchorRect: { top: r.top, left: r.left, width: r.width, height: r.height },
      })
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [active, send])

  const value = useMemo<EditingBridgeValue>(
    () => ({ active, status, sections, send, registerPath }),
    [active, status, sections, send, registerPath],
  )

  return <EditingBridgeContext.Provider value={value}>{children}</EditingBridgeContext.Provider>
}

// ─── Public hooks ────────────────────────────────────────────────────────────

export function useEditMode(): { active: boolean; status: BridgeStatus } {
  const { active, status } = useContext(EditingBridgeContext)
  return { active, status }
}

export function useBridgeSend(): (msg: BridgeOutbound) => void {
  return useContext(EditingBridgeContext).send
}

export function useBridgeSections(): PageSection[] | null {
  return useContext(EditingBridgeContext).sections
}

export function useBridgeRegisterPath(): (path: string) => () => void {
  return useContext(EditingBridgeContext).registerPath
}

export const BRIDGE_FOCUS_EVENT = FOCUS_EVENT
