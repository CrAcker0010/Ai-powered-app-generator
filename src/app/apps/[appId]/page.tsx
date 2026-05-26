'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'
import { Renderer } from '@/components/engine/Renderer'
import { CsvImportModal } from '@/components/app/CsvImportModal'
import { GithubExportModal } from '@/components/app/GithubExportModal'
import type { AppConfig, AppView } from '@/types/app'
import dynamic from 'next/dynamic'
import {
  Zap, ChevronLeft, Upload, GitBranch, Settings, Globe, Loader2,
  LayoutDashboard, Table2, FormInput, Menu, X
} from 'lucide-react'
import { SUPPORTED_LOCALES } from '@/lib/i18n'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface AppData {
  id: string
  name: string
  description: string | null
  slug: string
  locale: string
  config: AppConfig
  modelDefs: Array<{ id: string; name: string; schema: unknown }>
  _count: { records: number }
}

function ViewIcon({ type }: { type: string }) {
  switch (type?.toLowerCase()) {
    case 'table': return <Table2 size={15} />
    case 'form': return <FormInput size={15} />
    case 'dashboard': return <LayoutDashboard size={15} />
    default: return <LayoutDashboard size={15} />
  }
}

export default function AppPage() {
  const { appId } = useParams() as { appId: string }
  const router = useRouter()
  const toast = useToast()

  const [app, setApp] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [configText, setConfigText] = useState('')
  const [saving, setSaving] = useState(false)
  const [locale, setLocale] = useState('en')



  const fetchApp = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/apps/${appId}`)
      if (!res.ok) throw new Error('App not found')
      const { data } = await res.json()
      setApp(data)
      setLocale(data.locale ?? 'en')
      setConfigText(JSON.stringify(data.config, null, 2))
      // Set first view as active
      const views = data.config?.views as AppView[] | undefined
      if (views?.length) setActiveViewId(views[0].id)
    } catch {
      toast('App not found', 'error')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }, [appId, router, toast])

  useEffect(() => {
    fetchApp()
  }, [fetchApp])

  const handleSaveConfig = async () => {
    let config: AppConfig
    try {
      config = JSON.parse(configText)
    } catch {
      toast('Invalid JSON configuration', 'error')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/apps/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, locale }),
      })
      if (!res.ok) throw new Error()
      toast('Configuration saved!', 'success')
      setShowSettings(false)
      fetchApp()
    } catch {
      toast('Failed to save configuration', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-purple)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Loading app...</p>
        </div>
      </div>
    )
  }

  if (!app) return null

  const views = (app.config?.views ?? []) as AppView[]
  const activeView = views.find((v) => v.id === activeViewId)
  const navItems = (app.config?.nav ?? views.map((v) => ({ label: v.label, view: v.id })))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        borderBottom: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--surface) 95%, transparent)',
        backdropFilter: 'blur(12px)',
        height: '56px',
        display: 'flex', alignItems: 'center',
        padding: '0 1rem',
        gap: '1rem',
      }}>
        <Link href="/dashboard" className="btn btn-ghost" style={{ height: '32px', padding: '0 0.5rem', gap: '0.375rem', fontSize: '0.8125rem' }}>
          <ChevronLeft size={14} />
          <span style={{ color: 'var(--text-muted)' }}>Dashboard</span>
        </Link>
        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flex: 1, minWidth: 0 }}>
          <Zap size={14} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.name}
          </span>
          {app.description && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              · {app.description}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
          <button className="btn btn-ghost" onClick={() => setShowImport(true)} style={{ height: '32px', padding: '0 0.625rem', fontSize: '0.8125rem', gap: '0.375rem' }}>
            <Upload size={13} /> CSV
          </button>
          <button className="btn btn-ghost" onClick={() => setShowExport(true)} style={{ height: '32px', padding: '0 0.625rem', fontSize: '0.8125rem', gap: '0.375rem' }}>
            <GitBranch size={13} /> Export
          </button>
          <button className="btn btn-secondary" onClick={() => setShowSettings(true)} style={{ height: '32px', padding: '0 0.625rem', fontSize: '0.8125rem', gap: '0.375rem' }}>
            <Settings size={13} /> Config
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => setSidebarOpen((v) => !v)}
            style={{ height: '32px', padding: '0 0.5rem' }}
            title="Toggle sidebar"
          >
            {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside style={{
            width: '220px',
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: '1rem 0.75rem',
            overflowY: 'auto',
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', padding: '0 0.25rem', marginBottom: '0.5rem' }}>
                Views
              </p>
              {navItems.map((nav: { label: string; view: string; icon?: string }) => {
                const view = views.find((v) => v.id === nav.view)
                return (
                  <button
                    key={nav.view}
                    onClick={() => setActiveViewId(nav.view)}
                    className={`nav-item ${activeViewId === nav.view ? 'active' : ''}`}
                    style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <ViewIcon type={view?.type ?? 'dashboard'} />
                    {nav.label}
                  </button>
                )
              })}

              {views.length === 0 && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '0.5rem 0.25rem' }}>
                  No views. Open Config to add views.
                </p>
              )}
            </div>

            {/* Locale display */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Globe size={12} />
                {SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES] ?? locale}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {app._count.records} records
              </div>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {activeView ? (
            <Renderer
              view={activeView}
              config={app.config}
              appId={appId}
              locale={locale}
            />
          ) : (
            <div style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--text-secondary)' }}>
              <LayoutDashboard size={32} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ fontWeight: 600 }}>No view selected</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {views.length ? 'Select a view from the sidebar.' : 'Open Config to add views to your app.'}
              </p>
              {!views.length && (
                <button className="btn btn-primary" onClick={() => setShowSettings(true)} style={{ marginTop: '1.25rem' }}>
                  <Settings size={14} /> Open Config
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Settings / Config Editor Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{ maxWidth: '900px', padding: '1.5rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontWeight: 700 }}>Edit Configuration</h2>
              <button className="btn btn-ghost" style={{ height: '28px', width: '28px', padding: 0, justifyContent: 'center' }} onClick={() => setShowSettings(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Locale selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Globe size={14} style={{ color: 'var(--text-muted)' }} />
              <label className="label" style={{ marginBottom: 0 }}>App Locale:</label>
              <select
                className="input"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                style={{ width: 'auto', height: '32px', fontSize: '0.8125rem' }}
              >
                {Object.entries(SUPPORTED_LOCALES).map(([code, label]) => (
                  <option key={code} value={code}>{label} ({code})</option>
                ))}
              </select>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
              <MonacoEditor
                height="480px"
                language="json"
                value={configText}
                onChange={(v) => setConfigText(v ?? '')}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowSettings(false)} style={{ height: '40px' }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveConfig} disabled={saving} style={{ flex: 1, height: '40px' }}>
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : '💾 Save Configuration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImport && (
        <CsvImportModal
          appId={appId}
          modelNames={app.modelDefs.map((m) => m.name)}
          onClose={() => setShowImport(false)}
          onImported={() => { setShowImport(false); fetchApp() }}
        />
      )}

      {/* GitHub Export Modal */}
      {showExport && (
        <GithubExportModal
          appId={appId}
          appName={app.name}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
