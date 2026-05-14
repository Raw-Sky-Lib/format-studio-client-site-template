import type { FeaturesSection as FeaturesSectionType } from '@/types/content'

interface Props {
  section: FeaturesSectionType
}

export default function FeaturesSection({ section }: Props) {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {section.title && (
          <h2 className="mb-12 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            {section.title}
          </h2>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item, i) => (
            <div key={i} className="flex flex-col gap-3">
              {item.icon && (
                <span className="text-2xl">{item.icon}</span>
              )}
              <h3 className="text-lg font-semibold text-[var(--color-text)]">{item.title}</h3>
              <p className="text-[var(--color-text-muted)]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
