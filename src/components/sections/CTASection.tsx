'use client'

import type { CTASection as CTASectionType } from '@/types/content'
import { Editable, EditableLink, useEditMode } from '@/lib/editing-bridge'

interface Props {
  section: CTASectionType
  id?: string
}

export default function CTASection({ section, id }: Props) {
  const { active } = useEditMode()

  return (
    <section id={id} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            <Editable path="cta.headline" placeholder="Ready to start?">{section.headline}</Editable>
          </h2>

          {(section.subheadline || active) && (
            <p className="max-w-xl text-lg text-[var(--color-text-muted)]">
              <Editable path="cta.subheadline" placeholder="A line of supporting copy">{section.subheadline ?? ''}</Editable>
            </p>
          )}

          {(section.button_label || active) && (
            <EditableLink
              path="cta.button_url"
              href={section.button_url}
              className="inline-flex items-center rounded-md bg-[var(--color-text)] px-6 py-3 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-80"
            >
              <Editable path="cta.button_label" placeholder="Get in touch">
                {section.button_label ?? ''}
              </Editable>
            </EditableLink>
          )}
        </div>
      </div>
    </section>
  )
}
