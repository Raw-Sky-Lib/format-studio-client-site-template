import Link from 'next/link'
import Image from 'next/image'
import type { HeroSection as HeroSectionType } from '@/types/content'

interface Props {
  section: HeroSectionType
}

export default function HeroSection({ section }: Props) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col gap-12 ${section.image_url ? 'lg:flex-row lg:items-center' : ''}`}>
          <div className="flex flex-col gap-6 lg:flex-1">
            <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl">
              {section.headline}
            </h1>

            {section.subheadline && (
              <p className="max-w-xl text-lg text-[var(--color-text-muted)] sm:text-xl">
                {section.subheadline}
              </p>
            )}

            {section.cta_label && section.cta_url && (
              <div className="flex gap-4">
                <Link
                  href={section.cta_url}
                  className="inline-flex items-center rounded-md bg-[var(--color-text)] px-5 py-2.5 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-80"
                >
                  {section.cta_label}
                </Link>
              </div>
            )}
          </div>

          {section.image_url && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg lg:flex-1">
              <Image
                src={section.image_url}
                alt={section.headline}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
