'use client'

import Image from 'next/image'
import type { AboutSection as AboutSectionType } from '@/types/content'
import { Editable, EditableImage, useEditMode } from '@/lib/editing-bridge'

interface Props {
  section: AboutSectionType
  id?: string
}

export default function AboutSection({ section, id }: Props) {
  const { active } = useEditMode()

  return (
    <section id={id} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col gap-12 ${section.image_url ? 'lg:flex-row lg:items-center' : ''}`}>
          <div className="flex flex-col gap-6 lg:flex-1">
            {(section.title || active) && (
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
                <Editable path="about.title" placeholder="About heading">{section.title ?? ''}</Editable>
              </h2>
            )}
            {/* body is Tiptap HTML — edited via the portal textarea / drawer */}
            <div
              className="prose prose-neutral max-w-prose text-[var(--color-text-muted)]"
              dangerouslySetInnerHTML={{ __html: section.body }}
            />
          </div>

          {(section.image_url || active) && (
            <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg lg:flex-none">
              <EditableImage
                path="about.image_url"
                src={section.image_url}
                alt={section.title ?? 'About'}
                wrapClassName="absolute inset-0"
                render={({ src, alt }) => (
                  <Image src={src} alt={alt} fill className="object-cover" />
                )}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
