# CLAUDE.md — format-studio-client-site-template

> GitHub Template Repository — bootstraps Format Studio client websites.
> Stack: Next.js 16 · React 19 · TypeScript (strict) · Tailwind v4 · Supabase

---

## Project Kickoff Command

When the user types **"start"**, **"initiate project"**, or **"new client"**, run this workflow — do not start writing code.

### Step 1 — Ask for the requirements file

Reply with exactly this:

> Drop the client requirements file (markdown, text, or PDF) or paste the brief here. Include anything you have: project name, site URL, brand notes, pages needed, features (blog, portfolio, booking, etc.), GitHub repo name.

Wait for the user to provide it. Do not proceed until you have received the requirements brief.

### Step 2 — Extract project variables

Read the requirements and extract the following. Ask only for anything that is genuinely missing and cannot be inferred:

| Variable | How to derive |
|----------|--------------|
| `PROJECT_NAME` | Full client/project display name |
| `CLIENT_SLUG` | Lowercase, hyphenated (e.g. `acme-studio`) |
| `TEAM_ID` | 2–3 uppercase initials from project name (e.g. `AS`) — ask to confirm |
| `GITHUB_REPO` | From requirements, or derive as `client-{CLIENT_SLUG}` |
| `SITE_URL` | From requirements, or leave `[SITE_URL]` if not yet known |
| **Blog?** | Yes / No — inferred from requirements |
| **Portfolio/Work?** | Yes / No — inferred from requirements |
| **Custom features** | List any bespoke features not in the standard template |
| **Custom pages** | Any pages beyond home, about, contact |

### Step 3 — Confirm the plan

Output a short confirmation block before generating anything:

```
PROJECT:    [PROJECT_NAME]
TEAM ID:    [TEAM_ID]
REPO:       [GITHUB_REPO]
SITE:       [SITE_URL]

MODULES:
  ✓ Core (home, about, contact, layout)
  [✓/✗] Blog
  [✓/✗] Portfolio/Work
  [list any custom features]

CUSTOM ISSUES:
  [list any bespoke issues that will be added beyond the standard template]
```

Ask: "Does this look right? I'll generate the Linear setup once you confirm."

### Step 4 — Generate the Linear setup

Once confirmed, output two things:

**A) Filled-out LINEAR-SETUP.md**

Start from the template in `.claude/LINEAR-SETUP.md`. Replace all `{{PLACEHOLDERS}}` with real values. Remove optional milestone sections (M6, M7, M8) that don't apply. For any custom features, add issues to M8 with sequential numbering continuing from where the standard issues end. Renumber all issues sequentially starting from `{TEAM_ID}-1`.

Tell the user: "Save this as `.claude/LINEAR-SETUP.md` in the project repo."

**B) CSV import block**

Output only the CSV rows (no markdown fences, no headers other than the column row) so the user can paste directly into a `.csv` file.

Tell the user: "Save this as `{CLIENT_SLUG}-linear-import.csv` and import via Linear → Settings → Import → CSV Import."

### Step 5 — Bootstrap M0

After outputting both files, immediately walk through M0 without waiting for a prompt:

1. Tell the user to create `.env.local` at the project root and fill it in from the Agency Hub client record. Output this template — do not pre-fill values, do not ask for values in chat:
   ```env
   # [PROJECT_NAME] — local development
   # Fill these in from the Agency Hub client record. Never commit this file.

   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=

   REVALIDATE_SECRET=           # generate: openssl rand -hex 32

   NEXT_PUBLIC_SITE_URL=        # e.g. https://[CLIENT_SLUG].com
   ```
   Ask the user to confirm once `.env.local` is filled in before continuing.

2. Once the user confirms `.env.local` is ready, run all of the following automatically — do not ask the user to do any of these steps:
   a. Read `.env.local`. Extract the Supabase project ref from `NEXT_PUBLIC_SUPABASE_URL` — it is the subdomain before `.supabase.co` (e.g. `https://abcdefghijkl.supabase.co` → ref is `abcdefghijkl`).
   b. Run: `supabase link --project-ref <extracted-ref>`
   c. Run migrations via Supabase MCP in this order, confirming each before proceeding:
      - Always: `supabase/migrations/001_core.sql`, `supabase/migrations/002_rls.sql`
      - If blog module applies: `supabase/migrations/003_blog.sql`
      - If portfolio module applies: `supabase/migrations/004_portfolio.sql`
   d. Tell the user M0 is complete and confirm which migrations ran. Suggest `pnpm install && pnpm dev` to verify the setup.

---

## What This Repo Is

A template that Format Studio clones for each new client website. It only works in conjunction with:

