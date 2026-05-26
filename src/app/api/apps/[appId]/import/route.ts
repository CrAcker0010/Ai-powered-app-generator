import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'

interface RouteParams {
  params: Promise<{ appId: string }>
}

// POST /api/apps/[appId]/import
// Accepts multipart/form-data with fields: file (CSV), model (string)
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId } = await params
    const app = await prisma.app.findUnique({ where: { id: appId } })
    if (!app) return NextResponse.json({ error: 'App not found' }, { status: 404 })

    const formData = await req.formData()
    const file = formData.get('file')
    const modelName = formData.get('model') as string

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!modelName) {
      return NextResponse.json({ error: 'Model name is required' }, { status: 400 })
    }

    // Get or create model def
    let modelDef = await prisma.modelDef.findUnique({
      where: { appId_name: { appId, name: modelName } },
    })

    const csvText = await file.text()

    // Parse CSV
    const parseResult = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (h) => h.trim(),
    })

    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse CSV', details: parseResult.errors.slice(0, 5) },
        { status: 400 }
      )
    }

    if (parseResult.data.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 })
    }

    // Auto-create model def from CSV headers if none exists
    if (!modelDef) {
      const firstRow = parseResult.data[0]
      const inferredFields: Record<string, { type: string; label: string }> = {}

      for (const [key, value] of Object.entries(firstRow)) {
        let type = 'string'
        if (typeof value === 'number') type = 'number'
        else if (typeof value === 'boolean') type = 'boolean'
        else if (typeof value === 'string' && value.includes('@')) type = 'email'
        inferredFields[key] = { type, label: key }
      }

      modelDef = await prisma.modelDef.create({
        data: {
          appId,
          name: modelName,
          schema: { fields: inferredFields } as object,
        },
      })
    }

    // Batch insert records
    const BATCH_SIZE = 50
    let imported = 0
    let failed = 0
    const errors: Array<{ row: number; error: string }> = []

    for (let i = 0; i < parseResult.data.length; i += BATCH_SIZE) {
      const batch = parseResult.data.slice(i, i + BATCH_SIZE)
      try {
        await prisma.record.createMany({
          data: batch.map((row) => ({
            appId,
            modelDefId: modelDef!.id,
            data: row as object,
          })),
        })
        imported += batch.length
      } catch (err) {
        failed += batch.length
        errors.push({ row: i, error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }

    return NextResponse.json({
      message: `Import complete: ${imported} records imported, ${failed} failed`,
      imported,
      failed,
      total: parseResult.data.length,
      parseErrors: parseResult.errors.length,
      ...(errors.length > 0 ? { errors: errors.slice(0, 10) } : {}),
    })
  } catch (err) {
    console.error('[POST /api/apps/[appId]/import]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
