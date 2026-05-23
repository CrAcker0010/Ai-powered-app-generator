'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Edit2, Search, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react'
import type { AppView, AppConfig, ColumnDef } from '@/types/app'
import { formatDate, formatDateTime } from '@/lib/utils'
import { t } from '@/lib/i18n'
import { useToast } from '@/contexts/ToastContext'
import { DynamicForm } from './DynamicForm'

interface DynamicTableProps {
  view: AppView
  config: AppConfig
  appId: string
  locale?: string
}

interface RecordRow {
  id: string
  data: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

interface PaginatedResult {
  data: RecordRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

function CellValue({ value, type }: { value: unknown; type?: string }) {
  if (value === null || value === undefined) {
    return <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>
  }

  const str = String(value)

  switch (type) {
    case 'boolean':
      return (
        <span className={`badge ${value ? 'badge-green' : 'badge-red'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    case 'badge':
      return <span className="badge badge-purple">{str}</span>
    case 'email':
      return (
        <a href={`mailto:${str}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
          {str}
        </a>
      )
    case 'url':
      return (
        <a href={str} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
          {str}
        </a>
      )
    case 'date':
      try { return <span>{formatDate(str)}</span> }
      catch { return <span>{str}</span> }
    default:
      if (typeof value === 'boolean') {
        return <span className={`badge ${value ? 'badge-green' : 'badge-red'}`}>{value ? 'Yes' : 'No'}</span>
      }
      return <span>{str.length > 60 ? str.slice(0, 60) + '…' : str}</span>
  }
}

export function DynamicTable({ view, config, appId, locale = 'en' }: DynamicTableProps) {
  const toast = useToast()
  const [result, setResult] = useState<PaginatedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editRecord, setEditRecord] = useState<RecordRow | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const modelName = view.model

  // Graceful: no model name configured
  if (!modelName) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <AlertTriangle size={20} style={{ margin: '0 auto 0.5rem' }} />
        <p>No model configured for this table view.</p>
      </div>
    )
  }

  // Derive columns from view config, or auto-generate from first record
  const columns: ColumnDef[] = view.columns ?? []

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({ page: String(page), pageSize: '20' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/apps/${appId}/data/${modelName}?${params}`)
      if (!res.ok) throw new Error('Failed to fetch records')
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [appId, modelName, page, search])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/apps/${appId}/data/${modelName}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast(t(locale, 'success'), 'success')
      setDeleteConfirm(null)
      fetchRecords()
    } catch {
      toast('Failed to delete record', 'error')
    }
  }

  // Auto-derive columns from data if none defined
  const effectiveColumns: ColumnDef[] = columns.length > 0
    ? columns
    : result?.data?.[0]
      ? Object.keys(result.data[0].data).map((key) => ({ key, label: key, type: 'string' }))
      : []

  // Client-side sort
  const sortedData = result?.data ? [...result.data].sort((a, b) => {
    if (!sortKey) return 0
    const av = a.data[sortKey] as any
    const bv = b.data[sortKey] as any
    if (av === bv) return 0
    const cmp = av < bv ? -1 : 1
    return sortDir === 'asc' ? cmp : -cmp
  }) : []

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{view.label}</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
            {result?.total ?? 0} records
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              id={`search-${view.id}`}
              className="input"
              placeholder={t(locale, 'search')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              style={{ paddingLeft: '2rem', width: '200px', height: '36px', fontSize: '0.8125rem' }}
            />
          </div>
          <button className="btn btn-secondary" onClick={fetchRecords} style={{ height: '36px', padding: '0 0.625rem' }} title="Refresh">
            <RefreshCw size={14} />
          </button>
          <button className="btn btn-primary" onClick={() => { setEditRecord(null); setShowForm(true) }} style={{ height: '36px' }}>
            <Plus size={14} />
            {t(locale, 'add')}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="table-wrapper">
          <table>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {(effectiveColumns.length > 0 ? effectiveColumns : [{ key: 'a' }, { key: 'b' }, { key: 'c' }]).map((col) => (
                    <td key={col.key}>
                      <div className="skeleton" style={{ height: '16px', width: `${60 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                  <td><div className="skeleton" style={{ height: '16px', width: '80px' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-red)' }}>
          <AlertTriangle size={20} style={{ margin: '0 auto 0.5rem' }} />
          <p style={{ fontSize: '0.875rem' }}>{error}</p>
          <button className="btn btn-secondary" onClick={fetchRecords} style={{ marginTop: '1rem', fontSize: '0.8125rem' }}>
            Retry
          </button>
        </div>
      ) : !result?.data?.length ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '10px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
          <p style={{ fontWeight: 500 }}>{t(locale, 'noData')}</p>
          <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>Add your first record to get started.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {effectiveColumns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => {
                      if (col.sortable !== false) {
                        if (sortKey === col.key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
                        else { setSortKey(col.key); setSortDir('asc') }
                      }
                    }}
                    style={{ cursor: col.sortable !== false ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span style={{ marginLeft: '4px' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
                <th style={{ width: '80px' }}>{t(locale, 'actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => (
                <tr key={row.id}>
                  {effectiveColumns.map((col) => (
                    <td key={col.key}>
                      <CellValue value={row.data[col.key]} type={col.type} />
                    </td>
                  ))}
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '0.25rem', height: '28px', width: '28px', justifyContent: 'center' }}
                        onClick={() => { setEditRecord(row); setShowForm(true) }}
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
                      {deleteConfirm === row.id ? (
                        <>
                          <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', height: '28px', fontSize: '0.75rem' }} onClick={() => handleDelete(row.id)}>
                            Confirm
                          </button>
                          <button className="btn btn-ghost" style={{ padding: '0.25rem', height: '28px', fontSize: '0.75rem' }} onClick={() => setDeleteConfirm(null)}>
                            ✕
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '0.25rem', height: '28px', width: '28px', justifyContent: 'center', color: 'var(--accent-red)' }}
                          onClick={() => setDeleteConfirm(row.id)}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {result && result.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Page {result.page} of {result.totalPages} · {result.total} records
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              style={{ height: '32px', padding: '0 0.75rem', fontSize: '0.8125rem' }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={result.page <= 1}
            >
              <ChevronLeft size={14} />
              Prev
            </button>
            <button
              className="btn btn-secondary"
              style={{ height: '32px', padding: '0 0.75rem', fontSize: '0.8125rem' }}
              onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
              disabled={result.page >= result.totalPages}
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="modal-content" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 700 }}>{editRecord ? t(locale, 'editApp') : t(locale, 'add')} Record</h3>
              <button className="btn btn-ghost" style={{ padding: '0.25rem', height: '28px', width: '28px', justifyContent: 'center' }} onClick={() => setShowForm(false)}>✕</button>
            </div>
            <DynamicForm
              view={{
                ...view,
                type: 'form',
                fields: view.fields ?? effectiveColumns.map((col) => ({
                  key: col.key,
                  label: col.label,
                  type: col.type === 'badge' ? 'text' : (col.type ?? 'text'),
                })),
              }}
              config={config}
              appId={appId}
              locale={locale}
              initialData={editRecord?.data}
              recordId={editRecord?.id}
              onSuccess={() => {
                setShowForm(false)
                setEditRecord(null)
                fetchRecords()
                toast(editRecord ? 'Record updated' : 'Record created', 'success')
              }}
              inline
            />
          </div>
        </div>
      )}
    </div>
  )
}
