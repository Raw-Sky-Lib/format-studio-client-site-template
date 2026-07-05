# Extending the Template

This document explains how to add new content types and section types to a client site built from this template. Follow these patterns to keep things consistent and portal-compatible.

---

## Adding a New Section Type

> Quick-reference recipe. The full rules (bridge primitives, link patterns, icon strategy, image patterns, list patterns, file checklist) live in `CLAUDE.md` → "Editing Bridge — How to Build Section Components". Read that first, then follow this recipe.

Sections live in the `sections` JSONB column of the `pages` table. No migration needed — sections are free-form. You update four files in this repo plus (if the section has lists) one file in the portal repo.

**1. Define the type in `src/types/content.ts`**

```typescript
export interface PricingSection {
  type: 'pricing'
  title?: string
  items: { name: string; price: string; features: string[] }[]
}

// Add to the SectionType union:
export type SectionType =
  | 'hero' | 'features' | 'about' | 'testimonials' | 'cta'
  | 'why_us' | 'process' | 'featured_projects' | 'contact' | 'embed'
  | 'pricing'   // ← add here

// Add to the PageSection union:
export type PageSection =
  | HeroSection | FeaturesSection | AboutSection | TestimonialsSection | CTASection
  | WhyUsSection | ProcessSection | FeaturedProjectsSection | ContactSection | EmbedSection
  | PricingSection
```

**2. Create the component at `src/components/sections/PricingSection.tsx`**

The component MUST be a client component (`'use client'`) so it can use the `useEditMode()` hook. Wrap every editable text field with `<Editable>`, every list with `<EditableList>`, every image with `<EditableImage>`. Pass placeholders so empty fields are visible in edit mode. Render an edit-mode shell for fields that may be empty (`(field || active) && …`).

```tsx
'use client'

import type { PricingSection as PricingSectionType } from '@/types/content'
import { Editable, EditableList, useEditMode } from '@/lib/editing-bridge'

interface Props {
  section: PricingSectionType
  id?: string
}

export default function PricingSection({ section, id }: Props) {
  const { active } = useEditMode()

  return (
    <section id={id} className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(section.title || active) && (
          <h2 className="mb-12 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
            <Editable path="pricing.title" placeholder="Pricing">
              {section.title ?? ''}
            </Editable>
          </h2>
        )}

        {/* Grid classes go on EditableList — its direct children become grid items. */}
        <EditableList
          path="pricing.items"
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {section.items.map((item, i) => (
            <div key={i} className="rounded-lg border border-[var(--color-border)] p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                <Editable path={`pricing.items[${i}].name`} placeholder="Plan name">
                  {item.name}
                </Editable>
              </h3>
              <p className="mt-2 text-2xl font-bold">
                <Editable path={`pricing.items[${i}].price`} placeholder="$0">
                  {item.price}
                </Editable>
              </p>
              {/* features is a string[] — render flat; portal edits via JSON drawer for now */}
              <ul className="mt-4 space-y-1 text-[var(--color-text-muted)]">
                {item.features.map((f, j) => <li key={j}>· {f}</li>)}
              </ul>
            </div>
          ))}
        </EditableList>
      </div>
    </section>
  )
}
```

**3. Add a case to `src/components/sections/SectionRenderer.tsx`**

Pass `id={section.type}` — required so `PORTAL_SCROLL_TO` can land on the right element.

```tsx
import PricingSection from './PricingSection'

case 'pricing':
  return <PricingSection section={section} id={section.type} />
```

**4. Add to `src/components/sections/manifest.ts`**

```typescript
pricing: {
  label: 'Pricing',
  fields: {
    title: { type: 'text', label: 'Heading', placeholder: 'Pricing' },
    items: {
      type: 'list',
      label: 'Plans',
      item: {
        name:     { type: 'text',     label: 'Plan name', required: true },
        price:    { type: 'text',     label: 'Price',     placeholder: '$29/mo' },
        features: { type: 'textarea', label: 'Features (one per line)' },
      },
    },
  },
}
```

