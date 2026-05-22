import Image from 'next/image'
import type { TestimonialsSection as TestimonialsSectionType } from '@/types/content'

interface Props {
  section: TestimonialsSectionType
  id?: string
}

export default function TestimonialsSection({ section, id }: Props) {
  return (
    <section id={id} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {section.title && (
          <h2 className="mb-12 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            {section.title}
          </h2>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item, i) => (
            <figure key={i} className="flex flex-col gap-4 rounded-lg border border-[var(--color-border)] p-6">
              <blockquote>
                <p className="text-[var(--color-text-muted)] before:content-['“'] after:content-['”']">
                  {item.quote}
                </p>
              </blockquote>
              <figcaption className="flex items-center gap-3">
                {item.avatar_url && (
                  <Image
                    src={item.avatar_url}
                    alt={item.author}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{item.author}</p>
                  {item.role && (
                    <p className="text-xs text-[var(--color-text-muted)]">{item.role}</p>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
