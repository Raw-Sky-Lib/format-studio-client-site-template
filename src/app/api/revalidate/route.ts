import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// POST /api/revalidate
// Called by the client-portal backend after every confirmed content save.
// The portal sends the tenant's Supabase service role key as X-Revalidate-Secret —
// validated here against SUPABASE_SERVICE_ROLE_KEY (server-side only, never NEXT_PUBLIC_).
//
// Expected body: { "paths": ["/", "/blog/my-post"] }
// Required header: X-Revalidate-Secret: <SUPABASE_SERVICE_ROLE_KEY>
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')
  if (!secret || secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let paths: string[]
  try {
    const body = await request.json()
    if (!Array.isArray(body.paths)) throw new Error('paths must be an array')
    paths = body.paths.filter((p: unknown) => typeof p === 'string')
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  for (const path of paths) {
    revalidatePath(path)
  }

  return NextResponse.json({ revalidated: true, paths })
}
