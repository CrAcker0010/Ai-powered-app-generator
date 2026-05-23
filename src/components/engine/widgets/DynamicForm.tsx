'use client'

import React, { useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import type { AppView, AppConfig, FormFieldDef } from '@/types/app'
import { t } from '@/lib/i18n'
import { useToast } from '@/contexts/ToastContext'

interface DynamicFormProps {
  view: AppView
  config: AppConfig
  appId: string
  locale?: string
  initialData?: Record<string, unknown>
  recordId?: string
  onSuccess?: (data: Record<string, unknown>) => void
  inline?: boolean
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FormFieldDef
  value: unknown
  onChange: (val: unknown) => void
}) {
  const type = field.type?.toLowerCase?.() ?? 'text'

  // Graceful: unknown field type defaults to text input
  const inputType = {
    text: 'text',
    string: 'text',
    email: 'email',
    url: 'url',
    number: 'number',
    date: 'date',
    boolean: 'checkbox',
    select: 'select',
    textarea: 'textarea',
  }[type] ?? 'text'

  const commonStyle = { width: '100%' }

  if (inputType === 'checkbox') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          id={`field-${field.key}`}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: '16px', height: '16px', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
        />
        <label htmlFor={`field-${field.key}`} style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
          {field.label}
        </label>
      </div>
    )
  }

  if (inputType === 'textarea') {
    return (
      <textarea
        id={`field-${field.key}`}
        className="input"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? `Enter ${field.label ?? field.key}...`}
        rows={3}
        style={{ ...commonStyle, resize: 'vertical', fontFamily: 'inherit' }}
      />
    )
  }

  if (inputType === 'select' && field.options) {
    return (
      <select
        id={`field-${field.key}`}
        className="input"
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...commonStyle, cursor: 'pointer' }}
      >
        <option value="">Select {field.label ?? field.key}...</option>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    )
  }

  return (
    <input
      id={`field-${field.key}`}
      className="input"
      type={inputType}
      value={String(value ?? '')}
      onChange={(e) =>
        onChange(
          inputType === 'number'
            ? e.target.value === '' ? '' : Number(e.target.value)
            : e.target.value
        )
      }
      placeholder={field.placeholder ?? `Enter ${field.label ?? field.key}...`}
      style={commonStyle}
    />
  )
}

export function DynamicForm({
  view,
  config,
  appId,
  locale = 'en',
  initialData,
  recordId,
  onSuccess,
  inline = false,
}: DynamicFormProps) {
  const toast = useToast()
  const fields: FormFieldDef[] = view.fields ?? []

  // Graceful: no fields configured
  if (fields.length === 0 && !view.model) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <AlertTriangle size={20} style={{ margin: '0 auto 0.5rem' }} />
        <p>No fields configured for this form.</p>
      </div>
    )
  }

  const defaultValues: Record<string, unknown> = {}
  fields.forEach((f) => {
    defaultValues[f.key] = initialData?.[f.key] ?? f.defaultValue ?? (f.type === 'boolean' ? false : '')
  })

  const [formData, setFormData] = useState<Record<string, unknown>>(defaultValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const modelName = view.model

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side required validation
    const newErrors: Record<string, string> = {}
    fields.forEach((f) => {
      if (f.required && (formData[f.key] === '' || formData[f.key] === null || formData[f.key] === undefined)) {
        newErrors[f.key] = `${f.label ?? f.key} is required`
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    setErrors({})

    try {
      const url = recordId
        ? `/api/apps/${appId}/data/${modelName}/${recordId}`
        : `/api/apps/${appId}/data/${modelName}`
      const method = recordId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) setErrors(data.errors)
        else toast(data.error ?? 'Submission failed', 'error')
        return
      }

      if (data.warnings && Object.keys(data.warnings).length > 0) {
        toast('Saved with warnings: some fields may not match the schema', 'info')
      } else {
        toast(recordId ? 'Record updated' : 'Record created', 'success')
      }

      setSubmitted(true)
      if (!recordId) {
        setFormData(defaultValues) // Reset on create
      }
      onSuccess?.(data.data)
    } catch {
      toast('Network error. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const containerStyle = inline
    ? {}
    : {
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1.5rem',
      }

  return (
    <div style={containerStyle}>
      {!inline && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{view.label}</h2>
          {!!view.description && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {String(view.description)}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {fields.map((field) => {
            const type = field.type?.toLowerCase?.() ?? 'text'
            const isCheckbox = type === 'boolean'

            return (
              <div key={field.key}>
                {!isCheckbox && (
                  <label className="label" htmlFor={`field-${field.key}`}>
                    {field.label ?? field.key}
                    {field.required && <span style={{ color: 'var(--accent-red)', marginLeft: '2px' }}>*</span>}
                  </label>
                )}
                <FieldInput
                  field={field}
                  value={formData[field.key]}
                  onChange={(val) => {
                    setFormData((prev) => ({ ...prev, [field.key]: val }))
                    if (errors[field.key]) setErrors((prev) => { const n = { ...prev }; delete n[field.key]; return n })
                  }}
                />
                {errors[field.key] && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--accent-red)', marginTop: '0.25rem' }}>
                    {errors[field.key]}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
          <button
            id="form-submit-btn"
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ flex: 1 }}
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {t(locale, 'loading')}
              </>
            ) : (
              recordId ? t(locale, 'save') : t(locale, 'add')
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
