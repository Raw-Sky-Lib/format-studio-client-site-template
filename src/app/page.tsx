import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/queries'
import { PreviewSections } from '@/components/sections/PreviewSections'
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
        <PreviewSections ssrSections={page.sections} />
      </main>
      <SiteFooter />
    </>
  )
}
