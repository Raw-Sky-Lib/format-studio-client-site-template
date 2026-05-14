import Link from 'next/link'
import Image from 'next/image'
import { getNavItems, getSiteConfig } from '@/lib/queries'
import MobileNav from './MobileNav'

export default async function SiteHeader() {
  const [nav, config] = await Promise.all([getNavItems(), getSiteConfig()])

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          {config.logo_url ? (
            <Image src={config.logo_url} alt={config.site_name} width={120} height={40} className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-lg font-semibold tracking-tight text-[var(--color-text)]">
              {config.site_name || 'Site Name'}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              target={item.is_external ? '_blank' : undefined}
              rel={item.is_external ? 'noopener noreferrer' : undefined}
              className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile nav */}
        <MobileNav items={nav} />
      </div>
    </header>
  )
}
