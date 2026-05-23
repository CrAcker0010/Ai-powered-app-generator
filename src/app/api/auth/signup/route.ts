import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const signupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// POST /api/auth/signup
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    })

    // Create session
    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await prisma.session.create({
      data: { userId: user.id, token, expiresAt },
    })

    const response = NextResponse.json(
      { message: 'Account created successfully', user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    )

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[POST /api/auth/signup]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
