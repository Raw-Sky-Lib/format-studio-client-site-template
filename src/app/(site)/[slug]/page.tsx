import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPageBySlug, getPageSlugs } from '@/lib/queries'
import { PreviewSections } from '@/components/sections/PreviewSections'

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
    <main className="flex-1">
      <PreviewSections ssrSections={page.sections} />
    </main>
  )
}
