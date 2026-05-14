-- Blog posts.
-- Read and written by the client-portal Blog Editor.
-- `content` is stored as HTML (output of Tiptap rich text editor).
-- `published_at` is set on first publish and never cleared on unpublish.

CREATE TABLE IF NOT EXISTS posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL DEFAULT '',
  excerpt         TEXT,
  cover_image_url TEXT,
  author_name     TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posts_slug_idx      ON posts (slug);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts (is_published, published_at DESC);
