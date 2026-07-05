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
   c. Inspect the existing database before applying anything — do NOT assume a fresh project. Agency Hub provisions the base schema when it creates the client's Supabase project, so the core tables (`site_settings`, `pages`, `posts`, `nav_items`, `form_submissions`, `media`) and a `schema_migrations` ledger usually already exist. The full migration set in `supabase/migrations/` is `001_core`, `002_pages`, `003_blog`, `004_portfolio`, `005_forms`, `006_media`, `007_rls` — treat these as the desired end state, not a script to run blindly on an empty DB.
      - Use the Supabase MCP `list_tables` and `list_migrations`, and query `public.schema_migrations`, to see what already exists before touching anything.
      - Apply only what is missing. Migrations use `CREATE TABLE IF NOT EXISTS`, so re-running is mostly a no-op on tables — but `CREATE POLICY` is NOT idempotent and will duplicate or conflict, so never re-apply RLS blindly.
        - If portfolio applies and `projects`/`project_images` are missing → apply `004_portfolio.sql`.
        - If blog applies and `posts` is missing → apply `003_blog.sql`.
        - If `media` is missing → apply `006_media.sql` (creates the `media` table and `media` storage bucket).
      - Verify RLS against the secure read-only model in `007_rls.sql` (anon: SELECT on published content, INSERT only on `form_submissions`; the portal writes via the service-role key, which bypasses RLS). Agency Hub's provisioning can leave a table in any of **three** bad states — check every table for all three:
        1. **RLS disabled** — the table is fully exposed to anon (read AND write).
        2. **RLS enabled with no policies** — a silent deny-all. The public site reads empty/blank with no error, so this looks "secure" but breaks the site. This is the easiest state to miss.
        3. **RLS enabled but over-permissive** — e.g. anon `ALL` on `site_settings`/`nav_items`, or anon `SELECT`/`UPDATE` on `form_submissions`.
      - If any are found, surface the gap to the user, then apply the corrective policies from `007_rls.sql` — using distinct policy names or dropping the permissive policies first to avoid conflicts.
   d. **Set up media storage folders** based on which sections the project uses:
      - Always create: `logo/` (every project needs a logo)
      - Create per section: hero with image → `hero/`, about → `about/`, blog → `blog/`, portfolio → `work/`, testimonials with avatars → `testimonials/`, team → `team/`
      - Use the Supabase MCP to create each folder by uploading a zero-byte placeholder:
        ```
        POST {SUPABASE_URL}/storage/v1/object/media/{folder}/.gitkeep
        Headers: Authorization: Bearer {SERVICE_ROLE_KEY}, apikey: {SERVICE_ROLE_KEY}, x-upsert: true
        Body: (empty)
        ```
      - Only create folders for sections that actually exist in this project — do not create unused folders.
   e. **Seed initial media assets** from the client brief:
      - Upload the client's logo to `logo/` and record its public URL:
        `{SUPABASE_URL}/storage/v1/object/public/media/logo/{filename}`
      - Upload any hero background image to `hero/`
      - Set `logo_url` in `site_settings` to the logo's public URL
      - Set `og_image_url` in `site_settings` to an appropriate image public URL
      - Seed `image_url` fields in section JSONB with the correct public URLs (not placeholder URLs)
   f. **Seed embed fields** from the client brief:
      - If the project has a `contact` section and the brief includes an address or location, get the Google Maps embed `<iframe>` (Google Maps → Share → Embed a map) and seed it as `map_embed` in the contact section JSONB
      - If the brief includes any other third-party widget (Calendly, booking form, newsletter widget, video), seed its embed code in an `embed` section JSONB as `embed_code`
      - If no embed code is available yet, leave the field as an empty string — the client can paste it themselves in the portal later
   g. Tell the user M0 is complete and confirm which migrations ran. Suggest `pnpm install && pnpm dev` to verify the setup.

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
pages(id, slug, title, sections JSONB,              → CMS pages
      seo_title, seo_description,                      ↳ required for portal details drawer
      is_published, updated_at)
posts(slug, title, content HTML, is_published)      → blog
projects(slug, title, is_featured, is_published)    → portfolio (optional)
project_images(project_id, url, order)              → portfolio images
form_submissions(form_name, data JSONB)             → contact form inbox
media(filename, url, mime_type)                     → media library metadata
```

**Storage bucket:** named `media`, created by the portal on tenant registration. The editor's image picker reads + writes here.

---

## Per-Client AI Editor Context — `site_settings.ai_editor_context`

> Seed this during M0 bootstrap, alongside the initial content. It is this site's
> "client CLAUDE.md" for the portal's AI content assistant.

The client-portal has an AI editor that rewrites section copy on request. To stop it
guessing, the portal's prompt builder (`api/internal/claude/prompt.go`) reads a
**`site_settings` row keyed `ai_editor_context`** and prepends its markdown value to
the Claude system prompt. One document per client, living in the client's own Supabase
— no portal or agency-hub change needed.

**You (build-Claude) author and seed it** from the requirements brief + the sections you
actually built. Write a `site_settings` row:

```
key:   ai_editor_context
value: <the markdown document below>
```

### Required structure of the document

```markdown
# AI Editor Context — <Business Name>

