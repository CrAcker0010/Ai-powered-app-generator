import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { google, createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export const maxDuration = 45

// ─── Schema Definitions for Zod ─────────────────────────────────────────────

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
  name: z.string(),
  description: z.string(),
  locale: z.literal('en'),
  theme: z.object({
    primaryColor: z.string(),
    mode: z.literal('dark'),
  }),
  models: z.record(z.string(), ModelSchema),
  views: z.array(ViewSchema),
  nav: z.array(NavItemSchema),
})

// Helper to instantiate specialized Google Gemini Client per Agent to support multiple API Keys
function getModelForAgent(agentName: string) {
  const envName = `GEMINI_API_KEY_${agentName.toUpperCase().replace(/\s+/g, '_')}`
  const customKey = process.env[envName] || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  
  if (customKey) {
    const customGoogle = createGoogleGenerativeAI({
      apiKey: customKey,
    })
    return customGoogle('gemini-2.5-flash')
  }
  return google('gemini-2.5-flash')
}

export async function POST(req: NextRequest) {
  const agentLogs: { agent: string; action: string; durationMs: number }[] = []
  
  try {
    const defaultUser = await prisma.user.findFirst()
    if (!defaultUser) {
      return NextResponse.json({ error: 'Seeded default user not found' }, { status: 500 })
    }

    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Conversation history is required' }, { status: 400 })
    }

    const chatHistoryText = messages
      .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n')

    // ─── AGENT 1: PROMPT ENHANCER (Requirements Specialist) ───────────────────
    const startAgent1 = Date.now()
    const agent1Prompt = `Read the following chat history between an App Architect and a user.
Your job is to enhance their requirements, scope the system goals, select an appropriate primary accent color (hex code suitable for the app's niche from these strict light pastel tones only: #e2e8f0 (slate), #bfdbfe (blue), #c7d2fe (indigo), #ddd6fe (violet), #e9d5ff (purple), #bbf7d0 (green), #a5f3fc (cyan), #fde68a (amber)), and synthesize a technical requirements blueprint.`
    
    const agent1Result = await generateObject({
      model: getModelForAgent('prompt_enhancer'),
      schema: z.object({
        appName: z.string().describe('Enhanced application name'),
        appDescription: z.string().describe('Detailed single sentence scope summary'),
        niche: z.string().describe('App industry vertical (e.g. healthcare, logistics, sales)'),
        nicheColor: z.string().describe('Sensible design primary color hex code'),
        workflowGoals: z.array(z.string()).describe('Core business actions we are tracking'),
      }),
      system: 'You are the Prompt Enhancer & Requirements Specialist agent.',
      prompt: `Chat history:\n\n${chatHistoryText}\n\nEnhance these requirements:\n${agent1Prompt}`,
    })
    
    const requirements = agent1Result.object
    agentLogs.push({
      agent: 'Prompt Enhancer',
      action: `Synthesized specifications for "${requirements.appName}" (${requirements.niche})`,
      durationMs: Date.now() - startAgent1,
    })

    // ─── AGENT 2: BACKEND ARCHITECT (Data Modeling Agent) ─────────────────────
    const startAgent2 = Date.now()
    const agent2Prompt = `Using these requirements, design 2-4 database models (JSONB-backed tables) to satisfy the app requirements.
Determine fields, types (string, text, number, boolean, date, email, enum, url), labels, and enum lists where applicable.`

    const agent2Result = await generateObject({
      model: getModelForAgent('backend_architect'),
      schema: z.object({
        models: z.record(z.string(), ModelSchema).describe('The relational data models key-valued by model name'),
      }),
      system: 'You are the Backend Architect & Relational Database model generator agent.',
      prompt: `Requirements Specs:\n${JSON.stringify(requirements, null, 2)}\n\nGenerate the backend database model schemas:\n${agent2Prompt}`,
    })

    const dataModels = agent2Result.object.models
    agentLogs.push({
      agent: 'Backend Architect',
      action: `Engineered ${Object.keys(dataModels).length} relational models: [${Object.keys(dataModels).join(', ')}]`,
      durationMs: Date.now() - startAgent2,
    })

    // ─── AGENT 3: FRONTEND DESIGNER (Views & Layout Agent) ────────────────────
    const startAgent3 = Date.now()
    const agent3Prompt = `Based on these database models and specifications, design the frontend user interface.
Include:
- A FIRST view of type "dashboard" with 2-4 statistics widgets (stat, chart, list) mapped to these models.
- One table view per model to allow standard CRUD listings.
- navigation links mapping to all defined views.`

    const agent3Result = await generateObject({
      model: getModelForAgent('frontend_designer'),
      schema: z.object({
        views: z.array(ViewSchema).describe('Proposed dashboard, table, and form views'),
        nav: z.array(NavItemSchema).describe('Sidebar navigation maps mapping to views'),
      }),
      system: 'You are the Frontend UI Layout & View Designer agent.',
      prompt: `Database Schema Models:\n${JSON.stringify(dataModels, null, 2)}\n\nSpecs:\n${JSON.stringify(requirements, null, 2)}\n\nGenerate views and navigation links:\n${agent3Prompt}`,
    })

    const uiLayouts = agent3Result.object
    agentLogs.push({
      agent: 'Frontend Designer',
      action: `Generated ${uiLayouts.views.length} views and ${uiLayouts.nav.length} navbar routes`,
      durationMs: Date.now() - startAgent3,
    })

    // ─── AGENT 4: INTEGRATION SPECIALIST (Wiring & Assembly Agent) ────────────
    const startAgent4 = Date.now()
    const agent4Prompt = `Integrate the frontend layout, backend database models, and design color theme into a single finalized App Configuration.
Verify:
1. Every widget model target maps to a valid model.
2. Every table view maps to a valid model.
3. Every nav route view links to a valid view ID.
4. Accent colors and theme parameters are fully wired.`

    const agent4Result = await generateObject({
      model: getModelForAgent('integration_specialist'),
      schema: AppConfigSchema,
      system: 'You are the Integration Specialist & Full-Stack System Assembler agent.',
      prompt: `Backend Schema:\n${JSON.stringify(dataModels, null, 2)}\n\nFrontend Layout:\n${JSON.stringify(uiLayouts, null, 2)}\n\nTheme Palette:\n${JSON.stringify(requirements, null, 2)}\n\nAssemble and validate full app config:\n${agent4Prompt}`,
    })

    const finalConfig = agent4Result.object
    agentLogs.push({
      agent: 'Integration Specialist',
      action: `Assembled configuration, wired models, and validated JSON schemas`,
      durationMs: Date.now() - startAgent4,
    })

    // ─── AGENT 5: RELEASE MANAGER (Provisioner & Deployment Agent) ─────────────
    const startAgent5 = Date.now()
    
    // Save app configuration and provision dynamic PostgreSQL schema
    const models = finalConfig.models as Record<string, unknown>
    let slug = slugify(finalConfig.name)
    const existing = await prisma.app.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const app = await prisma.app.create({
      data: {
        name: finalConfig.name,
        description: finalConfig.description,
        slug,
        locale: finalConfig.locale,
        config: finalConfig as object,
        userId: defaultUser.id,
        modelDefs: {
          create: Object.entries(models).map(([modelName, modelDef]) => ({
            name: modelName,
            schema: (modelDef as object),
          })),
        },
      },
    })

    agentLogs.push({
      agent: 'Release Manager',
      action: `Provisioned tables in PostgreSQL and activated dynamic AppForge runtime`,
      durationMs: Date.now() - startAgent5,
    })

    return NextResponse.json({
      data: { id: app.id, name: app.name },
      logs: agentLogs,
    }, { status: 201 })
    
  } catch (err) {
    console.error('[POST /api/builder/compile] Agent Pipeline Failed:', err)
    const message = err instanceof Error ? err.message : 'Compilation failed'
    return NextResponse.json({ error: message, logs: agentLogs }, { status: 500 })
  }
}
