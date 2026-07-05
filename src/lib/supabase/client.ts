'use client'

import { createBrowserClient } from '@supabase/ssr'

// Tolerate a pasted `/rest/v1` suffix or trailing slashes in the project URL
// (see lib/supabase/server.ts for why).
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
  .trim()
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/, '')

export function createClientSupabase() {
  return createBrowserClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