- **Client's Supabase project** — content database, anon key + RLS
- **Client Portal** — the CMS the client uses to manage content after launch
- **Agency Hub** — registers the client, pushes credentials to the portal, sends the invite

When working on a cloned client site, changes stay in that client's repo. Changes here only affect future clients.

**Who builds the first site:** The developer and Claude build the full site — all pages, sections, and content are coded and seeded directly into the client's Supabase during the project. The client receives a finished, content-populated, live site. Content is never left as placeholder stubs.

**What the client portal is for:** Ongoing CMS management after handoff — the client updates copy, hero text, blog posts, nav items, site settings, etc. The portal is not used during the initial build phase. The developer and Claude seed all initial content from the requirements brief directly via Supabase MCP.

---

## Architecture

```
Agency Hub
  ↓ registers client, pushes Supabase credentials to portal, sends invite email
Client Portal (CMS — post-launch management only)
  ↓ client logs in, reads/writes content to their Supabase
  ↓ portal backend calls POST /api/revalidate after every content save
Client Site (this repo)
  ↑ reads content from Supabase at build/request time
  ↑ serves public site via Next.js ISR
```

> The developer and Claude seed all initial content directly into Supabase during the build phase. The portal is not involved in the first build.

---

## Write Paths (only two)

1. `POST /api/submit-form` → inserts into `form_submissions`
2. `POST /api/revalidate` → triggers ISR (does NOT write content)

Everything else is read-only via the anon key. The client-portal uses the service role key to write content — that key never appears in this repo.

---

## Supabase Schema (quick ref)

```
site_settings(key, value)                           → site config, SEO, socials
nav_items(label, url, order, is_external)           → navigation
pages(slug, title, sections JSONB, is_published)    → CMS pages
posts(slug, title, content HTML, is_published)      → blog
projects(slug, title, is_featured, is_published)    → portfolio (optional)
project_images(project_id, url, order)              → portfolio images
form_submissions(form_name, data JSONB)             → contact form inbox
media(filename, url, mime_type)                     → media library metadata
```

---

## ISR Strategy

- **Time-based:** `export const revalidate = 3600` on all layouts/pages
- **On-demand:** `POST /api/revalidate` → validates `X-Revalidate-Secret` → `revalidatePath()`

After the client-portal saves content to Supabase it immediately calls `POST /api/revalidate`.
The live site reflects the change on the next visitor request — no rebuild, no redeploy.

---

## Sections Data Shape — Critical Contract

`pages.sections` is stored in Supabase as a **JSON array**. Every element carries a `type` field.

```json
[
  { "type": "hero",     "headline": "...", "subheadline": "...", "cta_label": "...", "cta_url": "..." },
  { "type": "features", "title": "...",   "items": [...] },
  { "type": "cta",      "headline": "...", "button_label": "...", "button_url": "..." }
]
```

**Never store sections as a keyed object** (`{ hero: {...}, features: {...} }`).
The portal CMS, the template renderer, and the `SectionEditor` all depend on the array format.

Adding a new section: append an object with the correct `type` to the array.
Removing a section: remove the element from the array.
Reordering: change the position in the array — array order is render order.

---

## Portal CMS Integration

The client-portal embeds this site in an iframe for live content editing.
Three files wire up that integration — **do not delete or break them**.

### PortalBridge (`src/components/layout/PortalBridge.tsx`)

Mounted once in the root layout. Has no effect when the site is viewed in a normal browser tab (`window.self === window.top` guard). Inside the portal iframe it:

| Message received | Action |
|-----------------|--------|
| `PORTAL_SET_MODE: 'edit'` | Adds `__portal-edit-mode` class to `<body>` — enables cursor + click interception |
| `PORTAL_SET_MODE: 'preview'` | Removes class, clears all highlights |
| `PORTAL_SCROLL_TO: { section }` | Scrolls to `<section id={section}>`, adds highlight outline |
| `PORTAL_UPDATE_SECTION: { sections }` | Calls `setPreviewSections()` in PreviewContext — instant live update |

| Message sent | When |
|-------------|------|
| `PORTAL_SECTION_CLICK: { section }` | User clicks a `<section id>` in edit mode |
| `PORTAL_SECTION_VISIBLE: { section }` | Most-visible section changes (debounced, scroll observer) |

PortalBridge defaults to edit mode on mount — the portal sends `PORTAL_SET_MODE: 'preview'` if needed.
In edit mode, `e.preventDefault()` + `e.stopPropagation()` are called on every click inside the iframe so links don't navigate and site JS handlers don't fire.

### PreviewContext (`src/contexts/preview-context.tsx`)

Client-side context holding portal-injected section overrides. Only activates inside an iframe.