**5. Add a `LIST_DEFAULTS` entry in the portal repo** (`Client-Management/web/src/features/pages/lib/defaults.ts`) for every list in the section:

```typescript
export const LIST_DEFAULTS = {
  // …existing entries…
  'pricing.items': { name: '', price: '', features: [] as string[] },
}
```

This is the blank-item shape the portal inserts when the user clicks Add on an empty pricing list. Without this entry, Add will fall back to `{}` and your component will render a misshapen item.

The portal picks up everything else automatically — no portal code changes needed beyond `LIST_DEFAULTS`.

---

## Adding Image Fields to a Section

If a section has an image, declare it with `type: 'image'` in the manifest:

```typescript
// src/components/sections/manifest.ts
hero: {
  label: 'Hero',
  fields: {
    headline:    { type: 'text',  label: 'Headline', required: true },
    image_url:   { type: 'image', label: 'Hero image' },   // ← image field
  }
}
```

**What `type: 'image'` does:**
- The portal renders this field as an `ImagePickerField` — a thumbnail preview + "Choose from media library" button that opens the client's Supabase Storage browser
- The stored value in the section JSONB is always a full Supabase Storage public URL:
  ```
  https://{project-ref}.supabase.co/storage/v1/object/public/media/{folder}/{file}
  ```
- No FK reference — just a plain string URL

**In the component**, render the image exactly like any other section prop:

```typescript
export default function HeroSection({ section, id }: Props) {
  return (
    <section id={id} className="...">
      {section.image_url && (
        <Image src={section.image_url} alt={section.headline} fill className="object-cover" />
      )}
    </section>
  )
}
```

**Storage folder setup**: when adding an image field to a new section type, document in the project's M0 setup which folder the images should be uploaded to (e.g. `hero/`, `about/`, `team/`). The developer creates the folder during M0 Step 5d and uploads the initial client image before handoff.

---

## Adding Embed Fields to a Section

Embed fields hold a raw HTML string — typically a single `<iframe>` tag from Google Maps, Calendly, YouTube, Typeform, or any other third-party widget.

**1. Declare with `type: 'embed'` in the manifest:**

```typescript
// src/components/sections/manifest.ts
contact: {
  label: 'Contact',
  fields: {
    address:   { type: 'text',  label: 'Address' },
    email:     { type: 'text',  label: 'Email' },
    map_embed: { type: 'embed', label: 'Map embed' },  // ← embed field
  }
}
```

**What `type: 'embed'` does in the portal:**
- Renders as an `EmbedCodeField` — a monospace textarea where the client pastes the provider's embed code, with a toggleable sandboxed iframe preview below it
- The stored value in the section JSONB is a raw HTML string (no transformation applied)

**2. Render with `dangerouslySetInnerHTML` in the site component:**

```typescript
export default function ContactSection({ section, id }: Props) {
  return (
    <section id={id} className="...">
      {/* text fields */}
      <p>{section.address}</p>

      {/* embed field — render the raw HTML the client pasted in the portal */}
      {section.map_embed && (
        <div
          className="aspect-video w-full overflow-hidden rounded-xl"
          dangerouslySetInnerHTML={{ __html: section.map_embed }}
        />
      )}
    </section>
  )
}
```

Do not sanitise or re-parse the value. The client controls what they paste — render it as-is.

**3. TypeScript type:**

```typescript
export interface ContactSection {
  type: 'contact'
  address?: string
  email?: string
  phone?: string
  map_embed?: string  // raw <iframe> HTML or empty string
}
```

**Seeding during M0:** if the client's brief includes a location, get the `<iframe>` from Google Maps → Share → Embed a map and seed it directly into the section JSONB. If no embed code is available, set the field to `""` — the client updates it themselves in the portal.

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
