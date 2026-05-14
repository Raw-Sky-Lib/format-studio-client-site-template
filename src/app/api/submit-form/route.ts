import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'

// Simple in-memory rate limiter — 3 submissions per IP per hour.
// For production, replace with Redis (Upstash) if you need persistence across instances.
const submissions = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = submissions.get(ip)

  if (!entry || entry.resetAt < now) {
    submissions.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return false
  }

  if (entry.count >= 3) return true

  entry.count++
  return false
}

const bodySchema = z.object({
  form_name: z.string().min(1).max(100).default('contact'),
  data: z.record(z.string(), z.unknown()),
})

// POST /api/submit-form
// Accepts form submissions and writes to form_submissions table.
// Submissions appear in the client-portal Forms inbox.
//
// Body: { form_name: string, data: Record<string, unknown> }
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      { status: 429 }
    )
  }

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
  }

  try {
    const supabase = await createServerSupabase()
    const { error } = await supabase.from('form_submissions').insert({
      form_name: body.form_name,
      data: body.data,
    })
    if (error) throw error
  } catch {
    return NextResponse.json({ error: 'Submission failed. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
