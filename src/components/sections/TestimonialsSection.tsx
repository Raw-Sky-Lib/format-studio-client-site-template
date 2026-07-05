'use client'

import Image from 'next/image'
import type { TestimonialsSection as TestimonialsSectionType } from '@/types/content'
import { Editable, EditableImage, EditableList, useEditMode } from '@/lib/editing-bridge'

interface Props {
  section: TestimonialsSectionType
  id?: string
}

export default function TestimonialsSection({ section, id }: Props) {
  const { active } = useEditMode()

  return (
    <section id={id} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(section.title || active) && (
          <h2 className="mb-12 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            <Editable path="testimonials.title" placeholder="What people say">{section.title ?? ''}</Editable>
          </h2>
        )}

        <EditableList
          path="testimonials.items"
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {(Array.isArray(section.items) ? section.items : []).map((item, i) => (
            <figure key={i} className="flex flex-col gap-4 rounded-lg border border-[var(--color-border)] p-6">
              <blockquote>
                <p className="text-[var(--color-text-muted)] before:content-['“'] after:content-['”']">
                  <Editable path={`testimonials.items[${i}].quote`} placeholder="What the customer said">{item.quote}</Editable>
                </p>
              </blockquote>
              <figcaption className="flex items-center gap-3">
                {(item.avatar_url || active) && (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <EditableImage
                      path={`testimonials.items[${i}].avatar_url`}
                      src={item.avatar_url}
                      alt={item.author}
                      wrapClassName="absolute inset-0"
                      render={({ src, alt }) => (
                        <Image src={src} alt={alt} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                      )}
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    <Editable path={`testimonials.items[${i}].author`} placeholder="Author name">{item.author}</Editable>
                  </p>
                  {(item.role || active) && (
                    <p className="text-xs text-[var(--color-text-muted)]">
                      <Editable path={`testimonials.items[${i}].role`} placeholder="Role or company">{item.role ?? ''}</Editable>
                    </p>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </EditableList>
      </div>
    </section>
  )
}
