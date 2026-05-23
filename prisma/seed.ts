import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

const CRM_CONFIG = {
  name: 'CRM Demo',
  description: 'Customer relationship management demo',
  locale: 'en',
  theme: { primaryColor: '#7c6fff', mode: 'dark' },
  models: {
    contacts: {
      name: 'contacts',
      label: 'Contacts',
      fields: {
        name: { type: 'string', label: 'Full Name', required: true },
        email: { type: 'email', label: 'Email', required: true },
        company: { type: 'string', label: 'Company' },
        phone: { type: 'string', label: 'Phone' },
        status: { type: 'enum', label: 'Status', enum: ['Lead', 'Active', 'Churned'] },
      },
    },
    deals: {
      name: 'deals',
      label: 'Deals',
      fields: {
        title: { type: 'string', label: 'Deal Title', required: true },
        value: { type: 'number', label: 'Value ($)' },
        stage: {
          type: 'enum',
          label: 'Stage',
          enum: ['Prospect', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
        },
        contact: { type: 'string', label: 'Contact Name' },
      },
    },
  },
  views: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      type: 'dashboard',
      widgets: [
        { id: 'w1', type: 'stat', title: 'Total Contacts', model: 'contacts', color: 'purple', span: 1 },
        { id: 'w2', type: 'stat', title: 'Active Deals', model: 'deals', color: 'blue', span: 1 },
      ],
    },
    {
      id: 'contacts-view',
      label: 'Contacts',
      type: 'table',
      model: 'contacts',
      columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'company', label: 'Company' },
        { key: 'status', label: 'Status', type: 'badge' },
      ],
    },
    {
      id: 'deals-view',
      label: 'Deals',
      type: 'table',
      model: 'deals',
      columns: [
        { key: 'title', label: 'Title', sortable: true },
        { key: 'value', label: 'Value ($)', type: 'number', sortable: true },
        { key: 'stage', label: 'Stage', type: 'badge' },
        { key: 'contact', label: 'Contact' },
      ],
    },
  ],
  nav: [
    { label: 'Dashboard', icon: 'layout', view: 'dashboard' },
    { label: 'Contacts', icon: 'users', view: 'contacts-view' },
    { label: 'Deals', icon: 'briefcase', view: 'deals-view' },
  ],
}

const TASK_CONFIG = {
  name: 'Task Tracker',
  description: 'Project and task management (broken config test)',
  locale: 'es',
  models: {
    projects: {
      name: 'projects',
      label: 'Projects',
      fields: {
        name: { type: 'string', label: 'Project Name', required: true },
        description: { type: 'text', label: 'Description' },
        status: { type: 'enum', label: 'Status', enum: ['Planning', 'Active', 'On Hold', 'Done'] },
        dueDate: { type: 'date', label: 'Due Date' },
        // Intentionally invalid field type to test graceful degradation
        metadata: { type: 'UNKNOWN_TYPE', label: 'Metadata' },
      },
    },
    tasks: {
      name: 'tasks',
      label: 'Tasks',
      fields: {
        title: { type: 'string', label: 'Title', required: true },
        project: { type: 'string', label: 'Project' },
        priority: { type: 'enum', label: 'Priority', enum: ['Low', 'Medium', 'High', 'Critical'] },
        done: { type: 'boolean', label: 'Completed' },
        dueDate: { type: 'date', label: 'Due Date' },
      },
    },
  },
  views: [
    {
      id: 'projects-view',
      label: 'Projects',
      type: 'table',
      model: 'projects',
      columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'status', label: 'Status', type: 'badge' },
        { key: 'dueDate', label: 'Due Date', type: 'date' },
      ],
    },
    {
      id: 'tasks-view',
      label: 'Tasks',
      type: 'table',
      model: 'tasks',
      columns: [
        { key: 'title', label: 'Title', sortable: true },
        { key: 'priority', label: 'Priority', type: 'badge' },
        { key: 'done', label: 'Done', type: 'boolean' },
      ],
    },
    // Intentionally broken view — type unknown
    {
      id: 'broken-view',
      label: 'Broken View (Test)',
      type: 'INVALID_COMPONENT_TYPE',
      model: 'tasks',
    },
  ],
}

