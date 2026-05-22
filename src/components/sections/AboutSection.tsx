import Image from 'next/image'
import type { AboutSection as AboutSectionType } from '@/types/content'

interface Props {
  section: AboutSectionType
  id?: string
}

export default function AboutSection({ section, id }: Props) {
  return (
    <section id={id} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col gap-12 ${section.image_url ? 'lg:flex-row lg:items-center' : ''}`}>
          <div className="flex flex-col gap-6 lg:flex-1">
            {section.title && (
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
                {section.title}
              </h2>
            )}
            {/* body may contain HTML from Tiptap — rendered safely */}
            <div
              className="prose prose-neutral max-w-prose text-[var(--color-text-muted)]"
              dangerouslySetInnerHTML={{ __html: section.body }}
            />
          </div>

          {section.image_url && (
            <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg lg:flex-none">
              <Image
                src={section.image_url}
                alt={section.title ?? 'About'}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
