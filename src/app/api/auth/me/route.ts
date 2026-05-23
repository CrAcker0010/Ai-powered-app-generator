import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/auth/me
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { token } }).catch(() => {})
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        githubToken: session.user.githubToken ? 'set' : null,
      },
    })
  } catch (err) {
    console.error('[GET /api/auth/me]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
