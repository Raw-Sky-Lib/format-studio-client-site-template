import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPageBySlug, getPageSlugs } from '@/lib/queries'
import SectionRenderer from '@/components/sections/SectionRenderer'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getPageSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) return {}
  return {
    title: page.seo_title || page.title,
    description: page.seo_description || undefined,
  }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) notFound()

  return (
    <div>
      {page.sections.length === 0 ? (
        <div className="flex min-h-96 items-center justify-center text-[var(--color-text-muted)]">
          No sections yet — add them in the client portal.
        </div>
      ) : (
        page.sections.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))
      )}
    </div>
  )
}
