'use client'

import type { EmbedSection as EmbedSectionType } from '@/types/content'
import { Editable, useEditMode } from '@/lib/editing-bridge'

interface Props {
  section: EmbedSectionType
  id?: string
}

export default function EmbedSection({ section, id }: Props) {
  const { active } = useEditMode()

  return (
    <section id={id} className="py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col gap-4">
        {section.embed_code && (
          <div
            className="overflow-hidden rounded-lg border border-[var(--color-border)] [&>iframe]:w-full [&>iframe]:border-0"
            dangerouslySetInnerHTML={{ __html: section.embed_code }}
          />
        )}
        {(section.caption || active) && (
          <p className="text-center text-sm text-[var(--color-text-muted)]">
            <Editable path="embed.caption" placeholder="Caption (optional)">{section.caption ?? ''}</Editable>
          </p>
        )}
      </div>
    </section>
  )
}