const INVENTORY_CONFIG = {
  name: 'Inventory Manager',
  description: 'Product and stock level tracking',
  locale: 'en',
  models: {
    products: {
      name: 'products',
      label: 'Products',
      fields: {
        name: { type: 'string', label: 'Product Name', required: true },
        sku: { type: 'string', label: 'SKU' },
        category: { type: 'string', label: 'Category' },
        price: { type: 'number', label: 'Price ($)' },
        stock: { type: 'number', label: 'Stock Qty' },
        supplier: { type: 'string', label: 'Supplier' },
        active: { type: 'boolean', label: 'Active' },
      },
    },
  },
  views: [
    {
      id: 'products-view',
      label: 'Products',
      type: 'table',
      model: 'products',
      columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'sku', label: 'SKU' },
        { key: 'category', label: 'Category', type: 'badge' },
        { key: 'price', label: 'Price ($)', type: 'number', sortable: true },
        { key: 'stock', label: 'Stock', type: 'number', sortable: true },
        { key: 'active', label: 'Active', type: 'boolean' },
      ],
    },
    {
      id: 'add-product',
      label: 'Add Product',
      type: 'form',
      model: 'products',
      fields: [
        { key: 'name', label: 'Product Name', type: 'text', required: true },
        { key: 'sku', label: 'SKU', type: 'text' },
        { key: 'category', label: 'Category', type: 'text' },
        { key: 'price', label: 'Price ($)', type: 'number' },
        { key: 'stock', label: 'Stock Qty', type: 'number' },
        { key: 'supplier', label: 'Supplier', type: 'text' },
        { key: 'active', label: 'Active', type: 'boolean', defaultValue: true },
      ],
    },
    {
      id: 'inv-dashboard',
      label: 'Overview',
      type: 'dashboard',
      widgets: [
        { id: 'w1', type: 'stat', title: 'Total Products', model: 'products', color: 'green', span: 1 },
        { id: 'w2', type: 'unknown_widget_type', title: 'Revenue Chart', color: 'amber', span: 2 },
      ],
    },
  ],
}

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const passwordHash = await bcrypt.hash('demo1234', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@appforge.dev' },
    update: {},
    create: {
      email: 'demo@appforge.dev',
      name: 'Demo User',
      passwordHash,
    },
  })

  console.log(`✓ Demo user: demo@appforge.dev / demo1234`)

  // Create demo session for easy testing
  const token = uuidv4()
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  // Seed apps
  const appsToSeed = [
    { config: CRM_CONFIG, slug: 'crm-demo' },
    { config: TASK_CONFIG, slug: 'task-tracker-demo' },
    { config: INVENTORY_CONFIG, slug: 'inventory-demo' },
  ]

  for (const { config, slug } of appsToSeed) {
    const existing = await prisma.app.findUnique({ where: { slug } })
    if (existing) {
      console.log(`  → Skipping "${config.name}" (already exists)`)
      continue
    }

    const models = config.models as Record<string, { fields: Record<string, unknown> }>

    const app = await prisma.app.create({
      data: {
        name: config.name,
        description: config.description,
        slug,
        locale: config.locale,
        config: config as object,
        userId: user.id,
        modelDefs: {
          create: Object.entries(models).map(([name, modelDef]) => ({
            name,
            schema: { fields: modelDef.fields } as object,
          })),
        },
      },
    })

    // Seed some records for CRM
    if (slug === 'crm-demo') {
      const contactsDef = await prisma.modelDef.findUnique({
        where: { appId_name: { appId: app.id, name: 'contacts' } },
      })
      const dealsDef = await prisma.modelDef.findUnique({
        where: { appId_name: { appId: app.id, name: 'deals' } },
      })

      if (contactsDef) {
        await prisma.record.createMany({
          data: [
            { appId: app.id, modelDefId: contactsDef.id, data: { name: 'Alice Johnson', email: 'alice@acme.com', company: 'Acme Corp', phone: '+1-555-0101', status: 'Active' } },
            { appId: app.id, modelDefId: contactsDef.id, data: { name: 'Bob Smith', email: 'bob@techco.io', company: 'TechCo', phone: '+1-555-0102', status: 'Lead' } },
            { appId: app.id, modelDefId: contactsDef.id, data: { name: 'Carol Davis', email: 'carol@startup.xyz', company: 'Startup XYZ', status: 'Active' } },
            { appId: app.id, modelDefId: contactsDef.id, data: { name: 'David Lee', email: 'david@enterprise.com', company: 'Enterprise Inc', status: 'Churned' } },
          ],
        })
      }

      if (dealsDef) {
        await prisma.record.createMany({
          data: [
            { appId: app.id, modelDefId: dealsDef.id, data: { title: 'Acme Corp Annual License', value: 48000, stage: 'Closed Won', contact: 'Alice Johnson' } },
            { appId: app.id, modelDefId: dealsDef.id, data: { title: 'TechCo Pilot', value: 12000, stage: 'Proposal', contact: 'Bob Smith' } },
            { appId: app.id, modelDefId: dealsDef.id, data: { title: 'Startup XYZ Expansion', value: 8500, stage: 'Negotiation', contact: 'Carol Davis' } },
          ],
        })
      }
    }

    // Seed inventory records
    if (slug === 'inventory-demo') {
      const productsDef = await prisma.modelDef.findUnique({
        where: { appId_name: { appId: app.id, name: 'products' } },
      })
      if (productsDef) {
        await prisma.record.createMany({
          data: [
            { appId: app.id, modelDefId: productsDef.id, data: { name: 'Wireless Keyboard', sku: 'KB-001', category: 'Electronics', price: 79.99, stock: 250, supplier: 'TechSupply Co', active: true } },
            { appId: app.id, modelDefId: productsDef.id, data: { name: 'USB-C Hub', sku: 'HUB-002', category: 'Electronics', price: 49.99, stock: 180, supplier: 'TechSupply Co', active: true } },
            { appId: app.id, modelDefId: productsDef.id, data: { name: 'Ergonomic Chair', sku: 'CH-001', category: 'Furniture', price: 459.00, stock: 42, supplier: 'OfficePlus', active: true } },
            { appId: app.id, modelDefId: productsDef.id, data: { name: 'Monitor Stand', sku: 'MS-003', category: 'Accessories', price: 34.99, stock: 0, supplier: 'DeskBrand', active: false } },
          ],
        })
      }
    }

    console.log(`  ✓ Created "${config.name}"`)
  }

  console.log('\n✅ Seed complete!')
  console.log('\n📋 Demo credentials:')
  console.log('   Email:    demo@appforge.dev')
  console.log('   Password: demo1234')
  console.log('\n🚀 Run: npm run dev')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
