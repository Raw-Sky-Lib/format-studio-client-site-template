'use client'

import type { ProcessSection as ProcessSectionType } from '@/types/content'
import { Editable, EditableList, useEditMode } from '@/lib/editing-bridge'

interface Props {
  section: ProcessSectionType
  id?: string
}

function displayNumber(n: string | number | undefined, fallback: number): string {
  if (n === undefined || n === null || n === '') return fallback.toString().padStart(2, '0')
  if (typeof n === 'number') return n.toString().padStart(2, '0')
  return n
}

export default function ProcessSection({ section, id }: Props) {
  const { active } = useEditMode()

  return (
    <section id={id} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(section.title || active) && (
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            <Editable path="process.title" placeholder="How we work">{section.title ?? ''}</Editable>
          </h2>
        )}
        {(section.subtitle || active) && (
          <p className="mt-3 max-w-2xl text-lg text-[var(--color-text-muted)]">
            <Editable path="process.subtitle" placeholder="Our process in N steps">{section.subtitle ?? ''}</Editable>
          </p>
        )}

        <EditableList
          path="process.steps"
          className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {(Array.isArray(section.steps) ? section.steps : []).map((step, i) => (
            <div key={i} className="flex flex-col gap-3">
              <span className="font-mono text-sm tracking-widest text-[var(--color-text-muted)]">
                <Editable path={`process.steps[${i}].number`} placeholder={(i + 1).toString().padStart(2, '0')}>
                  {displayNumber(step.number, i + 1)}
                </Editable>
              </span>
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                <Editable path={`process.steps[${i}].title`} placeholder="Step title">{step.title}</Editable>
              </h3>
              <p className="text-[var(--color-text-muted)]">
                <Editable path={`process.steps[${i}].description`} placeholder="Step description">{step.description}</Editable>
              </p>
            </div>
          ))}
        </EditableList>
      </div>
    </section>
  )
}
