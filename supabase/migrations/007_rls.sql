-- Row Level Security policies.
-- Anon key (used by this site): SELECT on all tables, INSERT on form_submissions only.
-- Service role key (used by client-portal backend): unrestricted.
--
-- These policies are intentionally permissive for public read — all content
-- on the site is public. Sensitive data (keys, tokens) never lives here.

ALTER TABLE site_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media            ENABLE ROW LEVEL SECURITY;

-- Anon: read-only on all content tables
CREATE POLICY "anon_read_site_settings"  ON site_settings    FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_nav_items"      ON nav_items        FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_pages"          ON pages            FOR SELECT TO anon USING (is_published = TRUE);
CREATE POLICY "anon_read_posts"          ON posts            FOR SELECT TO anon USING (is_published = TRUE);
CREATE POLICY "anon_read_projects"       ON projects         FOR SELECT TO anon USING (is_published = TRUE);
CREATE POLICY "anon_read_project_images" ON project_images   FOR SELECT TO anon USING (TRUE);
CREATE POLICY "anon_read_media"          ON media            FOR SELECT TO anon USING (TRUE);

-- Anon: insert-only on form submissions (no read — client-portal reads via service role)
CREATE POLICY "anon_insert_form_submissions" ON form_submissions FOR INSERT TO anon WITH CHECK (TRUE);

-- Authenticated (client-portal service role): full access via service_role bypass
-- No explicit policies needed — service_role bypasses RLS entirely.
