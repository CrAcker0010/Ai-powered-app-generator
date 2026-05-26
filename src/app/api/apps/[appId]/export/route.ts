import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { exportToGithub } from '@/lib/github'
import { z } from 'zod'
import type { AppConfig } from '@/types/app'

interface RouteParams {
  params: Promise<{ appId: string }>
}

const exportSchema = z.object({
  token: z.string().min(1, 'GitHub token is required'),
  repoName: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Invalid repository name'),
  description: z.string().optional(),
})

// POST /api/apps/[appId]/export
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { appId } = await params

    const app = await prisma.app.findUnique({
      where: { id: appId },
      include: { modelDefs: true },
    })
    if (!app) return NextResponse.json({ error: 'App not found' }, { status: 404 })

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = exportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { token, repoName, description } = parsed.data

    const result = await exportToGithub({
      token,
      repoName,
      description: description ?? app.description ?? undefined,
      config: app.config as AppConfig,
      modelDefs: app.modelDefs.map((m: any) => ({ name: m.name, schema: m.schema })),
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? 'Export failed' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'App exported successfully',
      repoUrl: result.repoUrl,
    })
  } catch (err) {
    console.error('[POST /api/apps/[appId]/export]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