## Brand & voice
- One-paragraph description of the business and who it serves.
- Tone: e.g. "confident, plain-spoken, no hype". List 3–5 voice adjectives.
- Words/phrases to use; words/phrases to avoid.

## Sections on this site
For every section type present in `pages.sections`, list its editable fields and what
each one is for, so the assistant only ever proposes changes to real fields:

- **hero** — `headline` (≤8 words, benefit-led), `subheadline` (1 sentence),
  `cta_label` (≤3 words), `cta_url`.
- **features** — `title`, `items[].title`, `items[].description` (≤20 words each).
- … one bullet per section type actually used on this build.

## Rules
- Never invent fields that aren't listed above.
- Keep length within the limits noted per field.
- Preserve <any client-specific constraints: legal disclaimers, product names,
  spelling of the brand, etc.>

## Examples (optional)
- Good headline: "…"  ·  Off-brand headline: "…"
```

Keep the **Sections** list in sync with the section types you ship. The field names MUST
match the `path` grammar (the part after the section type, e.g. `headline`,
`items[].title`). The portal also has the live `manifest.editablePaths` as a second
source of truth, but this document is what gives the assistant voice + intent.

The client or agency can refine this later in the portal under **Settings → AI**.

### Definition of done — verify before handoff

Seeding this is **a required build step, not optional.** Before you consider the build
complete, run:

```sql
select value from site_settings where key = 'ai_editor_context';
```

A missing or empty row means the portal's AI editor will fall back to structural-only
guidance (it still gets the live field list from the bridge manifest, so it stays
*accurate* — but it loses this site's *voice and intent*). Treat an empty result as an
incomplete build: seed the row, then re-verify.

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
  { "type": "cta",      "headline": "...", "button_label": "...", "button_url": "..." },
  { "type": "contact",  "address": "123 Main St", "email": "hello@site.com", "phone": "+1 (555) 000-0000", "map_embed": "<iframe src=\"https://www.google.com/maps/embed?...\" ...></iframe>" },
  { "type": "embed",    "embed_code": "<iframe src=\"https://calendly.com/...\" ...></iframe>", "caption": "Book a call" }
]
```

**Never store sections as a keyed object** (`{ hero: {...}, features: {...} }`).
The portal CMS, the template renderer, and the `SectionEditor` all depend on the array format.

Adding a new section: append an object with the correct `type` to the array.
Removing a section: remove the element from the array.
Reordering: change the position in the array — array order is render order.

---

## Editing Bridge — How to Build Section Components

> Single source of truth for building or modifying any section component.
> The client-portal embeds this site in an iframe and drives inline editing via the **editing bridge** (`src/lib/editing-bridge/`).
> Protocol spec lives in the portal repo at `Client-Management/.claude/EDITING-BRIDGE.md`.

### TL;DR — rules every section component MUST follow

1. **`'use client'` at the top of the file.** Section components use the `useEditMode()` hook to branch render logic, so they have to be client components.
2. **Import bridge primitives from `@/lib/editing-bridge`** — `Editable`, `EditableImage`, `EditableList`, `useEditMode`.
3. **Wrap every editable text field with `<Editable path="…" placeholder="…">`.** Always pass a placeholder so empty fields are visible and clickable in edit mode.
4. **Wrap every image with `<EditableImage path="…" src={…} render={…} wrapClassName="…">`.** Use `wrapClassName="absolute inset-0"` whenever the image lives inside an aspect-ratio / `next/image fill` container.
5. **Wrap every list with `<EditableList path="…" className="…">`.** Put grid/flex classes on `EditableList`, not on an inner wrapping div — the list's direct children become the grid items.
6. **Always render a shell when `useEditMode().active` is true**, even if the field is empty in the saved data. Otherwise users can't see where to click to fill an empty field on a new section / new list item.
7. **Wrap every `id` prop into `<section id={id}>`** — required for `PORTAL_SCROLL_TO`.
8. **Add the section type to `manifest.ts`** and to the `LIST_DEFAULTS` map in the portal (`web/src/features/pages/lib/defaults.ts`) if it has any list fields.

> **Automatic — no author action needed.** The bridge emits `FIELD_FOCUS`/`FIELD_BLUR`
> (from `<Editable>`) and `SECTION_FOCUS` with the section's bounding rect (from the
> provider's click listener) on its own. These drive the portal's **select mode** popups
> and the planned dashed selection outline. Your only obligation is the existing rule 7:
> each section root is `<section id={type}>`. Full protocol in `EDITING-BRIDGE.md`.

