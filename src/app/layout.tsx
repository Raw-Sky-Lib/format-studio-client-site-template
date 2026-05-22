import type { Metadata } from 'next'
import './globals.css'
import { getSiteConfig } from '@/lib/queries'
import PortalBridge from '@/components/layout/PortalBridge'
import { PreviewProvider } from '@/contexts/preview-context'

// To change fonts: import from 'next/font/google' here and apply the
// CSS variable to <html>. Then update --font-sans in globals.css.
// Example: import { Inter } from 'next/font/google'
//          const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig()

  return {
    title: {
      default: config.seo_title || config.site_name,
      template: `%s | ${config.site_name}`,
    },
    description: config.seo_description || undefined,
    openGraph: {
      siteName: config.site_name,
      images: config.og_image_url ? [{ url: config.og_image_url }] : [],
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <PreviewProvider>
          <PortalBridge />
          {children}
        </PreviewProvider>
      </body>
    </html>
  )
}
