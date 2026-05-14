import type { Metadata } from 'next'
import { getSiteConfig } from '@/lib/queries'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
}

export default async function ContactPage() {
  const config = await getSiteConfig()

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="grid gap-16 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)]">
            Get in touch
          </h1>

          <div className="flex flex-col gap-3 text-[var(--color-text-muted)]">
            {config.contact_email && (
              <a href={`mailto:${config.contact_email}`} className="hover:text-[var(--color-text)]">
                {config.contact_email}
              </a>
            )}
            {config.contact_phone && <span>{config.contact_phone}</span>}
            {config.address && <span>{config.address}</span>}
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  )
}