### Bridge primitives — when to use which

| Primitive | Use for | DOM in production | DOM in edit mode |
|---|---|---|---|
| `<Editable path="…" placeholder="…">{text}</Editable>` | Plain-text fields (headlines, paragraphs, button labels, address, email, phone) | `{text}` directly — zero overhead | `<span contentEditable>` with dashed outline; ghost placeholder when empty |
| `<EditableImage path="…" src={…} render={…} wrapClassName="…">` | Any image. Pass `render` for `next/image`. | The image alone, no wrapper | Wrap div with hover Change button → opens MediaPicker |
| `<EditableList path="…" className="…">{items}</EditableList>` | Any array (testimonials, features, steps, why-us reasons). Children must be direct list items, not a wrapping `<div>`. | `<div className={className}>{children}</div>` — minimal | Same outer + per-item toolbar (⊕ add / ✕ remove) + bottom "Add item" button |
| `<EditableLink path="…" href={…} className="…">{children}</EditableLink>` | Any clickable navigation — button, card, image-as-link. Pick `<Link>` (internal) or `<a target="_blank">` (external) automatically. | `<Link href={url}>` or `<a href={url}>` | `<span>` (no navigation while editing) with floating URL badge in the corner |
| `<EditableIcon path="…" value={…} size={…} className="…">` | Icon fields — feature icons, why-us icons, anywhere a small symbol sits next to text. | `<SectionIcon>` rendering the lucide-react icon for the stored name | `<SectionIcon>` + Pencil affordance + a searchable picker panel of all curated icons |
| `useEditMode()` | Branch JSX between active vs production when the five primitives above aren't enough | returns `{ active: false }` | returns `{ active: true }` |

### Path grammar (must match portal's `setByPath`)

```
hero.headline                       → section type hero, field headline
testimonials.items                  → the whole items array
testimonials.items[2].quote         → item at index 2, field quote
process.steps[0].number             → numbered step field
contact.email                       → flat field
```

The first segment is the section's `type` discriminator. Each section type appears at most once per page so this is unambiguous. Use indexed brackets for arrays. Stay consistent — the portal's path resolver (`web/src/features/pages/lib/path.ts`) gets/sets values via this exact grammar.

### The "edit-mode shell" pattern (critical for empty fields)

```tsx
// Show the field shell whenever a value exists OR the bridge is active.
// Without `|| active`, a new section with empty fields renders nothing in
// edit mode → user can't see where to type.
{(section.subheadline || active) && (
  <p className="…">
    <Editable path="hero.subheadline" placeholder="Supporting text">
      {section.subheadline ?? ''}
    </Editable>
  </p>
)}
```

### Links — use `<EditableLink>`, never raw `<Link>` or `<a>` in section components

`<EditableLink>` wraps any clickable thing — button, card, image — and makes BOTH its URL and its inner content editable from the bridge. Don't hand-roll the `<Link>` vs `<span>` switch any more; the primitive handles it.

```tsx
import { EditableLink, Editable, EditableImage, useEditMode } from '@/lib/editing-bridge'
```

**In production** it renders either `<Link href={url}>` (Next.js client routing for internal URLs) or `<a href={url} target="_blank" rel="noopener">` for URLs that look external (`http://…`, `mailto:`, `tel:`). When `href` is empty the children render unwrapped — site keeps flowing, user adds the URL later.

**In edit mode** it renders a `<span>` (so clicks reach the editable spans inside instead of navigating) and floats a small URL badge in the top-right corner — click it to type a new URL with Enter to save or Esc to cancel.

#### Three link shapes you'll meet

##### 1. Button link (CTA, "Learn more", etc.)

```tsx
{(section.cta_label || active) && (
  <EditableLink
    path="hero.cta_url"
    href={section.cta_url}
    className="inline-flex items-center rounded-md bg-[var(--color-text)] px-5 py-2.5 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-80"
  >
    <Editable path="hero.cta_label" placeholder="Button label">
      {section.cta_label ?? ''}
    </Editable>
  </EditableLink>
)}
```

##### 2. Card link (whole card is clickable — project tile, blog teaser, team-member card)

```tsx
<EditableList path="featured_grid.items" className="grid gap-6 sm:grid-cols-3">
  {section.items.map((item, i) => (
    <EditableLink
      key={i}
      path={`featured_grid.items[${i}].url`}
      href={item.url}
      className="block rounded-lg border border-[var(--color-border)] overflow-hidden group hover:shadow-md transition"
    >
      <div className="relative aspect-[4/3] w-full">
        <EditableImage
          path={`featured_grid.items[${i}].image_url`}
          src={item.image_url}
          alt={item.title}
          wrapClassName="absolute inset-0"
          render={({ src, alt }) => <Image src={src} alt={alt} fill className="object-cover" />}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">
          <Editable path={`featured_grid.items[${i}].title`} placeholder="Card title">
            {item.title}
          </Editable>
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          <Editable path={`featured_grid.items[${i}].description`} placeholder="Short description">
            {item.description}
          </Editable>
        </p>
      </div>
    </EditableLink>
  ))}
</EditableList>
```

