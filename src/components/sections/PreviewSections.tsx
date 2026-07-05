'use client'

// Client wrapper that swaps in portal-injected preview data when editing.
// Source-of-truth order:
//   1. New editing-bridge sections (PORTAL_UPDATE_SECTIONS) — used when the new
//      visual editor is driving the iframe.
//   2. Legacy preview-context sections (PORTAL_UPDATE_SECTION, singular) —
//      kept for the old portal editor until it's fully retired (CP-11).
//   3. SSR sections from Supabase — production path, no portal involvement.
//
// Each section renders inside its own error boundary so one malformed or
// half-formed section (e.g. added via AI apply before its list fields exist)
// degrades to nothing on the live site — never a whole-page crash.

import { usePreviewSections } from '@/contexts/preview-context'
import { useBridgeSections, useEditMode } from '@/lib/editing-bridge'
import SectionRenderer from './SectionRenderer'
import SectionErrorBoundary from './SectionErrorBoundary'
import type { PageSection } from '@/types/content'

interface Props {
  ssrSections: PageSection[]
}

export function PreviewSections({ ssrSections }: Props) {
  const bridgeSections = useBridgeSections()
  const legacySections = usePreviewSections()
  const { active } = useEditMode()
  const sections = (bridgeSections ?? legacySections ?? ssrSections) as PageSection[]

  if (sections.length === 0) {
    return (
      <div className="flex min-h-96 items-center justify-center text-[var(--color-text-muted)]">
        No sections yet — add them in the client portal.
      </div>
    )
  }

  return (
    <>
      {sections.map((section, i) => (
        <SectionErrorBoundary
          key={section.type ?? i}
          resetKey={sectionSignature(section)}
          fallback={active ? <SectionErrorNotice type={section.type} /> : null}
        >
          <SectionRenderer section={section} />
        </SectionErrorBoundary>
      ))}
    </>
  )
}

// Cheap content signature so the boundary retries after the section's content
// changes (only meaningful in the editor, where content updates live).
function sectionSignature(section: PageSection): string {
  try {
    return JSON.stringify(section)
  } catch {
    return String(section?.type ?? '')
  }
}

// Shown only inside the portal editor (edit mode active) so a broken section is
// visible and fixable instead of silently vanishing. Never rendered publicly.
function SectionErrorNotice({ type }: { type?: string }) {
  return (
    <section
      id={type}
      className="mx-auto my-4 max-w-3xl rounded-lg border border-dashed border-[var(--color-text-muted)] px-6 py-8 text-center"
    >
      <p className="text-sm font-medium text-[var(--color-text-muted)]">
        This “{type ?? 'section'}” section has incomplete content and can’t preview yet.
        Fill in its fields to restore it.
      </p>
    </section>
  )
}
