import Link from 'next/link'
import type { CTASection as CTASectionType } from '@/types/content'

interface Props {
  section: CTASectionType
}

export default function CTASection({ section }: Props) {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            {section.headline}
          </h2>

          {section.subheadline && (
            <p className="max-w-xl text-lg text-[var(--color-text-muted)]">
              {section.subheadline}
            </p>
          )}

          {section.button_label && section.button_url && (
            <Link
              href={section.button_url}
              className="inline-flex items-center rounded-md bg-[var(--color-text)] px-6 py-3 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-80"
            >
              {section.button_label}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
