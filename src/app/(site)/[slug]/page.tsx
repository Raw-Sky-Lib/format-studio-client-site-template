import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPageBySlug, getPageSlugs, getSiteConfig } from '@/lib/queries'
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
  // Per-page social-share image, falling back to the site-wide default.
  const config = await getSiteConfig()
  const ogImage = page.og_image_url || config.og_image_url
  const title = page.seo_title || page.title
  const description = page.seo_description || undefined
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : [],
    },
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
