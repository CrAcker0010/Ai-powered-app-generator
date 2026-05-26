import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { google, createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth-helpers'
import { slugify } from '@/lib/utils'

// ─── Schema mirrors the engine's expected config structure ───────────────────

const FieldSchema = z.object({
  type: z.enum(['string', 'text', 'number', 'boolean', 'date', 'email', 'enum', 'url']),
  label: z.string(),
  required: z.boolean().optional(),
  enum: z.array(z.string()).optional(),
})

const ModelSchema = z.object({
  name: z.string(),
  label: z.string(),
  fields: z.record(z.string(), FieldSchema),
})

const ColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(['string', 'number', 'date', 'email', 'boolean', 'badge', 'url']).optional(),
  sortable: z.boolean().optional(),
})

const WidgetSchema = z.object({
  id: z.string(),
  type: z.enum(['stat', 'chart', 'list']),
  title: z.string(),
  model: z.string(),
  color: z.enum(['purple', 'blue', 'green', 'amber', 'red']).optional(),
  span: z.number().optional(),
})

const ViewSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    label: z.string(),
    type: z.literal('dashboard'),
    widgets: z.array(WidgetSchema),
  }),
  z.object({
    id: z.string(),
    label: z.string(),
    type: z.literal('table'),
    model: z.string(),
    columns: z.array(ColumnSchema),
  }),
  z.object({
    id: z.string(),
    label: z.string(),
    type: z.literal('form'),
    model: z.string(),
  }),
])

const NavItemSchema = z.object({
  label: z.string(),
  icon: z.enum(['layout', 'users', 'briefcase', 'package', 'check-square', 'bar-chart', 'settings', 'file', 'home', 'star', 'tag', 'calendar']),
  view: z.string(),
})

const AppConfigSchema = z.object({
  name: z.string().describe('Short, clear name for the application'),
  description: z.string().describe('One sentence description of what this app does'),
  locale: z.literal('en'),
  theme: z.object({
    primaryColor: z.string(),
    mode: z.literal('dark'),
  }),
  models: z.record(z.string(), ModelSchema).describe('Data models for this app'),
  views: z.array(ViewSchema).describe('UI views — always include one dashboard view first, then table views for each model'),
  nav: z.array(NavItemSchema).describe('Sidebar navigation items'),
})

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt } = await req.json()
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
      return NextResponse.json({ error: 'A valid prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    const googleClient = apiKey ? createGoogleGenerativeAI({ apiKey }) : google

    // Generate structured app config via Gemini
    const { object } = await generateObject({
      model: googleClient('gemini-2.5-flash'),
      schema: AppConfigSchema,
      system: `You are an expert full-stack product designer who builds internal tools and business applications.
Given a user's prompt describing an application idea, you will design a complete, production-ready data schema and UI configuration for it.

Rules:
- Design 2-4 sensible data models with appropriate, realistic fields
- Always include a dashboard view as the FIRST view with 2-3 stat widgets
- Add one table view per model for CRUD operations
- Navigation items must map to valid view IDs
- Field keys must be camelCase, no spaces
- Enum values must be realistic for the domain
- Pick a theme primaryColor as a CSS hex color that suits the app's industry (use muted, professional tones like #6366f1, #0ea5e9, #10b981, #f59e0b)
- The app should feel like a real internal tool a team would actually use`,
      prompt: `Design a complete application for: "${prompt.trim()}"`,
    })

    // Persist to database
    const models = object.models as Record<string, unknown>
    let slug = slugify(object.name)
    const existing = await prisma.app.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const app = await prisma.app.create({
      data: {
        name: object.name,
        description: object.description,
        slug,
        locale: object.locale,
        config: object as object,
        userId: session.userId,
        modelDefs: {
          create: Object.entries(models).map(([modelName, modelDef]) => ({
            name: modelName,
            schema: (modelDef as object),
          })),
        },
      },
    })

    return NextResponse.json({ data: { id: app.id, name: app.name } }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/apps/generate]', err)
    const message = err instanceof Error ? err.message : 'Failed to generate app'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
