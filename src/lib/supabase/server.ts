import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Normalize the project URL. NEXT_PUBLIC_SUPABASE_URL must be the base project
// URL (https://<ref>.supabase.co). Tolerate a pasted `/rest/v1` suffix or
// trailing slashes — otherwise supabase-js builds `.../rest/v1//rest/v1/...`
// and every read fails at request time with PGRST125 "Invalid path".
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/, '')
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Cookieless Supabase client for build-time / static contexts —
 * `generateStaticParams`, `sitemap.ts`, etc. — where `next/headers` `cookies()`
 * is unavailable (calling it there throws). Read-only anon access (RLS enforced).
 */
export function createStaticSupabase() {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // No request context — nothing to persist.
      },
    },
  })
}

export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component — cookie mutations are ignored
        }
      },
    },
  })
}
