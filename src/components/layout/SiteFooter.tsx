import Link from 'next/link'
import { getSiteConfig, getNavItems } from '@/lib/queries'

export default async function SiteFooter() {
  const [config, nav] = await Promise.all([getSiteConfig(), getNavItems()])

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-base font-semibold text-[var(--color-text)]">
              {config.site_name}
            </span>
            {config.contact_email && (
              <a
                href={`mailto:${config.contact_email}`}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                {config.contact_email}
              </a>
            )}
            {config.contact_phone && (
              <span className="text-sm text-[var(--color-text-muted)]">{config.contact_phone}</span>
            )}
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
            {nav.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                target={item.is_external ? '_blank' : undefined}
                rel={item.is_external ? 'noopener noreferrer' : undefined}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {(config.social_instagram || config.social_twitter || config.social_linkedin) && (
            <div className="flex items-center gap-4">
              {config.social_instagram && (
                <a href={config.social_instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  Instagram
                </a>
              )}
              {config.social_twitter && (
                <a href={config.social_twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  Twitter
                </a>
              )}
              {config.social_linkedin && (
                <a href={config.social_linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-[var(--color-border)] pt-6">
          <p className="text-xs text-[var(--color-text-muted)]">
            {config.footer_text || `© ${new Date().getFullYear()} ${config.site_name}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  )
}
