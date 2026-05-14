import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/queries'
import SectionRenderer from '@/components/sections/SectionRenderer'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'

export const revalidate = 3600

export default async function HomePage() {
  const page = await getPageBySlug('home')
  if (!page) notFound()

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {page.sections.length === 0 ? (
          <div className="flex min-h-96 items-center justify-center text-[var(--color-text-muted)]">
            No sections yet — add them in the client portal.
          </div>
        ) : (
          page.sections.map((section, i) => (
            <SectionRenderer key={i} section={section} />
          ))
        )}
      </main>
      <SiteFooter />
    </>
  )
}
