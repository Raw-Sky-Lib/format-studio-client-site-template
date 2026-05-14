-- Core tables: site settings + navigation
-- Required by all client sites.

CREATE TABLE IF NOT EXISTS site_settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT NOT NULL UNIQUE,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nav_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label       TEXT NOT NULL,
  url         TEXT NOT NULL,
  "order"     INTEGER NOT NULL DEFAULT 0,
  is_external BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS nav_items_order_idx ON nav_items ("order");

-- Seed: default site settings keys
-- Edit values via the client-portal Settings page.
INSERT INTO site_settings (key, value) VALUES
  ('site_name',        'My Site'),
  ('site_description', ''),
  ('seo_title',        'My Site'),
  ('seo_description',  ''),
  ('og_image_url',     ''),
  ('contact_email',    ''),
  ('contact_phone',    ''),
  ('address',          ''),
  ('social_instagram', ''),
  ('social_twitter',   ''),
  ('social_linkedin',  ''),
  ('social_facebook',  ''),
  ('logo_url',         ''),
  ('footer_text',      '')
ON CONFLICT (key) DO NOTHING;

-- Seed: default nav items
INSERT INTO nav_items (label, url, "order") VALUES
  ('Home',    '/',        0),
  ('Work',    '/work',    1),
  ('Blog',    '/blog',    2),
  ('Contact', '/contact', 3)
ON CONFLICT DO NOTHING;