Each card's URL is editable via the badge at the top-right of the card. The image, title, and description inside remain individually editable.

##### 3. Image link (logo → homepage, illustration → case study)

```tsx
<EditableLink
  path="hero.image_link_url"
  href={section.image_link_url}
  className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg lg:flex-1"
>
  <EditableImage
    path="hero.image_url"
    src={section.image_url}
    alt={section.headline}
    wrapClassName="absolute inset-0"
    render={({ src, alt }) => <Image src={src} alt={alt} fill className="object-cover" priority />}
  />
</EditableLink>
```

The aspect-ratio container moved onto `<EditableLink>` itself (it accepts any className). The image inside still uses `wrapClassName="absolute inset-0"` to play nicely with `next/image fill`.

#### Rules of thumb

- `<EditableLink>` is REQUIRED for any clickable navigation in a section. Don't import `next/link` in a section file any more — `<EditableLink>` will pick `<Link>` or `<a>` for you based on the URL.
- The `className` you pass controls the visual treatment (button styling, card styling, full-bleed image, whatever). Same className applies in both modes.
- When the URL is empty AND you're in edit mode, the children still render with the URL badge — user can fill in the URL after writing the label.
- For internal anchor links / hash links (`#contact`), pass them as `href="#contact"` — `<EditableLink>` treats them as internal (uses Next.js `<Link>`).
- For email / phone fields you want clickable, store them as plain text and wrap with `<EditableLink href={`mailto:${section.email}`}>` if you need them clickable. (Auto-prefixing email/phone isn't done yet — a future primitive could handle it.)

### Images with `next/image fill`

```tsx
{(section.image_url || active) && (
  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
    <EditableImage
      path="hero.image_url"
      src={section.image_url}
      alt={section.headline}
      wrapClassName="absolute inset-0"   // ← REQUIRED for fill to anchor correctly
      render={({ src, alt }) => (
        <Image src={src} alt={alt} fill className="object-cover" priority />
      )}
    />
  </div>
)}
```

- The outer aspect-ratio div stays — it sizes the area.
- `wrapClassName="absolute inset-0"` fills the aspect div, giving `<Image fill>` a positioned ancestor of the right size.
- For fixed-size `<Image width={x} height={y}>` (e.g. avatars) the same pattern works: wrap with the size container, pass `wrapClassName="absolute inset-0"`.

### Lists — grid stays on `EditableList`, not on an inner div

```tsx
// ✅ Correct — grid classes on EditableList, items are direct children
<EditableList
  path="features.items"
  className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
>
  {section.items.map((item, i) => (
    <div key={i} className="flex flex-col gap-3">
      <Editable path={`features.items[${i}].title`} placeholder="Feature title">
        {item.title}
      </Editable>
      ...
    </div>
  ))}
</EditableList>

// ❌ Wrong — extra <div> swallows all the items as a single list entry
<EditableList path="features.items">
  <div className="grid grid-cols-3">
    {section.items.map(item => …)}
  </div>
</EditableList>
```

When you add a new list, **also add a `LIST_DEFAULTS[path]` entry** in the portal at `Client-Management/web/src/features/pages/lib/defaults.ts` — that's the blank-item shape the portal inserts when the user clicks Add.

### Icons — `<EditableIcon>` + `<SectionIcon>`, four sources

Icons follow the same pattern as text / images / links: one rendering primitive, one bridge primitive that adds the editor UI on top of it. The picker supports **four sources** so clients can mix and match:

| Source | Stored value example | Use when |
|---|---|---|
| **Library** | `lucide:rocket` | The default. Curated lucide-react set (~70 icons). Consistent across the whole site. |
| **Emoji** | `emoji:✨` | Quick + recognizable for casual brands. Picker shows a curated palette + a "type any emoji" field. |
| **SVG** | `svg:<svg viewBox="0 0 24 24">…</svg>` | Custom client artwork. Paste raw SVG markup directly — strip `width`/`height` so it scales. |
| **URL** | `url:https://example.com/icon.png` | Hosted icon (logo, partner mark, PNG/SVG/JPG). Use this when SVG paste isn't practical. |

#### File map

| File | Role |
|---|---|
| `src/lib/icons/library.ts` | Curated lucide-react set. Maps kebab-case names → lucide components. |
| `src/lib/icons/emoji.ts` | Curated emoji palette shown in the picker (users can also type any emoji). |
| `src/lib/icons/parse.ts` | `parseIconValue(input)` / `serializeIconValue(parsed)` — the prefix-format contract. |
| `src/lib/icons/SectionIcon.tsx` | Single render path. Dispatches on `kind`: lucide → component, emoji → text, svg → `dangerouslySetInnerHTML`, url → `<img>`. |
| `src/lib/editing-bridge/EditableIcon.tsx` | Bridge primitive. Production = `<SectionIcon>`; edit mode = whole-icon click target + tabbed picker (Library / Emoji / SVG / URL). |

#### Use in a section

```tsx
import { EditableIcon } from '@/lib/editing-bridge'

{(item.icon || active) && (
  <EditableIcon
    path={`features.items[${i}].icon`}
    value={item.icon}
    size={28}
    className="text-[var(--color-text)]"
  />
)}
```

Unchanged from the previous API. The picker's tab selection writes the prefixed string; `SectionIcon` handles all four kinds + legacy bare values for backward compatibility.

#### Stored value rules

- The picker always writes with an explicit prefix going forward (`lucide:`, `emoji:`, `svg:`, `url:`).
- **Legacy bare values still work** — `"rocket"` parses as lucide, `"⚡"` as emoji, `"<svg…>"` as svg, `"https://…"` as url. So old tenant data renders fine; the next edit migrates it to the prefixed form.
- **`SectionIcon` is the only place that should call `parseIconValue`.** Sections always render through it — don't open-code the parsing.

#### Installed icon sets (already built in)

Three additional sets are shipped alongside Lucide and are selectable via the set-selector row at the top of the Library tab in `EditableIcon`:

| Set | Package | Stored prefix | Curated count | Notes |
|---|---|---|---|---|
| **Phosphor** | `@phosphor-icons/react` | `phosphor:` | ~90 | Regular weight; 6 weights available but only Regular stored |
| **Tabler** | `@tabler/icons-react` | `tabler:` | ~90 | Stroke 1.5 at render time |
| **Heroicons** | `@heroicons/react/24/outline` | `heroicons:` | ~85 | Sized via inline style, no `size` prop |

Curated library files live in `src/lib/icons/phosphor.ts`, `tabler.ts`, `heroicons.ts`. Each maps kebab-case storage keys to React components.

#### Adding more icon sources later

The architecture is set up for it. Three steps:
1. Install the package.
2. Add a new `IconKind` value in `parse.ts` and a `case` branch in `SectionIcon.tsx`.
3. Create a curated library file (`src/lib/icons/yourset.ts`) and add a set entry to `ICON_SETS` in `EditableIcon.tsx`.

No portal change needed — the portal just round-trips the string.

#### Per-client custom icons

Three escalating options, in order of preference:
1. **Picker → SVG tab** — the client pastes their custom SVG; lives entirely in the page's JSONB.
2. **Picker → URL tab** — host the icon (their own CDN, Supabase Storage public bucket) and link to it.
3. **Fork the template's `library.ts`** — add the icon there if it's a brand staple they'll reuse across pages. Lucide names take precedence on lookups.

Don't store SVG strings or URLs in the `icon` field WITHOUT a prefix — `parseIconValue`'s heuristics will usually catch them, but explicit prefixes are the contract.

### Rich content / raw HTML — NOT inline editable

Three fields cross this line:
- `about.body` — Tiptap HTML
- `embed.embed_code` — arbitrary `<iframe>` markup
- `contact.map_embed` — Google Maps embed markup

Render them with `dangerouslySetInnerHTML` in both modes and **do not wrap with `<Editable>`**. They get edited via the portal's textarea / details drawer, never inline. ContentEditable on raw HTML loses tag structure.

### Section file checklist (use before committing a new section)

- [ ] File starts with `'use client'`.
- [ ] Imports from `@/lib/editing-bridge`: at least one of `Editable`, `EditableImage`, `EditableList`, `EditableLink`, `EditableIcon`, `useEditMode`.
- [ ] No raw `import Link from 'next/link'` or `<a href>` inside section components — use `<EditableLink>`.
- [ ] No raw `<span>{icon}</span>` inside section components — use `<EditableIcon>` so the picker is wired up.
- [ ] Root element is `<section id={id}>`.
- [ ] Every text field uses `<Editable path="…" placeholder="…">` — including a `placeholder` prop.
- [ ] Every image uses `<EditableImage>` with `wrapClassName="absolute inset-0"` when inside an aspect-ratio container.
- [ ] Every list uses `<EditableList path="…" className="…">` with the grid/flex classes on the list itself.
- [ ] Every navigable thing (button, card, image-link) uses `<EditableLink>` so both URL and content are editable.
- [ ] Empty fields render an edit-mode shell via `(field || active) && …`.
- [ ] URL fields are NOT wrapped — they live in the details drawer.
- [ ] Rich-text / HTML embed fields use `dangerouslySetInnerHTML` and are NOT wrapped.
- [ ] Added to `manifest.ts` with field types.
- [ ] Added to `SectionRenderer.tsx` switch with `id={section.type}`.
- [ ] If the section has lists, added entries to `LIST_DEFAULTS` in the portal.
- [ ] Production page renders unchanged from before the bridge (no extra outlines, no buttons, no console errors).

### Activation handshake (reference)

The bridge mounts inert. It activates only when:
1. URL has `?portal=edit`
2. Window is embedded (`window.self !== window.top`)
3. Parent origin sends a valid `PORTAL_ACTIVATE` message after `BRIDGE_READY`

In all other cases the bridge components render as pass-throughs — no DOM cost, no event listeners. So importing the bridge from a section component has zero production overhead.

---

## Editor Readiness Checklist — every new client site MUST satisfy this

> If the portal editor breaks for a new client, the cause is almost always one of these items being skipped or modified after the template was forked. Run this checklist before handing a site to a client.

### 1. Supabase schema — `pages` table must have these columns

```sql
pages (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  sections        jsonb not null default '[]'::jsonb,
  seo_title       text,                          -- required: portal details drawer
  seo_description text,                          -- required: portal details drawer
  is_published    boolean not null default false,
  updated_at      timestamptz not null default now(),
  created_at      timestamptz not null default now()
)
```

**RLS policy:** anon role gets `SELECT` only. Writes are denied — the portal backend uses the service role key to update. **Do not grant anon UPDATE on `pages`** or you've created an arbitrary content-overwrite vector.

The standard CMS migration in `supabase/migrations/` handles this. If you removed the migration or hand-rolled a schema, re-check these columns + the RLS.

### 2. Storage — `media` bucket

```sql
-- Bucket named exactly `media`. Public read; service role write.
-- The portal creates this on tenant registration; nothing to do here unless
-- the bucket was renamed.
```

The picker calls `init-bucket` and walks the bucket recursively. A missing or differently-named bucket breaks every image swap.

### 3. ISR revalidation route — `/api/revalidate`

`src/app/api/revalidate/route.ts` must exist, verify `X-Revalidate-Secret`, and call `revalidatePath()` for the paths the portal sends.

The portal pings this after every Publish + every metadata save. Without it, content writes succeed in Supabase but the live site keeps serving the cached old version until the next time-based revalidate (1 hour by default).

Required env vars:
- `REVALIDATE_SECRET` — shared between this site and the portal's record for the project (`tenant_projects.supabase_revalidate_secret_encrypted`).

### 4. Root layout (`src/app/layout.tsx`) — three things in the right order

```tsx
import { EditingBridgeProvider } from '@/lib/editing-bridge'
import { PreviewProvider } from '@/contexts/preview-context'   // legacy — kept until CP-11
import PortalBridge from '@/components/layout/PortalBridge'    // legacy — kept until CP-11

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <EditingBridgeProvider>
          <PreviewProvider>
            <PortalBridge />
            {children}
          </PreviewProvider>
        </EditingBridgeProvider>
      </body>
    </html>
  )
}
```

`EditingBridgeProvider` is the outermost wrapper. Don't move it inside another client component — it has to see the whole render tree.

### 5. Editing bridge module — `src/lib/editing-bridge/`

All seven files must be present:
- `provider.tsx` — `EditingBridgeProvider`, `useEditMode`, `useBridgeSections`, `useBridgeSend`, `useBridgeRegisterPath`
- `Editable.tsx`
- `EditableImage.tsx`
- `EditableLink.tsx`
- `EditableList.tsx`
- `styles.ts`
- `types.ts`
- `index.ts` (barrel exports)

If you deleted or renamed any of them, the section components imported them and the editor breaks.

### 6. Legacy bridge guard — `src/components/layout/PortalBridge.tsx`

The legacy file is still mounted (CP-11 retires it). It MUST contain the early-return guard:

```tsx
const params = new URLSearchParams(window.location.search)
if (params.get('portal') === 'edit') return
```

Without this guard, the legacy bridge's capture-phase click handler eats every click in the iframe — Add buttons, Change buttons, contentEditable, all dead. If editing buttons stop responding, this guard is the first thing to check.

### 7. `PreviewSections` source-of-truth chain — `src/components/sections/PreviewSections.tsx`

Must read sections in this order:

```tsx
const bridgeSections = useBridgeSections()    // new editor
const legacySections = usePreviewSections()   // old editor
const sections = bridgeSections ?? legacySections ?? ssrSections
```

If you only read from one source, edits in the other editor visibly revert ("type, click out, value snaps back").

### 8. `SectionRenderer` — all 10 section types dispatched

`src/components/sections/SectionRenderer.tsx` must have a `case` for every section type in `SectionType` union. Missing a case means the portal saves the section but the iframe renders nothing for it — looks broken to the client.

Current full list: `hero`, `features`, `about`, `testimonials`, `cta`, `why_us`, `process`, `featured_projects`, `contact`, `embed`.

### 9. `manifest.ts` — every section type with all editable fields

`src/components/sections/manifest.ts` is the contract the portal reads to know what fields exist. Adding a section component without updating the manifest = the portal's content suggestions / Claude assistant can't see those fields. Adding a manifest entry without a renderer = portal saves the field but it never appears on the site.

### 10. Section components — strictly follow the bridge pattern

Every file in `src/components/sections/*.tsx` must satisfy the **Section file checklist** above (`'use client'`, bridge imports, `<section id={id}>`, placeholders on every `<Editable>`, `<EditableLink>` instead of raw `next/link`, etc.). A single non-conforming section is the #1 cause of "this one section is broken in the editor."

### 11. Environment variables

In the client site's `.env` / Vercel project:

```env
NEXT_PUBLIC_SUPABASE_URL=<the client's tenant Supabase URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<the client's tenant anon key — read-only by RLS>
SUPABASE_SERVICE_ROLE_KEY=<service role — for server-side reads + writes>
REVALIDATE_SECRET=<must match the value the portal stored for this project>
```

The portal proxies all CMS writes through its own backend — the client site doesn't need the portal's URL or any cross-origin config beyond the iframe activation handshake.

### 12. `next.config.ts` — Supabase Storage allowed for `<Image>`

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
  ],
}
```

If the client's images are hosted on a different CDN, add the matching pattern. Without this, `<Image fill>` errors silently and images render 0×0.

---

## Things that break the editor (and the fix)

| Symptom | Likely cause | Fix |
|---|---|---|
| Add / Change / contentEditable buttons all unresponsive | Legacy `PortalBridge` early-return guard removed | Re-add `if (params.get('portal') === 'edit') return` at the top of the useEffect (item 6) |
| Editing a field shows the value but it reverts on blur | `PreviewSections` only reads from one source | Re-add the bridge → legacy → SSR fallback chain (item 7) |
| Image visible in production but 0×0 in edit mode | `EditableImage` wrap class conflict, or Supabase hostname not allowlisted | Pass `wrapClassName="absolute inset-0"` (image section docs); confirm `next.config.ts` allowlist (item 12) |
| Page metadata Save / SEO title doesn't stick | Drawer writing direct to Supabase against RLS (anon read-only) | Route through `PUT /api/cms/pages/:slug/metadata` (portal-side fix, already shipped) |
| Section appears in the portal editor but not on the site | Missing `case` in `SectionRenderer` for that type | Add the dispatch case (item 8) |
| Section renders on the site but the portal editor has no UI for it | Section type missing from `manifest.ts` | Add the manifest entry (item 9) |
| Add Item adds a malformed item | Missing `LIST_DEFAULTS[path]` in the portal | Add the entry in `Client-Management/web/src/features/pages/lib/defaults.ts` |
| Published content doesn't appear on the live site | `/api/revalidate` route missing or `REVALIDATE_SECRET` mismatched | Add the route (item 3); confirm secret matches the portal's record |
| Click on hero CTA in edit mode navigates instead of editing | Section uses raw `<Link>` instead of `<EditableLink>` | Replace with `<EditableLink>` per the link patterns above |

---

## Portal CMS Integration (legacy)

> **The bridge above is the primary integration.** The PortalBridge below predates it and is being retired in CP-11. It's still mounted today for one reason: there's a transitional period where the old portal editor still talks to it. The new portal editor uses `?portal=edit` to activate the new bridge; PortalBridge's `useEffect` early-returns when it sees that URL param so the two never fight.

### PortalBridge (`src/components/layout/PortalBridge.tsx`) — being retired

Mounted once in the root layout. Has no effect when the site is viewed in a normal browser tab (`window.self === window.top` guard). Inside the portal iframe — and only when `?portal=edit` is NOT in the URL — it:

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

CP-11 deletes this file entirely. Don't add new behavior here.

### PreviewContext (`src/contexts/preview-context.tsx`) — being retired

Client-side context holding portal-injected section overrides. Only activates inside an iframe.

`PreviewSections` reads section data with this fallback chain:
1. `useBridgeSections()` (new editing bridge) — primary source when the new editor is active
2. `usePreviewSections()` (this legacy context) — used by the old portal editor
3. `ssrSections` — Supabase SSR data (production)

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
  contact: {
    label: 'Contact',
    fields: {
      title:     { type: 'text',  label: 'Heading' },
      image_url: { type: 'image', label: 'Photo' },
      address:   { type: 'text',  label: 'Address' },
      email:     { type: 'text',  label: 'Email' },
      phone:     { type: 'text',  label: 'Phone' },
      map_embed: { type: 'embed', label: 'Map embed' },
    }
  },
  embed: {
    label: 'Embed',
    fields: {
      embed_code: { type: 'embed', label: 'Embed code' },
      caption:    { type: 'text',  label: 'Caption' },
    }
  },
  // one entry per section type
} satisfies SectionManifest
```

