import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// POST /api/revalidate
// Called by the client-portal backend after every confirmed content save.
// Validates X-Revalidate-Secret, then calls revalidatePath() on each path.
//
// Expected body: { "paths": ["/", "/blog/my-post"] }
// Required header: X-Revalidate-Secret: <REVALIDATE_SECRET env var>
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
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
