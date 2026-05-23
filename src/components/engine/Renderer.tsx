'use client'

import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { AlertTriangle } from 'lucide-react'
import type { AppView, AppConfig } from '@/types/app'
import { DynamicTable } from './widgets/DynamicTable'
import { DynamicForm } from './widgets/DynamicForm'
import { DynamicDashboard } from './widgets/DynamicDashboard'

interface RendererProps {
  view: AppView
  config: AppConfig
  appId: string
  locale?: string
}

function UnknownComponentFallback({ componentType }: { componentType: string }) {
  return (
    <div
      style={{
        padding: '2rem',
        border: '1px dashed rgba(255,169,64,0.4)',
        borderRadius: '10px',
        background: 'rgba(255,169,64,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        color: 'var(--accent-amber)',
      }}
    >
      <AlertTriangle size={18} />
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Unknown component: &quot;{componentType}&quot;</div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          This component type is not recognized. Please update your app configuration.
        </div>
      </div>
    </div>
  )
}

function ErrorFallback({ error, resetErrorBoundary }: { error: any; resetErrorBoundary: () => void }) {
  return (
    <div
      style={{
        padding: '2rem',
        border: '1px solid rgba(255, 77, 109, 0.3)',
        borderRadius: '10px',
        background: 'rgba(255, 77, 109, 0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-red)', marginBottom: '0.75rem' }}>
        <AlertTriangle size={18} />
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Rendering Error</span>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {error.message || 'An unexpected error occurred while rendering this view.'}
      </p>
      <button className="btn btn-secondary" onClick={resetErrorBoundary} style={{ fontSize: '0.8125rem' }}>
        Try Again
      </button>
    </div>
  )
}

function ViewRenderer({ view, config, appId, locale }: RendererProps) {
  const type = view?.type?.toLowerCase?.() ?? ''

  if (!view) {
    return <UnknownComponentFallback componentType="undefined" />
  }

  switch (type) {
    case 'table':
      return (
        <DynamicTable
          view={view}
          config={config}
          appId={appId}
          locale={locale}
        />
      )
    case 'form':
      return (
        <DynamicForm
          view={view}
          config={config}
          appId={appId}
          locale={locale}
        />
      )
    case 'dashboard':
      return (
        <DynamicDashboard
          view={view}
          config={config}
          appId={appId}
          locale={locale}
        />
      )
    default:
      return <UnknownComponentFallback componentType={view.type || 'unknown'} />
  }
}

/**
 * Core renderer — wraps every view in an Error Boundary.
 * Invalid configs or broken components never crash the app.
 */
export function Renderer({ view, config, appId, locale }: RendererProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Could add retry logic here
      }}
      resetKeys={[view?.id, view?.type]}
    >
      <div className="animate-fade-in">
        <ViewRenderer view={view} config={config} appId={appId} locale={locale} />
      </div>
    </ErrorBoundary>
  )
}
