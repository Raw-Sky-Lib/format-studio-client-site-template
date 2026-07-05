'use client'

import type { FeaturedProjectsSection as FeaturedProjectsSectionType } from '@/types/content'
import { Editable, EditableLink, useEditMode } from '@/lib/editing-bridge'

interface Props {
  section: FeaturedProjectsSectionType
  id?: string
}

export default function FeaturedProjectsSection({ section, id }: Props) {
  const { active } = useEditMode()

  return (
    <section id={id} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-6 text-center">
        {(section.title || active) && (
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            <Editable path="featured_projects.title" placeholder="See our work">{section.title ?? ''}</Editable>
          </h2>
        )}
        {(section.subtitle || active) && (
          <p className="max-w-xl text-lg text-[var(--color-text-muted)]">
            <Editable path="featured_projects.subtitle" placeholder="A teaser line about the projects">{section.subtitle ?? ''}</Editable>
          </p>
        )}

        {(section.cta_label || active) && (
          <EditableLink
            path="featured_projects.cta_url"
            href={section.cta_url}
            className="inline-flex items-center rounded-md bg-[var(--color-text)] px-5 py-2.5 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-80"
          >
            <Editable path="featured_projects.cta_label" placeholder="View projects">
              {section.cta_label ?? ''}
            </Editable>
          </EditableLink>
        )}
      </div>
    </section>
  )
}
