'use client'

import Image from 'next/image'
import { Mail, MapPin, Phone } from 'lucide-react'
import type { ContactSection as ContactSectionType } from '@/types/content'
import { Editable, EditableImage, useEditMode } from '@/lib/editing-bridge'

interface Props {
  section: ContactSectionType
  id?: string
}

export default function ContactSection({ section, id }: Props) {
  const { active } = useEditMode()

  return (
    <section id={id} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(section.title || active) && (
          <h2 className="mb-12 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            <Editable path="contact.title" placeholder="Get in touch">{section.title ?? ''}</Editable>
          </h2>
        )}

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            {(section.address || active) && (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-[var(--color-text-muted)]" />
                <p className="text-[var(--color-text-muted)]">
                  <Editable path="contact.address" placeholder="Street, City, State">{section.address ?? ''}</Editable>
                </p>
              </div>
            )}
            {(section.email || active) && (
              <div className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 text-[var(--color-text-muted)]" />
                <p className="text-[var(--color-text-muted)]">
                  <Editable path="contact.email" placeholder="hello@yourbusiness.com">{section.email ?? ''}</Editable>
                </p>
              </div>
            )}
            {(section.phone || active) && (
              <div className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 text-[var(--color-text-muted)]" />
                <p className="text-[var(--color-text-muted)]">
                  <Editable path="contact.phone" placeholder="+1 (555) 000-0000">{section.phone ?? ''}</Editable>
                </p>
              </div>
            )}
          </div>

          {(section.image_url || section.map_embed || active) && (
            <div className="flex flex-col gap-6">
              {(section.image_url || active) && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                  <EditableImage
                    path="contact.image_url"
                    src={section.image_url}
                    alt={section.title ?? 'Contact'}
                    wrapClassName="absolute inset-0"
                    render={({ src, alt }) => (
                      <Image src={src} alt={alt} fill className="object-cover" />
                    )}
                  />
                </div>
              )}
              {section.map_embed && (
                <div
                  className="aspect-[4/3] w-full overflow-hidden rounded-lg [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0"
                  dangerouslySetInnerHTML={{ __html: section.map_embed }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
