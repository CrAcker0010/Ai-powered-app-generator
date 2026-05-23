# AppForge (AI App Generator) — Project Architecture & Technical Guide

Welcome to the technical explainer for **AppForge** — a metadata-driven application runtime that converts natural language requirements or JSON configurations into fully functioning web applications with dynamic user interfaces, RESTful APIs, and database structures instantly.

---

## 🌟 High-Level Architectural Overview

AppForge is built upon the principle of **Metadata-Driven Software**. Rather than hardcoding forms, tables, databases, and APIs for every custom app concept, AppForge implements an adaptable **Runtime Engine** that interprets a single JSON document (metadata config) and materializes a fully featured business application on the fly.

```
                  ┌───────────────────────────────────────────┐
                  │    Conversational Chat / JSON Importer    │
                  └─────────────────────┬─────────────────────┘
                                        │
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │       JSON Metadata Configuration         │
                  │   (Name, Theme, Models, Views, Nav)       │
                  └─────────────────────┬─────────────────────┘
                                        │
                                        ├──────────────────────────────────────────┐
                                        ▼                                          ▼
                  ┌───────────────────────────────────────────┐      ┌───────────────────────────┐
                  │          Frontend Dynamic Engine          │      │  Backend Dynamic Runtime  │
                  │   (interprets views ➜ renders UI)         │      │  (Zod Validations & CRUD) │
                  └─────────────────────┬─────────────────────┘      └─────────────┬─────────────┘
                                        │                                          │
                                        └───────────────────┬──────────────────────┘
                                                            │
                                                            ▼
                                             ┌─────────────────────────────┐
                                             │    Schema-Agnostic DB       │
                                             │    (PostgreSQL JSONB)       │
                                             └─────────────────────────────┘
```

---

## 📁 Key Directories and Code Layout

* **`src/components/engine/`**: The core frontend rendering engine.
  * **`Renderer.tsx`**: Route controller and shell navigator. Handles active view states, sidebar navigation, and user layouts.
  * **`widgets/DynamicForm.tsx`**: Translates schema configurations into interactive forms with default fallback types and client-side Zod validation.
  * **`widgets/DynamicTable.tsx`**: Renders database records with inline editing, dynamic formatting (badges, dates, booleans), sorting, and deletion.
  * **`widgets/DynamicDashboard.tsx`**: Compiles multi-column dashboards containing stats cards, list views, and mock chart representations.
* **`src/app/api/`**: Next.js App Router dynamic controller routes.
  * **`/api/apps/`**: Creates and lists tenant applications.
  * **`/api/apps/[appId]/data/[model]/`**: The heart of the backend runtime. Dynamically handles GET and POST requests for *any* model specified in the JSON config without hardcoded routes.
  * **`/api/chat/`**: Serves the streaming conversational Gemini API with structured pipeline updates.
  * **`/api/builder/compile/`**: The **Collaborative Multi-Agent Pipeline** that compiles chat history into the final JSON config.
* **`src/lib/`**: Helpers and shared libraries.
  * **`validation.ts`**: Dynamically compiles Zod schema definitions from database configurations at runtime.
  * **`github.ts`**: The Octokit REST integration that packages your app configuration into a ready-to-run GitHub repo.
  * **`i18n.ts`**: Multi-language translations support mapping views to six dynamic locales.
* **`prisma/`**: PostgreSQL configuration and seeding files.
  * **`schema.prisma`**: The schema-agnostic relational database map.

---

## 🚀 The Three Core Pillars of AppForge

### 1. The Schema-Agnostic Database Architecture
In a standard application, adding a field or table requires database migrations. AppForge avoids this completely by storing records as freeform JSONB data.
* **`App` Model**: Stores the application name, slug, descriptions, and the entire `config` (JSONB) defining the UI, theme, navigation, and schemas.
* **`ModelDef` Model**: Represents a database table. It stores the name of the model and its attributes/types in a `schema` (JSONB) column.
* **`Record` Model**: Represents a row of data. It points to an `App` and a `ModelDef`, and stores all cell values in a single `data` (JSONB) column.
This allows users to create tables, append columns, and alter schemas instantly at runtime—**with zero database migrations!**

### 2. The Dynamic Backend & Validation Runtime
* **Dynamic Zod compilation**: When a POST request hits `/api/apps/[appId]/data/[model]`, the system queries the `ModelDef` schema, dynamically compiles a Zod validation schema on the fly, and validates the request body.
* If a field type is unknown or missing, the system doesn't crash; it degrades gracefully by performing soft validation, preserving data safety while allowing rapid iteration.

### 3. The Collaborative Multi-Agent Gemini Compiler
When you finalize your chat and click **"Launch Application"**, a pipeline of **five specialized AI agents** is orchestrated in sequence using Vercel serverless functions and Gemini:
1. **Prompt Enhancer (Agent 1)**: Reviews conversation logs to extract goals, user steps, and primary palette tones.
2. **Backend Architect (Agent 2)**: Translates goals into relational database tables, columns, and enums.
3. **Frontend Designer (Agent 3)**: Designs multi-column dashboard cards, nav routes, and grid systems.
4. **Integration Specialist (Agent 4)**: Links views to models, maps route targets, and validates JSON configuration integrity.
5. **Release Manager (Agent 5)**: Registers the application and provisions PostgreSQL tables inside the dynamic runtime.

---

## 🛡️ Robust Features & Graceful Degradation

AppForge is designed to handle malformed configurations gracefully at every level:
* **Missing Fields/Inconsistent Schemas**: Handled through optional chaining (`?.`) on the frontend. Missing columns in a row are silently ignored or rendered as a dash (`-`).
* **Unknown Component Types**: If a view configuration designates an unknown type (e.g. `type: "INVALID_WIDGET"`), the frontend catches it using an **ErrorBoundary** and renders an elegant, inline fallback message rather than crashing the page.
* **Form Field Fallbacks**: If a model specifies an unknown datatype, the dynamic form defaults to rendering a standard text input field automatically.

---

## 📈 Live Deployments & Seeding
AppForge is pre-configured for automated **Vercel** and **Render** builds. It utilizes a `vercel-build` trigger that automatically compiles your TypeScript, provisions your database tables in Neon Postgres, and executes an **idempotent database seed script** to populate the application with three fully featured starter apps (CRM, Task Tracker, Inventory Manager) and a pre-configured demo account (`demo@appforge.dev` / `demo1234`).
