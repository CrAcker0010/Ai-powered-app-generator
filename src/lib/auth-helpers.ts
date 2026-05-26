import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface SessionUser {
  userId: string
  email: string
  name: string | null
  githubToken: string | null
}

export async function getServerSession(req: NextRequest): Promise<SessionUser | null> {
  try {
    const token = req.cookies.get('session')?.value
    if (!token) {
      // Fallback to seeded demo user to remove login compulsion
      const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@appforge.dev' },
      })
      if (demoUser) {
        return {
          userId: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          githubToken: demoUser.githubToken,
        }
      }
      return null
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { token } }).catch(() => {})
      
      // Fallback to seeded demo user to remove login compulsion
      const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@appforge.dev' },
      })
      if (demoUser) {
        return {
          userId: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          githubToken: demoUser.githubToken,
        }
      }
      return null
    }

    return {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      githubToken: session.user.githubToken,
    }
  } catch {
    return null
  }
}
