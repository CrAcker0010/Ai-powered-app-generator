import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateRecord } from '@/lib/validation'

interface RouteParams {
  params: Promise<{ appId: string; model: string; recordId: string }>
}

// GET /api/apps/[appId]/data/[model]/[recordId]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId, model, recordId } = await params
    const app = await prisma.app.findUnique({ where: { id: appId } })
    if (!app) return NextResponse.json({ error: 'App not found' }, { status: 404 })

    const modelDef = await prisma.modelDef.findUnique({ where: { appId_name: { appId, name: model } } })
    if (!modelDef) return NextResponse.json({ error: 'Model not found' }, { status: 404 })

    const record = await prisma.record.findFirst({ where: { id: recordId, appId, modelDefId: modelDef.id } })
    if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 })

    return NextResponse.json({ data: record })
  } catch (err) {
    console.error('[GET /api/apps/[appId]/data/[model]/[recordId]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/apps/[appId]/data/[model]/[recordId]
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId, model, recordId } = await params
    const app = await prisma.app.findUnique({ where: { id: appId } })
    if (!app) return NextResponse.json({ error: 'App not found' }, { status: 404 })

    const modelDef = await prisma.modelDef.findUnique({ where: { appId_name: { appId, name: model } } })
    if (!modelDef) return NextResponse.json({ error: 'Model not found' }, { status: 404 })

    const existing = await prisma.record.findFirst({ where: { id: recordId, appId } })
    if (!existing) return NextResponse.json({ error: 'Record not found' }, { status: 404 })

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const validation = validateRecord(modelDef.schema, body)

    const record = await prisma.record.update({
      where: { id: recordId },
      data: { data: validation.data as object },
    })

    return NextResponse.json({
      data: record,
      ...(Object.keys(validation.errors).length > 0 ? { warnings: validation.errors } : {}),
    })
  } catch (err) {
    console.error('[PUT /api/apps/[appId]/data/[model]/[recordId]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/apps/[appId]/data/[model]/[recordId]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId, model, recordId } = await params
    const app = await prisma.app.findUnique({ where: { id: appId } })
    if (!app) return NextResponse.json({ error: 'App not found' }, { status: 404 })

    const modelDef = await prisma.modelDef.findUnique({ where: { appId_name: { appId, name: model } } })
    if (!modelDef) return NextResponse.json({ error: 'Model not found' }, { status: 404 })

    const existing = await prisma.record.findFirst({ where: { id: recordId, appId } })
    if (!existing) return NextResponse.json({ error: 'Record not found' }, { status: 404 })

    await prisma.record.delete({ where: { id: recordId } })

    return NextResponse.json({ message: 'Record deleted successfully' })
  } catch (err) {
    console.error('[DELETE /api/apps/[appId]/data/[model]/[recordId]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
