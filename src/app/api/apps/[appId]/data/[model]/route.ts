import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRecord } from '@/lib/validation'

interface RouteParams {
  params: Promise<{ appId: string; model: string }>
}

// GET /api/apps/[appId]/data/[model] — List records for a model
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId, model } = await params

    // Verify app exists
    const app = await prisma.app.findUnique({ where: { id: appId } })
    if (!app) return NextResponse.json({ error: 'App not found' }, { status: 404 })

    // Pagination
    const url = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '20')))
    const search = url.searchParams.get('search') ?? ''

    const modelDef = await prisma.modelDef.findUnique({ where: { appId_name: { appId, name: model } } })
    if (!modelDef) return NextResponse.json({ error: 'Model not found' }, { status: 404 })

    const [records, total] = await Promise.all([
      prisma.record.findMany({
        where: { appId, modelDefId: modelDef.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.record.count({ where: { appId, modelDefId: modelDef.id } }),
    ])

    return NextResponse.json({
      data: records,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (err) {
    console.error('[GET /api/apps/[appId]/data/[model]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/apps/[appId]/data/[model] — Create a record
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId, model } = await params

    const app = await prisma.app.findUnique({ where: { id: appId } })
    if (!app) return NextResponse.json({ error: 'App not found' }, { status: 404 })

    const modelDef = await prisma.modelDef.findUnique({ where: { appId_name: { appId, name: model } } })
    if (!modelDef) return NextResponse.json({ error: 'Model not found' }, { status: 404 })

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Validate against model schema — never hard fail
    const validation = validateRecord(modelDef.schema, body)

    // If there are validation errors, return them but don't block (soft validation)
    const record = await prisma.record.create({
      data: {
        appId,
        modelDefId: modelDef.id,
        data: validation.data as object,
      },
    })

    return NextResponse.json(
      {
        data: record,
        ...(Object.keys(validation.errors).length > 0 ? { warnings: validation.errors } : {}),
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[POST /api/apps/[appId]/data/[model]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