**Field types:**
- `text` / `url` — plain text input
- `image` — portal renders as `ImagePickerField` (media library picker, not a text box)
- `embed` — portal renders as `EmbedCodeField` (HTML textarea + sandboxed iframe preview, not a text box). The stored value is a raw HTML string — typically an `<iframe>` tag. Use for Google Maps, Calendly, Typeform, YouTube, or any third-party widget embed.

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

## Media & Storage

**Bucket:** always named `media` — created automatically by the portal on client registration. Never create it manually.

**Public URL format:**
```
{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/{folder}/{filename}
```

**Folder structure is project-dependent** — derived from which sections use images:

| Section type | Create folder |
|---|---|
| Any project | `logo/` |
| Hero with image | `hero/` |
| About section | `about/` |
| Blog module | `blog/` |
| Portfolio module | `work/` |
| Testimonials with avatars | `testimonials/` |
| Team section | `team/` |

Create only the folders the project needs. Folders are created during M0 (Step 5d above) by uploading a `.gitkeep` placeholder via Supabase MCP. The portal's media page hides `.gitkeep` automatically.

**Image fields in sections** store full public URLs as plain strings in the JSONB:
```json
{ "type": "hero", "headline": "...", "image_url": "https://xyz.supabase.co/storage/v1/object/public/media/hero/bg.jpg" }
```

