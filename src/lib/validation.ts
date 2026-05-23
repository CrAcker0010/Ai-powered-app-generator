import { z, ZodTypeAny } from 'zod'

// JSON Schema field types supported by the dynamic validator
export type FieldType = 'string' | 'number' | 'boolean' | 'email' | 'url' | 'date' | 'enum' | 'text'

export interface FieldSchema {
  type: FieldType
  label?: string
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  enum?: string[]
  default?: unknown
}

export interface ModelSchema {
  fields: Record<string, FieldSchema>
}

/**
 * Builds a Zod schema from a ModelDef JSON schema definition.
 * Gracefully handles unknown field types by falling back to z.unknown().
 */
export function buildZodSchema(modelSchema: unknown): z.ZodObject<Record<string, ZodTypeAny>> {
  // Gracefully handle completely broken schema
  if (!modelSchema || typeof modelSchema !== 'object') {
    return z.object({})
  }

  const schema = modelSchema as Record<string, unknown>
  const fields = (schema.fields ?? schema) as Record<string, unknown>

  if (!fields || typeof fields !== 'object') {
    return z.object({})
  }

  const shape: Record<string, ZodTypeAny> = {}

  for (const [key, rawField] of Object.entries(fields)) {
    try {
      shape[key] = buildFieldSchema(rawField)
    } catch {
      // Unknown or broken field — fall back to z.unknown()
      shape[key] = z.unknown().optional()
    }
  }

  return z.object(shape)
}

function buildFieldSchema(rawField: unknown): ZodTypeAny {
  if (!rawField || typeof rawField !== 'object') {
    return z.unknown().optional()
  }

  const field = rawField as FieldSchema
  let schema: ZodTypeAny

  switch (field.type) {
    case 'string':
    case 'text': {
      let s = z.string()
      if (field.minLength !== undefined) s = s.min(field.minLength)
      if (field.maxLength !== undefined) s = s.max(field.maxLength)
      if (field.pattern) s = s.regex(new RegExp(field.pattern))
      schema = s
      break
    }
    case 'email':
      schema = z.string().email()
      break
    case 'url':
      schema = z.string().url()
      break
    case 'number': {
      let n = z.number()
      if (field.min !== undefined) n = n.min(field.min)
      if (field.max !== undefined) n = n.max(field.max)
      schema = n
      break
    }
    case 'boolean':
      schema = z.boolean()
      break
    case 'date':
      schema = z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
      break
    case 'enum':
      if (field.enum && field.enum.length > 0) {
        schema = z.enum(field.enum as [string, ...string[]])
      } else {
        schema = z.string()
      }
      break
    default:
      // Unknown type — accept anything
      schema = z.unknown()
      break
  }

  if (!field.required) {
    schema = schema.optional()
  }

  return schema
}

/**
 * Validates data against a model schema.
 * Returns { success, data, errors } — never throws.
 */
export function validateRecord(
  modelSchema: unknown,
  data: unknown
): { success: boolean; data: Record<string, unknown>; errors: Record<string, string> } {
  try {
    const zodSchema = buildZodSchema(modelSchema)
    const result = zodSchema.safeParse(data)

    if (result.success) {
      return { success: true, data: result.data as Record<string, unknown>, errors: {} }
    }

    const errors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      errors[path || 'root'] = issue.message
    }

    return { success: false, data: data as Record<string, unknown>, errors }
  } catch {
    // Completely broken schema — accept data as-is
    return { success: true, data: data as Record<string, unknown>, errors: {} }
  }
}
