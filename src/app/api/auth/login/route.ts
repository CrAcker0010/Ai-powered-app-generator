import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      // Constant time response to prevent user enumeration
      await bcrypt.hash('dummy', 12)
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Create session
    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await prisma.session.create({
      data: { userId: user.id, token, expiresAt },
    })

    const response = NextResponse.json({
      message: 'Logged in successfully',
      user: { id: user.id, email: user.email, name: user.name },
    })

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[POST /api/auth/login]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