In the **portal editor**, fields with `type: 'image'` in the manifest render as a media picker — the client clicks "Choose from media library" and selects a file; no URL typing required. After publishing, ISR fires immediately.

**During the build phase**, seed real image URLs from the client's actual assets — never use placeholder or stock photo URLs.

---

## Embeds

Any section can have an `embed` field — a raw HTML string (usually a single `<iframe>` tag) stored in the section JSONB.

**Portal editor:** `embed`-typed manifest fields render as `EmbedCodeField` — a code textarea the client pastes into, with a toggleable sandboxed iframe preview. No URL typing, no wrapping needed — paste the embed code exactly as the provider supplies it.

**Rendering in the site component:**

```tsx
// ContactSection.tsx
export default function ContactSection({ section, id }: Props) {
  return (
    <section id={id}>
      {section.map_embed && (
        <div dangerouslySetInnerHTML={{ __html: section.map_embed }} />
      )}
    </section>
  )
}
```

Using `dangerouslySetInnerHTML` is correct here — the value is client-provided HTML from a trusted source (the client manages it in their own portal). Do not sanitise or re-parse it; render it as-is.

**Seeding during M0:** if the client's brief includes a Google Maps link or embed code for their contact page, seed `map_embed` in the contact section JSONB during Step 5e. Get the embed `<iframe>` from Google Maps → Share → Embed a map. If no embed code is provided, leave `map_embed` as an empty string — the portal field stays editable.

