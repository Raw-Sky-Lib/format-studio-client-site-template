import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'

export const revalidate = 3600

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  )
}
