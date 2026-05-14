# Extending the Template

This document explains how to add new content types and section types to a client site built from this template. Follow these patterns to keep things consistent and portal-compatible.

---

## Adding a New Section Type

Sections live in the `sections` JSONB column of the `pages` table. No migration needed — sections are free-form. You only need to:

**1. Define the type in `src/types/content.ts`**

```typescript
export interface PricingSection {
  type: 'pricing'
  title?: string
  items: { name: string; price: string; features: string[] }[]
}

// Add to the PageSection union:
export type PageSection =
  | HeroSection
  | FeaturesSection
  | AboutSection
  | TestimonialsSection
  | CTASection
  | PricingSection  // ← add here
```

**2. Create the component at `src/components/sections/PricingSection.tsx`**

```typescript
import type { PricingSection as PricingSectionType } from '@/types/content'

export default function PricingSection({ section }: { section: PricingSectionType }) {
  return (
    <section className="py-16 sm:py-24">
      {/* ... */}
    </section>
  )
}
```

**3. Add a case to `src/components/sections/SectionRenderer.tsx`**

```typescript
import PricingSection from './PricingSection'

case 'pricing':
  return <PricingSection section={section} />
```

**4. Tell Format Studio** to add the section type to the client-portal's section editor list for this client. The portal stores the JSONB with `type: 'pricing'` — the renderer picks it up automatically.

---

## Adding a New Content Type

Example: adding a `services` content type.

**1. Write the migration**

Create `supabase/migrations/008_services.sql`:

```sql
CREATE TABLE IF NOT EXISTS services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  "order"     INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS services_published_idx ON services (is_published, "order");
```

Add RLS to `007_rls.sql` (or a new `008_rls_services.sql`):

```sql
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_services" ON services FOR SELECT TO anon USING (is_published = TRUE);
```

Run this migration in the client's Supabase project.

**2. Add the TypeScript type to `src/types/content.ts`**

```typescript
export interface Service {
  id: string
  slug: string
  title: string
  description: string | null
  icon: string | null
  is_published: boolean
  order: number
  created_at: string
}
```

**3. Add query functions to `src/lib/queries.ts`**

```typescript
export async function getServices(): Promise<Service[]> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_published', true)
    .order('order', { ascending: true })
  if (error) throw error
  return data ?? []
}
```

**4. Create the route and page**

`src/app/(site)/services/page.tsx`:

```typescript
import { getServices } from '@/lib/queries'

export const metadata = { title: 'Services' }

export default async function ServicesPage() {
  const services = await getServices()
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* render services */}
    </div>
  )
}
```

**5. Add to nav** via the client-portal Settings → Navigation editor, or directly in `site_settings` seed.

**6. Add to `next.config.ts` image domains** if the content type has images from a new host.

---

## Removing the Portfolio Module

If this client site doesn't need a portfolio:

1. Skip `supabase/migrations/004_portfolio.sql` — don't run it.
2. Delete `src/app/(site)/work/` entirely.
3. Remove the portfolio query functions from `src/lib/queries.ts` (`getPublishedProjects`, `getFeaturedProjects`, `getProjectBySlug`, `getProjectImages`, `getProjectSlugs`).
4. Remove `Project`, `ProjectImage` from `src/types/content.ts`.
5. Remove `src/components/work/`.
6. Remove the Work nav item from the `nav_items` seed in `001_core.sql` (for future clients).

---

## Removing the Blog Module

1. Skip `supabase/migrations/003_blog.sql`.
2. Delete `src/app/(site)/blog/`.
3. Remove blog query functions from `src/lib/queries.ts`.
4. Remove `Post` from `src/types/content.ts`.
5. Remove `src/components/blog/`.

---

## Design Tokens

All components use CSS custom properties from `globals.css`. To add a new token:

1. Add it to `:root` in `globals.css`:
   ```css
   --color-highlight: #fbbf24;
   ```
2. Use it in components:
   ```tsx
   <span style={{ color: 'var(--color-highlight)' }} />
   /* or via Tailwind arbitrary value: */
   <span className="text-[var(--color-highlight)]" />
   ```

Never hardcode hex values in component files. Always go through a CSS variable.