**Built-in section types that use embed fields:**

| Section type | Embed field | Typical use |
|---|---|---|
| `contact` | `map_embed` | Google Maps iframe |
| `embed` | `embed_code` | Any third-party widget (Calendly, Typeform, YouTube, etc.) |

For any other section that needs an embed, add `{ type: 'embed' }` to its manifest entry and render with `dangerouslySetInnerHTML` in the component.

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
- Do not hardcode image URLs or paths in component files — all media references come from Supabase Storage via section JSONB props or `site_settings`
- Do not use external image hosts (Unsplash, CDNs, etc.) for content — upload real client assets to the `media` bucket
- Do not skip media setup for a section that has an image field — seed real images from the brief, never leave `image_url` empty or as a placeholder URL
- Do not start building any layout, page, or section without first obtaining the Claude design reference for that phase — either a design-reference link the user shares or a design folder dropped into the repo (e.g. `design/`, holding screenshots/specs). Ask the user for it before writing any component code
- Do not sanitise or re-parse embed field values — render them with `dangerouslySetInnerHTML` directly; the client is the trusted source
- Do not add a new section with an embed field without declaring it `type: 'embed'` in the manifest — the portal will render a plain text box instead of the code editor
- Do not leave `map_embed` or `embed_code` as a placeholder string — seed it from the brief or leave it as an empty string `""`

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

Estimate days per issue based on complexity. For every build phase that has a corresponding design phase (M3, M4, M5, M6, M7, M8), note that Claude must obtain the Claude design reference — a link the user shares or a design folder dropped into the repo (e.g. `design/`) — before starting any component work in that phase.
