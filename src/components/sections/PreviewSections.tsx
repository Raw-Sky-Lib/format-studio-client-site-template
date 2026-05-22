'use client'

// Client wrapper that swaps in portal-injected preview data when editing.
// When rendered on the public site (not in an iframe) the preview context
// is always null, so it falls back to the SSR sections passed as props.

import { usePreviewSections } from '@/contexts/preview-context'
import SectionRenderer from './SectionRenderer'
import type { PageSection } from '@/types/content'

interface Props {
  ssrSections: PageSection[]
}

export function PreviewSections({ ssrSections }: Props) {
  const previewSections = usePreviewSections()
  const sections = previewSections ?? ssrSections

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
        <SectionRenderer key={section.type ?? i} section={section} />
      ))}
    </>
  )
}
