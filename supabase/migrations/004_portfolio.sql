-- Portfolio / work module. OPTIONAL.
-- Skip this migration (and delete src/app/(site)/work/) if this client site
-- does not need a portfolio section.
--
-- To add this module to an existing site that started without it:
--   1. Run this migration against the client's Supabase project.
--   2. Restore the src/app/(site)/work/ routes.
--   3. Add portfolio queries to src/lib/queries.ts (see EXTENDING.md).

CREATE TABLE IF NOT EXISTS projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  category        TEXT,
  description     TEXT,
  cover_image_url TEXT,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  year            INTEGER,
  client_name     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT NOT NULL DEFAULT '',
  "order"    INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_slug_idx        ON projects (slug);
CREATE INDEX IF NOT EXISTS projects_published_idx   ON projects (is_published, is_featured);
CREATE INDEX IF NOT EXISTS project_images_proj_idx  ON project_images (project_id, "order");
