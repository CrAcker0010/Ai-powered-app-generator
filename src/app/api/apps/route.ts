import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { slugify } from '@/lib/utils'
import { getServerSession } from '@/lib/auth-helpers'

const createAppSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  locale: z.string().optional().default('en'),
})

// GET /api/apps — List all apps for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apps = await prisma.app.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { records: true, modelDefs: true } },
      },
    })

    return NextResponse.json({ data: apps })
  } catch (err) {
    console.error('[GET /api/apps]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/apps — Create a new app
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createAppSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, description, config, locale } = parsed.data

    // Generate unique slug
    let slug = slugify(name)
    const existing = await prisma.app.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    // Extract model definitions from config if present
    const appConfig = (config ?? {}) as Record<string, unknown>
    const models = appConfig.models as Record<string, unknown> | undefined

    const app = await prisma.app.create({
      data: {
        name,
        description,
        slug,
        locale,
        config: appConfig as object,
        userId: session.userId,
        // Create model defs from the config models
        modelDefs: models
          ? {
              create: Object.entries(models).map(([modelName, modelDef]) => ({
                name: modelName,
                schema: ((modelDef as Record<string, unknown>).fields
                  ? modelDef
                  : { fields: modelDef }) as object,
              })),
            }
          : undefined,
      },
      include: {
        modelDefs: true,
        _count: { select: { records: true } },
      },
    })

    return NextResponse.json({ data: app }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/apps]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
