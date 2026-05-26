'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/contexts/ToastContext'
import {
  Plus, Zap, LayoutDashboard, Trash2, ExternalLink,
  Database, Clock, Search, Loader2, Sparkles
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface AppSummary {
  id: string
  name: string
  description: string | null
  slug: string
  locale: string
  updatedAt: string
  createdAt: string
  _count: { records: number; modelDefs: number }
}

export default function DashboardPage() {
  const router = useRouter()
  const toast = useToast()
  const [apps, setApps] = useState<AppSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [wordIndex, setWordIndex] = useState(0)

  const [showJsonModal, setShowJsonModal] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [jsonLoading, setJsonLoading] = useState(false)
  const [jsonError, setJsonError] = useState('')

  const animatedWords = ['a JSON', 'a text', 'an idea', 'an inspiration']

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % animatedWords.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const fetchApps = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/apps')
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      setApps(data ?? [])
    } catch {
      toast('Failed to load apps', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/apps/${id}`, { method: 'DELETE' })
      toast('App deleted', 'success')
      setDeleteConfirm(null)
      fetchApps()
    } catch {
      toast('Failed to delete app', 'error')
    }
  }

  const handleJsonImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setJsonError('')
    setJsonLoading(true)

    try {
      let configObj
      try {
        configObj = JSON.parse(jsonInput)
      } catch (err) {
        throw new Error('Invalid JSON format. Please verify configuration syntax.')
      }

      const appName = configObj.name || 'Imported App'
      const appDesc = configObj.description || 'App generated directly from pasted JSON configuration.'
      const appLocale = configObj.locale || 'en'

      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: appName,
          description: appDesc,
          locale: appLocale,
          config: configObj
        })
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error ?? 'Failed to import application.')
      }

      toast(`"${appName}" successfully provisioned and deployed!`, 'success')
      setShowJsonModal(false)
      setJsonInput('')
      fetchApps() // refresh dashboard list
      router.push(`/apps/${result.data.id}`)
    } catch (err: any) {
      setJsonError(err.message || 'An error occurred during import.')
    } finally {
      setJsonLoading(false)
    }
  }

  const filteredApps = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )



  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        borderBottom: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--surface) 95%, transparent)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="white" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.125rem' }} className="gradient-text">AppForge</span>
            </Link>
            <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <LayoutDashboard size={15} />
              Dashboard
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                G
              </div>
              <span style={{ color: 'var(--text-secondary)' }}>Guest</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '2rem 1.5rem' }}>
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Your Apps</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {apps.length} app{apps.length !== 1 ? 's' : ''} · Build anything from JSON
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              id="import-json-btn"
              className="btn btn-secondary"
              onClick={() => setShowJsonModal(true)}
              style={{ height: '40px', fontWeight: 600 }}
            >
              Import JSON
            </button>
            <button
              id="create-app-btn"
              className="btn"
              onClick={() => router.push('/builder')}
              style={{
                height: '40px',
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                color: 'var(--bg)',
                border: 'none',
                fontWeight: 600,
                boxShadow: '0 2px 12px var(--shadow-color)',
              }}
            >
              <Sparkles size={15} />
              Generate App
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-stats" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total Apps', value: apps.length, color: 'var(--accent-purple)', icon: <Zap size={16} /> },
            { label: 'Total Records', value: apps.reduce((s, a) => s + a._count.records, 0), color: 'var(--accent-blue)', icon: <Database size={16} /> },
            { label: 'Models Defined', value: apps.reduce((s, a) => s + a._count.modelDefs, 0), color: 'var(--accent-green)', icon: <LayoutDashboard size={16} /> },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.625rem', borderRadius: '8px', background: `${stat.color}20`, color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '360px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            id="app-search"
            className="input"
            placeholder="Search apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        {/* Apps grid */}
        {loading ? (
          <div className="grid-apps">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem' }}>
                <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '0.75rem' }} />
                <div className="skeleton" style={{ height: '14px', width: '90%', marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ height: '14px', width: '70%' }} />
              </div>
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px' }}>
            {search ? (
              <>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
                <p style={{ fontWeight: 600 }}>No apps match &quot;{search}&quot;</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Try a different search term</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚡</div>
                <p style={{ fontWeight: 600, marginBottom: '0.375rem' }}>No apps yet</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.375rem' }}>
                  Create your first app from
                  <span key={wordIndex} className="animate-fade-in" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>
                    {animatedWords[wordIndex]}
                  </span>
                </p>
                <button className="btn btn-primary" onClick={() => router.push('/builder')}>
                  <Plus size={15} /> Create First App
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid-apps">
            {filteredApps.map((app) => (
              <div key={app.id} className="card card-interactive" style={{ padding: '1.5rem', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.name}
                    </h3>
                    {app.description && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {app.description}
                      </p>
                    )}
                  </div>
                  <span className="badge badge-purple" style={{ marginLeft: '0.5rem', flexShrink: 0 }}>
                    {app.locale}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Database size={12} />
                    {app._count.records} records
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <LayoutDashboard size={12} />
                    {app._count.modelDefs} models
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <Clock size={11} />
                  Updated {formatDateTime(app.updatedAt)}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    href={`/apps/${app.id}`}
                    className="btn btn-primary"
                    style={{ flex: 1, height: '36px', fontSize: '0.8125rem', justifyContent: 'center' }}
                  >
                    <ExternalLink size={13} />
                    Open App
                  </Link>
                  {deleteConfirm === app.id ? (
                    <>
                      <button className="btn btn-danger" style={{ height: '36px', fontSize: '0.8125rem' }} onClick={() => handleDelete(app.id)}>
                        Confirm Delete
                      </button>
                      <button className="btn btn-ghost" style={{ height: '36px', padding: '0 0.5rem' }} onClick={() => setDeleteConfirm(null)}>✕</button>
                    </>
                  ) : (
                    <button
                      className="btn btn-ghost"
                      style={{ height: '36px', padding: '0 0.625rem', color: 'var(--accent-red)' }}
                      onClick={() => setDeleteConfirm(app.id)}
                      title="Delete app"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Import JSON Modal */}
      {showJsonModal && (
        <div className="modal-overlay" onClick={() => !jsonLoading && setShowJsonModal(false)}>
          <div 
            className="modal-content glass-strong" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '600px', 
              padding: '2rem',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8), 0 0 80px rgba(99, 102, 241, 0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>Import App Configuration</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                  Paste a raw AppConfig JSON block to instantly generate database tables, schemas, and views.
                </p>
              </div>
              <button 
                className="btn btn-ghost" 
                onClick={() => !jsonLoading && setShowJsonModal(false)}
                style={{ padding: '0.25rem', borderRadius: '50%', minWidth: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                disabled={jsonLoading}
              >
                ✕
              </button>
            </div>

            {jsonError && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: '8px', marginBottom: '1.25rem', color: 'var(--accent-red)', fontSize: '0.85rem' }}>
                ⚠️ {jsonError}
              </div>
            )}

            <form onSubmit={handleJsonImport}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label" htmlFor="json-config-textarea">JSON Configuration Code</label>
                <textarea
                  id="json-config-textarea"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`{\n  "name": "My Custom App",\n  "description": "App description...",\n  "locale": "en",\n  "theme": { "primaryColor": "#6366f1", "mode": "dark" },\n  "models": {\n    "leads": {\n      "name": "leads",\n      "label": "Leads",\n      "fields": {\n        "company": { "type": "string", "label": "Company Name", "required": true }\n      }\n    }\n  },\n  "views": [],\n  "nav": []\n}`}
                  disabled={jsonLoading}
                  required
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: 'var(--surface-raised)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    lineHeight: '1.5',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={() => setShowJsonModal(false)}
                  disabled={jsonLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={jsonLoading || !jsonInput.trim()}
                  style={{ minWidth: '120px', justifyContent: 'center' }}
                >
                  {jsonLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Provisioning...
                    </>
                  ) : (
                    'Provision App'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
