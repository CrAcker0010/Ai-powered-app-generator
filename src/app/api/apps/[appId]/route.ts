import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateAppSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  locale: z.string().optional(),
})

// GET /api/apps/[appId]
export async function GET(req: NextRequest, { params }: { params: Promise<{ appId: string }> }) {
  try {
    const { appId } = await params
    const app = await prisma.app.findUnique({
      where: { id: appId },
      include: { modelDefs: true, _count: { select: { records: true } } },
    })

    if (!app) return NextResponse.json({ error: 'App not found' }, { status: 404 })

    return NextResponse.json({ data: app })
  } catch (err) {
    console.error('[GET /api/apps/[appId]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/apps/[appId]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ appId: string }> }) {
  try {
    const { appId } = await params
    const existing = await prisma.app.findUnique({ where: { id: appId } })
    if (!existing) return NextResponse.json({ error: 'App not found' }, { status: 404 })

    const body = await req.json()
    const parsed = updateAppSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { config, ...rest } = parsed.data

    // If config is updated, sync model defs
    if (config?.models) {
      const models = config.models as Record<string, unknown>
      // Delete old and recreate
      await prisma.modelDef.deleteMany({ where: { appId } })
      await prisma.modelDef.createMany({
        data: Object.entries(models).map(([modelName, modelDef]) => ({
          appId,
          name: modelName,
          schema: (modelDef as Record<string, unknown>).fields
            ? (modelDef as object)
            : { fields: modelDef } as object,
        })),
      })
    }

    const app = await prisma.app.update({
      where: { id: appId },
      data: {
        ...rest,
        ...(config ? { config: config as object } : {}),
      },
      include: { modelDefs: true, _count: { select: { records: true } } },
    })

    return NextResponse.json({ data: app })
  } catch (err) {
    console.error('[PATCH /api/apps/[appId]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/apps/[appId]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ appId: string }> }) {
  try {
    const { appId } = await params
    const existing = await prisma.app.findUnique({ where: { id: appId } })
    if (!existing) return NextResponse.json({ error: 'App not found' }, { status: 404 })

    await prisma.app.delete({ where: { id: appId } })

    return NextResponse.json({ message: 'App deleted successfully' })
  } catch (err) {
    console.error('[DELETE /api/apps/[appId]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
