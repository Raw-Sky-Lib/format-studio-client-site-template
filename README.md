# format-studio-client-site-template

A Next.js GitHub Template used by Format Studio to bootstrap new client websites. Every client site starts from this template, connected to their Supabase project and the Format Studio agency ecosystem (Agency Hub + Client Portal).

---

## What This Is

- **Next.js 16** (App Router, SSR, ISR)  
- **Supabase** — client's own project, anon key, RLS
- **Data-driven** — zero hardcoded content, everything from Supabase
- **Portal-connected** — ISR webhook wired for client-portal on-demand revalidation
- **Unstyled** — CSS custom properties as design token hooks, Tailwind utilities only

---

## For Format Studio Team — New Client Setup

### Step 1 — Create repo from template

Click **"Use this template"** on GitHub → create a new private repo for the client.

### Step 2 — Run Supabase migrations

In the client's Supabase project (SQL editor or Supabase CLI):

```bash
# Run all migrations in order
supabase/migrations/001_core.sql
supabase/migrations/002_pages.sql
supabase/migrations/003_blog.sql
supabase/migrations/004_portfolio.sql   # Skip if client doesn't need portfolio
supabase/migrations/005_forms.sql
supabase/migrations/006_media.sql
supabase/migrations/007_rls.sql
```

Also create the Supabase Storage bucket:
- Name: `media`
- Public: yes
- File size limit: 5MB
- Allowed types: `image/jpeg, image/png, image/webp, image/gif, image/svg+xml`

### Step 3 — Set environment variables

Copy `.env.example` to `.env.local` and fill in values from the client's Supabase project:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
REVALIDATE_SECRET=
SITE_URL=
```

`REVALIDATE_SECRET` — generate a random string and also set this as the matching secret in the client-portal tenant config.

### Step 4 — Apply branding

1. Open `src/app/globals.css` and update the CSS custom properties:
   ```css
   :root {
     --color-bg:         #ffffff;   /* ← client background */
     --color-text:       #111111;   /* ← client primary text */
     --color-accent:     #0066ff;   /* ← client accent/CTA colour */
     /* ... */
   }
   ```
2. Add the client's font via `next/font/google` in `src/app/layout.tsx`.
3. Place the client's logo at `public/logo.svg` and set `logo_url` in `site_settings`.

### Step 5 — Register with Agency Hub

In Agency Hub → Client → Deploy → set the Supabase credentials and site URL, then click **Register with Portal**. This wires up the client-portal CMS to this site.

### Step 6 — Deploy to Vercel

Push to GitHub → Import in Vercel → set environment variables → deploy. The Cron job in `vercel.json` pings `/api/health` every 3 days.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout — metadata from site_settings
│   ├── page.tsx                # Home — renders 'home' page sections
│   ├── globals.css             # Design token CSS vars + base styles
│   ├── (site)/
│   │   ├── layout.tsx          # Header + Footer shell
│   │   ├── [slug]/page.tsx     # Dynamic CMS pages (about, services, etc.)
│   │   ├── blog/               # Blog list + post detail
│   │   ├── work/               # Portfolio grid + project detail
│   │   └── contact/            # Contact form → form_submissions
│   └── api/
│       ├── health/             # Supabase ping (Vercel Cron keep-alive)
│       ├── revalidate/         # ISR webhook (called by client-portal)
│       └── submit-form/        # Contact form handler
├── components/
│   ├── layout/                 # SiteHeader, SiteFooter, MobileNav
│   ├── sections/               # SectionRenderer + section components
│   ├── blog/                   # PostCard
│   └── work/                   # ProjectCard
├── lib/
│   ├── queries.ts              # All Supabase reads
│   ├── supabase/               # Server + browser clients
│   └── utils.ts                # cn(), formatDate(), slugify()
└── types/
    └── content.ts              # TypeScript interfaces (mirrors DB schema)

supabase/migrations/            # SQL — run once per client Supabase project
```

---

## Content Managed via Client Portal

All content is managed through the Format Studio client-portal. Clients never touch Supabase directly.

| Portal feature | What it writes | Where it shows on site |
|---|---|---|
| Pages editor | `pages.sections` JSONB | Home + dynamic `[slug]` pages |
| Blog editor | `posts` table | `/blog` + `/blog/[slug]` |
| Portfolio editor | `projects` + `project_images` | `/work` + `/work/[slug]` |
| Settings → General | `site_settings` | Header, footer, SEO |
| Settings → Nav | `nav_items` | Header + footer navigation |
| Forms inbox | reads `form_submissions` | Submitted by `/api/submit-form` |
| Media library | `media` + Supabase Storage | Picked in all content editors |

After every save in the portal, it calls `POST /api/revalidate` on this site to trigger ISR on the changed paths.

---

## Adding / Removing Modules

See [EXTENDING.md](EXTENDING.md) for step-by-step instructions on:
- Adding a new section type (e.g. `pricing`, `team`)
- Adding a new content type (e.g. `services`, `events`)
- Removing the portfolio module for clients who don't need it
