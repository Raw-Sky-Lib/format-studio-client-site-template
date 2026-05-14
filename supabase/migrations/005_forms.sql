-- Form submissions inbox.
-- Written by the site's /api/submit-form endpoint (anon inserts allowed via RLS).
-- Read by the client-portal Forms page.
--
-- `form_name` lets you distinguish multiple forms on one site (e.g. "contact", "quote").
-- `data` is free-form JSONB — shape determined by the form that submitted it.

CREATE TABLE IF NOT EXISTS form_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_name    TEXT NOT NULL DEFAULT 'contact',
  data         JSONB NOT NULL DEFAULT '{}',
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS form_submissions_name_idx ON form_submissions (form_name, submitted_at DESC);
CREATE INDEX IF NOT EXISTS form_submissions_read_idx ON form_submissions (is_read);
