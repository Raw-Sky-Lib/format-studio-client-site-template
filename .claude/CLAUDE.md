# CLAUDE.md — format-studio-client-site-template

> GitHub Template Repository — bootstraps Format Studio client websites.
> Stack: Next.js 16 · React 19 · TypeScript (strict) · Tailwind v4 · Supabase

---

## Project Kickoff Command

When the user types **"start"**, **"initiate project"**, or **"new client"**, run this workflow — do not start writing code.

### Step 1 — Ask for the requirements file

Reply with exactly this:

> Drop the client requirements file (markdown, text, or PDF) or paste the brief here. Include anything you have: project name, site URL, brand notes, pages needed, features (blog, portfolio, booking, etc.), Supabase ref, GitHub repo name.

Wait for the user to provide it. Do not proceed until you have received it.

### Step 2 — Extract project variables

Read the requirements and extract the following. Ask only for anything that is genuinely missing and cannot be inferred:

| Variable | How to derive |
|----------|--------------|
| `PROJECT_NAME` | Full client/project display name |
| `CLIENT_SLUG` | Lowercase, hyphenated (e.g. `acme-studio`) |
| `TEAM_ID` | 2–3 uppercase initials from project name (e.g. `AS`) — ask to confirm |
| `SUPABASE_REF` | From requirements, or leave `[SUPABASE_REF]` if not yet known |
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

Tell the user: "Save this as `.claude/LINEAR-SETUP.md` in the cloned project repo."

**B) CSV import block**

Output only the CSV rows (no markdown fences, no headers other than the column row) so the user can paste directly into a `.csv` file.

Tell the user: "Save this as `{CLIENT_SLUG}-linear-import.csv` and import via Linear → Settings → Import → CSV Import."

### Step 5 — Offer next actions

After outputting both files, offer:

> What next?
> - **"build order"** — I'll lay out the sprint-by-sprint implementation plan
> - **"start M0"** — I'll walk through the bootstrap steps now
> - **"env"** — I'll generate the `.env.local` template pre-filled for this client

---

## What This Repo Is

A template that Format Studio clones for each new client website. It only works in conjunction with:

- **Client's Supabase project** — content database, anon key + RLS
- **Client Portal** — the CMS that reads/writes all content and triggers ISR
- **Agency Hub** — registers the client, manages connection tokens

When working on a cloned client site, changes stay in that client's repo. Changes here only affect future clients.

---

## Architecture

```
Agency Hub
  ↓ registers client + provides connection token
Client Portal (CMS)
  ↓ reads/writes content to client's Supabase
  ↓ calls POST /api/revalidate after every save
Client Site (this repo)
  ↑ reads content from Supabase at build/request time
  ↑ serves public site via Next.js ISR
```

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
| `NEXT_PUBLIC_SUPABASE_URL` | Client's Supabase project | Points client to correct project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client's Supabase project | Read-only access (RLS enforced) |
| `REVALIDATE_SECRET` | Generated by Format Studio | Authenticates ISR webhook |
| `SITE_URL` | Client's domain | OG tags, canonical URLs |

---

## Do Not

- Do not fetch data client-side — use Server Components + `queries.ts`
- Do not hardcode content — everything comes from Supabase
- Do not put the service role key anywhere in this repo
- Do not bypass `REVALIDATE_SECRET` validation in `/api/revalidate`
- Do not add client-specific styles in component files — use `globals.css` tokens
- Do not call client-portal or agency-hub APIs from this site

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

Estimate days per issue based on complexity. Flag any issue that depends on a Pencil design being done first.

### "start M0"

Walk through M0 bootstrap step by step interactively:

1. Confirm the GitHub repo has been created from the template
2. Output the exact `git clone` command using `GITHUB_REPO`
3. Output the exact `supabase link` command using `SUPABASE_REF`
4. Output a ready-to-paste `.env.local` with all keys pre-filled where known, placeholders where not
5. Tell the user which migrations to run first and in what order

### "env"

Output a `.env.local` file pre-filled for this client:

```env
# [PROJECT_NAME] — local development

NEXT_PUBLIC_SUPABASE_URL=https://[SUPABASE_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[paste from Supabase dashboard]

REVALIDATE_SECRET=[run: openssl rand -hex 32]

NEXT_PUBLIC_SITE_URL=[SITE_URL]

# Agency Hub (set in Vercel — use placeholders locally)
AGENCY_API_URL=https://agency-hub.yourdomain.com
AGENCY_CLIENT_ID=[from Agency Hub client record]
AGENCY_MANAGEMENT_TOKEN=[from Agency Hub client record]
```

Fill in any values known from the requirements. Leave explicit `[placeholder]` instructions for the rest.