`PreviewSections` reads the full sections array from context and re-renders the whole page when the portal sends an update — individual section components don't need to import or call any context hook. They just render whatever `section` prop they receive, which is already the portal-injected version when editing.

```typescript
// PreviewSections handles the swap — section components are untouched:
export function PreviewSections({ ssrSections }: Props) {
  const previewSections = usePreviewSections()   // null on public site
  const sections = previewSections ?? ssrSections
  return <>{sections.map(s => <SectionRenderer section={s} />)}</>
}
```

### Section Manifest (`src/components/sections/manifest.ts`)

Defines every available section type, its fields, and their types. The portal's SectionEditor reads this manifest to generate its editor UI — if a field is not in the manifest the portal cannot edit it.

```typescript
export const sectionManifest = {
  hero: {
    label: 'Hero',
    fields: {
      headline:    { type: 'text',  label: 'Headline',   required: true },
      subheadline: { type: 'text',  label: 'Subheadline' },
      cta_label:   { type: 'text',  label: 'Button text' },
      cta_url:     { type: 'url',   label: 'Button URL' },
      image_url:   { type: 'image', label: 'Image' },
    }
  },
  // one entry per section type
} satisfies SectionManifest
```

**Whenever you add a new section type you must update the manifest.** The portal will not show any editor fields for types missing from the manifest.

### SectionRenderer contract

`SectionRenderer` must pass `id={section.type}` to every section component, and every section component must put that `id` on its root `<section>` element. This is what PortalBridge uses for scroll targeting and click detection.

```tsx
// SectionRenderer.tsx
case 'hero':
  return <HeroSection section={section} id={section.type} />

// HeroSection.tsx
export default function HeroSection({ section, id }: Props) {
  return <section id={id} ...>
```

---

## Design System

All components use CSS custom properties. Never hardcode colors in component files.

```css
/* globals.css tokens: */
--color-bg, --color-surface, --color-border
--color-text, --color-text-muted, --color-accent
--font-sans, --font-serif, --font-mono
```

Per-client customisation happens entirely in `globals.css` — never in component files.

---

## Queries Pattern

All Supabase reads are in `src/lib/queries.ts`. Every function uses `createServerSupabase()` and is called from Server Components only. No client-side data fetching except the contact form submission.

---

## Extending

See [EXTENDING.md](EXTENDING.md) for:
- Adding a new section type (no migration — JSONB is free-form)
- Adding a new content type (migration + types + queries + route)
- Removing portfolio or blog module

---

## Environment Variables

| Variable | Source | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Agency Hub client record | Points the site to the correct Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Agency Hub client record | Read-only access (RLS enforced on all tables) |
| `REVALIDATE_SECRET` | Generate with `openssl rand -hex 32` | Authenticates ISR webhook calls from the portal |
| `NEXT_PUBLIC_SITE_URL` | Client's domain | OG tags, canonical URLs, sitemap |

---

## Do Not

- Do not fetch data client-side — use Server Components + `queries.ts` (exception: PreviewContext is client-side but only activates inside the portal iframe)
- Do not hardcode content in components — all text, images, and copy come from Supabase
- Do not seed placeholder or stub content — seed real content from the client brief
- Do not put the service role key anywhere in this repo
- Do not bypass `REVALIDATE_SECRET` validation in `/api/revalidate`
- Do not add client-specific styles in component files — use `globals.css` tokens
- Do not call client-portal or agency-hub APIs from this site
- Do not store sections as a keyed object — always use the `PageSection[]` array format
- Do not add a new section type without updating `src/components/sections/manifest.ts` — the portal cannot edit fields that are not in the manifest
- Do not remove `id={section.type}` from SectionRenderer or the `id` prop from section components — this breaks portal scroll targeting and click detection
- Do not start building any layout, page, or section without first requesting the Pencil reference design for that phase — ask the user to share it before writing any component code

---

## Follow-on Commands

These commands are available after the kickoff workflow completes. They assume a requirements file has already been provided in the current session.

### "build order"

Output a sprint-by-sprint implementation plan in this format:

```
Sprint 1 (M0 + M1 + M2): Setup, schema, types
  Day 1: [TEAM_ID]-1, -2, -3 — Fork, env, Supabase link
  Day 2: [TEAM_ID]-4..7 — Migrations + seed
  Day 3: [TEAM_ID]-8..12 — Tokens, types, queries

Sprint 2 (M3 + M4): Layout and home page
  ...
```

Estimate days per issue based on complexity. For every build phase that has a corresponding design phase (M3, M4, M5, M6, M7, M8), note that Claude must request the Pencil reference design before starting any component work in that phase.
