'use client'

import Image from 'next/image'
import type { HeroSection as HeroSectionType } from '@/types/content'
import { Editable, EditableImage, EditableLink, useEditMode } from '@/lib/editing-bridge'

interface Props {
  section: HeroSectionType
  id?: string
}

export default function HeroSection({ section, id }: Props) {
  const { active } = useEditMode()

  return (
    <section id={id} className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col gap-12 ${section.image_url ? 'lg:flex-row lg:items-center' : ''}`}>
          <div className="flex flex-col gap-6 lg:flex-1">
            <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">
              <Editable path="hero.headline" placeholder="Your compelling headline">{section.headline}</Editable>
            </h1>

            {(section.subheadline || active) && (
              <p className="max-w-xl text-lg text-[var(--color-text-muted)] sm:text-xl">
                <Editable path="hero.subheadline" placeholder="Supporting text beneath the headline">{section.subheadline ?? ''}</Editable>
              </p>
            )}

            {(section.cta_label || active) && (
              <div className="flex gap-4">
                <EditableLink
                  path="hero.cta_url"
                  href={section.cta_url}
                  className="inline-flex items-center rounded-md bg-[var(--color-text)] px-5 py-2.5 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-80"
                >
                  <Editable path="hero.cta_label" placeholder="Button label">
                    {section.cta_label ?? ''}
                  </Editable>
                </EditableLink>
              </div>
            )}
          </div>

          {(section.image_url || active) && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg lg:flex-1">
              <EditableImage
                path="hero.image_url"
                src={section.image_url}
                alt={section.headline}
                wrapClassName="absolute inset-0"
                render={({ src, alt }) => (
                  <Image src={src} alt={alt} fill className="object-cover" priority />
                )}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
