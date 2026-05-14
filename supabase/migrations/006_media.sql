-- Media library metadata.
-- Files live in Supabase Storage (`media` bucket).
-- This table is a metadata index — URL is the canonical reference.
-- Written by the client-portal Media page; read here for any display needs.

CREATE TABLE IF NOT EXISTS media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename    TEXT NOT NULL,
  url         TEXT NOT NULL,
  mime_type   TEXT,
  size_bytes  BIGINT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS media_uploaded_idx ON media (uploaded_at DESC);

-- Storage bucket must be created separately in the Supabase dashboard:
--   Name: media
--   Public: true (files served at public URL)
--   File size limit: 5242880 (5MB)
--   Allowed MIME types: image/jpeg, image/png, image/webp, image/gif, image/svg+xml
