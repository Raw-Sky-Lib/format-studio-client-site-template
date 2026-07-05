'use client'

import type { FeaturesSection as FeaturesSectionType } from '@/types/content'
import { Editable, EditableIcon, EditableList, useEditMode } from '@/lib/editing-bridge'

interface Props {
  section: FeaturesSectionType
  id?: string
}

export default function FeaturesSection({ section, id }: Props) {
  const { active } = useEditMode()

  return (
    <section id={id} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(section.title || active) && (
          <h2 className="mb-12 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            <Editable path="features.title" placeholder="Section heading">{section.title ?? ''}</Editable>
          </h2>
        )}

        <EditableList
          path="features.items"
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {(Array.isArray(section.items) ? section.items : []).map((item, i) => (
            <div key={i} className="flex flex-col gap-3">
              {(item.icon || active) && (
                <EditableIcon
                  path={`features.items[${i}].icon`}
                  value={item.icon}
                  size={28}
                  className="text-[var(--color-text)]"
                />
              )}
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                <Editable path={`features.items[${i}].title`} placeholder="Feature title">{item.title}</Editable>
              </h3>
              <p className="text-[var(--color-text-muted)]">
                <Editable path={`features.items[${i}].description`} placeholder="What this feature does">{item.description}</Editable>
              </p>
            </div>
          ))}
        </EditableList>
      </div>
    </section>
  )
}
