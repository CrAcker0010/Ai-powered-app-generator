import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { google, createGoogleGenerativeAI } from '@ai-sdk/google'
import { z } from 'zod'

export const maxDuration = 30

const chatResponseSchema = z.object({
  message: z.string().describe('The natural conversational response from AppForge Architect to the user. Muted, professional tone. Guide them step-by-step. DO NOT output raw JSON configs inside this message.'),
  pipelineStage: z.number().min(1).max(4).describe('The current sequential stage of the application build (1: Workflow Steps, 2: Data Models, 3: UI & Navigation, 4: Launch App). Only advance to the next stage when the current stage details are reasonably clear.'),
  checklist: z.array(z.object({
    text: z.string().describe('Checklist item text (short, actionable task)'),
    done: z.boolean().describe('True if this requirement has been discussed and resolved, False otherwise')
  })).describe('Checklist of tasks under the current stage (at least 3 items)'),
  appDescription: z.string().describe('A concise, user-friendly description of the application concept under construction so far (e.g., "A customer support ticket manager with SLA tracking").'),
  schemaPreview: z.string().describe('Prisma-like schema block representing the database models proposed for this app. Should only contain relevant models for Stage 2+. Should be empty in Stage 1.'),
  uiPreview: z.object({
    widgets: z.array(z.object({
      title: z.string().describe('Widget title (e.g. "Total Leads", "Open Tasks")'),
      type: z.string().describe('Widget type (e.g. "stat", "chart", "list")'),
      color: z.string().describe('Widget display accent color (e.g. "purple", "blue", "green", "amber", "red")')
    })).optional().describe('Dashboard widgets proposed in Stage 3+'),
    views: z.array(z.object({
      name: z.string().describe('View navigation title (e.g. "Contacts Table", "Create Task Form")'),
      type: z.string().describe('View type (e.g. "table", "form", "dashboard")')
    })).optional().describe('Navigation views proposed in Stage 3+')
  }).describe('The proposed user interface elements (views, navigation, and dashboard widgets). Only populate in Stage 3+.'),
  codePreview: z.string().describe('A clean, beautifully formatted JSON configuration outline or dynamic code snippet representing the current state of the application config under construction. Maintain structure.')
})

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    const systemPrompt = `You are "AppForge Architect", a brilliant AI product designer and full-stack software engineer.
You are helping a user build a bespoke web application step-by-step through natural conversation.

Your style is simple, professional, and elegant. You use Google's Stitch design system as a reference (muted colors, dark surfaces, clean layout, premium gradients like soft indigo and sky blue).

CRITICAL INSTRUCTIONS:
- Analyze the user's messages and conversational history.
- Evaluate what stage of the 4-step Stage Pipeline we are currently in:
  1. Stage 1 (Workflow Steps): Outline the actions, steps, and goals of the application. Ask them about their workflow.
  2. Stage 2 (Data Models): Translate their workflow into database models/tables (e.g. contacts, deals, tasks) with structured columns/fields.
  3. Stage 3 (UI & Navigation): Design dashboard widgets, dynamic tables, forms, and sidebar layout.
  4. Stage 4 (Launch App): Provide a complete summary. Advise them to click the "Launch Application" button to build and deploy.
- Incrementally progress the pipelineStage (from 1 to 4) as you and the user align on features.
- Generate dynamic metadata representing the application under construction:
  * checklist: 3 or more tasks for the current stage. Update 'done' to true for completed milestones.
  * appDescription: A living summary description of the app.
  * schemaPreview: A beautiful database schema (written in Prisma schema format, e.g. "model Contact { id String @id ... }") once you enter Stage 2.
  * uiPreview: The proposed dashboard widgets and navigation views once you enter Stage 3.
  * codePreview: A clean, formatted JSON configuration block under construction (e.g., showing the models and views structured elegantly).
- Always ensure your conversational response (in the 'message' field) matches the stage, guides them naturally, and maintains a highly collaborative, supportive, and premium tone.`

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    const googleClient = apiKey ? createGoogleGenerativeAI({ apiKey }) : google

    const result = await generateObject({
      model: googleClient('gemini-2.5-flash'),
      messages,
      system: systemPrompt,
      schema: chatResponseSchema,
    })

    return NextResponse.json(result.object)
  } catch (err) {
    console.error('[POST /api/chat]', err)
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 })
  }
}
