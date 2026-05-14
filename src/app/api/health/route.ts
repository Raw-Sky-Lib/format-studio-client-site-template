import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

// GET /api/health
// Checks Supabase connectivity. Used by:
//   - Vercel Cron (keep-alive every 3 days — see vercel.json)
//   - Agency Hub health monitoring
export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { error } = await supabase.from('site_settings').select('key').limit(1)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
