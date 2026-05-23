'use client'

import React, { useEffect, useState } from 'react'
import { TrendingUp, Database, AlertTriangle } from 'lucide-react'
import type { AppView, AppConfig, DashboardWidget } from '@/types/app'
import { t } from '@/lib/i18n'

interface DynamicDashboardProps {
  view: AppView
  config: AppConfig
  appId: string
  locale?: string
}

interface StatWidgetProps {
  widget: DashboardWidget
  appId: string
}

function StatWidget({ widget, appId }: StatWidgetProps) {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!widget.model) {
      setLoading(false)
      return
    }
    fetch(`/api/apps/${appId}/data/${widget.model}?pageSize=1`)
      .then((r) => r.json())
      .then((d) => setCount(d.total ?? 0))
      .catch(() => setCount(0))
      .finally(() => setLoading(false))
  }, [appId, widget.model])

  const colors: Record<string, string> = {
    purple: 'var(--accent-purple)',
    blue: 'var(--accent-blue)',
    green: 'var(--accent-green)',
    amber: 'var(--accent-amber)',
    red: 'var(--accent-red)',
    cyan: 'var(--accent-cyan)',
  }

  const color = colors[widget.color ?? 'purple'] ?? 'var(--accent-purple)'

  return (
    <div
      className="card"
      style={{
        padding: '1.25rem',
        gridColumn: `span ${Math.min(widget.span ?? 1, 4)}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            {widget.title}
          </p>
          {loading ? (
            <div className="skeleton" style={{ height: '2rem', width: '5rem' }} />
          ) : (
            <p style={{ fontSize: '2rem', fontWeight: 800, color }}>
              {count?.toLocaleString() ?? '—'}
            </p>
          )}
          {widget.metric && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {widget.metric}
            </p>
          )}
        </div>
        <div style={{ padding: '0.625rem', borderRadius: '8px', background: `${color}20` }}>
          {widget.type === 'stat' ? (
            <TrendingUp size={18} style={{ color }} />
          ) : (
            <Database size={18} style={{ color }} />
          )}
        </div>
      </div>
    </div>
  )
}

export function DynamicDashboard({ view, config, appId, locale = 'en' }: DynamicDashboardProps) {
  const widgets: DashboardWidget[] = view.widgets ?? []

  if (widgets.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <AlertTriangle size={20} style={{ margin: '0 auto 0.5rem' }} />
        <p>No widgets configured for this dashboard.</p>
        <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>Add widgets to your app configuration.</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{view.label}</h2>
        {!!view.description && (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {String(view.description)}
          </p>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
        }}
      >
        {widgets.map((widget) => {
          // Gracefully handle unknown widget types
          const type = widget.type?.toLowerCase?.() ?? ''
          if (['stat', 'count', 'metric'].includes(type)) {
            return <StatWidget key={widget.id} widget={{ ...widget, type: 'stat' }} appId={appId} />
          }
          // Fallback for unknown widget types
          return (
            <div
              key={widget.id}
              className="card"
              style={{
                padding: '1.25rem',
                gridColumn: `span ${Math.min(widget.span ?? 1, 4)}`,
                border: '1px dashed rgba(255,169,64,0.3)',
                background: 'rgba(255,169,64,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)' }}>
                <AlertTriangle size={14} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                  Unknown widget: &quot;{widget.type}&quot;
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{widget.title}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
