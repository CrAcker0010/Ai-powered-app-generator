import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-helpers'

// GET /api/auth/me
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        githubToken: session.githubToken ? 'set' : null,
      },
    })
  } catch (err) {
    console.error('[GET /api/auth/me]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
