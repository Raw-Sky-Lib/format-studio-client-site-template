'use client'

// PreviewContext — holds portal-injected section overrides for live editing.
// Only activates inside the portal CMS iframe. Has zero effect on the public site.
//
// The portal sends PORTAL_UPDATE_SECTION with the full sections array whenever
// any field is edited. This context stores that override and exposes it so
// PreviewSections can re-render without touching Supabase or doing a page reload.

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { PageSection } from '@/types/content'

type PreviewContextValue = {
  sections: PageSection[] | null
}

const PreviewContext = createContext<PreviewContextValue>({ sections: null })

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<PageSection[] | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.self === window.top) return   // not in an iframe — do nothing

    function handleMessage(event: MessageEvent) {
      if (
        !event.data ||
        typeof event.data !== 'object' ||
        event.data.type !== 'PORTAL_UPDATE_SECTION' ||
        !Array.isArray(event.data.sections)
      ) return
      setSections(event.data.sections as PageSection[])
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <PreviewContext.Provider value={{ sections }}>
      {children}
    </PreviewContext.Provider>
  )
}

export function usePreviewSections(): PageSection[] | null {
  return useContext(PreviewContext).sections
}
