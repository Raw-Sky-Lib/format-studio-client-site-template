-- Pages with JSONB sections.
-- Each page has a slug and a `sections` array edited via the client-portal Page Editor.
--
-- Section shape per type (matches client-portal section editors):
--   hero:         { headline, subheadline, cta_label, cta_url, image_url }
--   features:     { title, items: [{ icon, title, description }] }
--   about:        { title, body, image_url }
--   testimonials: { title, items: [{ quote, author, role, avatar_url }] }
--   cta:          { headline, subheadline, button_label, button_url }
--
-- Add new section types by:
--   1. Adding a renderer to src/components/sections/
--   2. Adding a case to SectionRenderer.tsx
--   3. No migration required — sections are free-form JSONB.

CREATE TABLE IF NOT EXISTS pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  sections        JSONB NOT NULL DEFAULT '[]',
  seo_title       TEXT,
  seo_description TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages (slug);
CREATE INDEX IF NOT EXISTS pages_published_idx ON pages (is_published);

-- Seed: home page with empty sections array.
-- Fill content via client-portal.
INSERT INTO pages (slug, title, sections, is_published) VALUES
  ('home', 'Home', '[]', TRUE)
ON CONFLICT (slug) DO NOTHING;
