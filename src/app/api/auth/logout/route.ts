import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/auth/logout
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('session')?.value
    if (token) {
      await prisma.session.deleteMany({ where: { token } }).catch(() => {})
    }

    const response = NextResponse.json({ message: 'Logged out successfully' })
    response.cookies.delete('session')
    return response
  } catch (err) {
    console.error('[POST /api/auth/logout]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
