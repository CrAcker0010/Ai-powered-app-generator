// ============================================================
// App Configuration Types
// The JSON structure that describes an entire application
// ============================================================

export type ComponentType =
  | 'table'
  | 'form'
  | 'dashboard'
  | 'card'
  | 'chart'
  | 'kanban'
  | 'calendar'
  | 'list'
  | 'stats'
  | string // Allow unknown types — handled via Error Boundary

export interface AppTheme {
  primaryColor?: string
  accentColor?: string
  fontFamily?: string
  mode?: 'light' | 'dark' | 'system'
}

export interface AppNavItem {
  label: string
  icon?: string
  view: string
}

export interface AppView {
  id: string
  label: string
  type: ComponentType
  model?: string
  columns?: ColumnDef[]
  fields?: FormFieldDef[]
  widgets?: DashboardWidget[]
  filters?: FilterDef[]
  actions?: ActionDef[]
  [key: string]: unknown // Allow extra unknown properties
}

export interface ColumnDef {
  key: string
  label: string
  type?: 'string' | 'number' | 'boolean' | 'date' | 'badge' | 'email' | 'url' | string
  sortable?: boolean
  filterable?: boolean
  width?: string
}

export interface FormFieldDef {
  key: string
  label: string
  type?: 'text' | 'email' | 'number' | 'boolean' | 'select' | 'textarea' | 'date' | string
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  defaultValue?: unknown
  [key: string]: unknown
}

export interface DashboardWidget {
  id: string
  type: 'stat' | 'chart' | 'table' | 'list' | string
  title: string
  model?: string
  metric?: string
  color?: string
  span?: 1 | 2 | 3 | 4
}

export interface FilterDef {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'boolean'
  options?: Array<{ value: string; label: string }>
}

export interface ActionDef {
  id: string
  label: string
  type: 'create' | 'delete' | 'edit' | 'custom'
  icon?: string
  variant?: 'primary' | 'danger' | 'secondary'
}

export interface AppModel {
  name: string
  label: string
  fields: Record<string, FieldDef>
}

export interface FieldDef {
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'date' | 'enum' | 'text' | string
  label?: string
  required?: boolean
  enum?: string[]
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  [key: string]: unknown
}

export interface AppConfig {
  id?: string
  name: string
  description?: string
  version?: string
  locale?: string
  theme?: AppTheme
  nav?: AppNavItem[]
  models?: Record<string, AppModel>
  views?: AppView[]
  [key: string]: unknown // Tolerate extra unknown keys
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  errors?: Record<string, string>
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================================
// Auth Types
// ============================================================

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  githubToken?: string | null
}
