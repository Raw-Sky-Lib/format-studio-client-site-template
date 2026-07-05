'use client'

import type { WhyUsSection as WhyUsSectionType } from '@/types/content'
import { Editable, EditableIcon, EditableList, useEditMode } from '@/lib/editing-bridge'

interface Props {
  section: WhyUsSectionType
  id?: string
}

export default function WhyUsSection({ section, id }: Props) {
  const { active } = useEditMode()

  return (
    <section id={id} className="py-16 sm:py-24 bg-[var(--color-surface-subtle,transparent)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(section.title || active) && (
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            <Editable path="why_us.title" placeholder="Why work with us">{section.title ?? ''}</Editable>
          </h2>
        )}
        {(section.subtitle || active) && (
          <p className="mt-3 max-w-2xl text-lg text-[var(--color-text-muted)]">
            <Editable path="why_us.subtitle" placeholder="What makes us different">{section.subtitle ?? ''}</Editable>
          </p>
        )}

        <EditableList
          path="why_us.items"
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {(Array.isArray(section.items) ? section.items : []).map((item, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] p-6">
              {(item.icon || active) && (
                <EditableIcon
                  path={`why_us.items[${i}].icon`}
                  value={item.icon}
                  size={28}
                  className="text-[var(--color-text)]"
                />
              )}
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                <Editable path={`why_us.items[${i}].title`} placeholder="Reason title">{item.title}</Editable>
              </h3>
              <p className="text-[var(--color-text-muted)]">
                <Editable path={`why_us.items[${i}].description`} placeholder="Why this matters">{item.description}</Editable>
              </p>
            </div>
          ))}
        </EditableList>
      </div>
    </section>
  )
}
