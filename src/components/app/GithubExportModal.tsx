'use client'

import React, { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { GitBranch, X, Loader2, CheckCircle, ExternalLink } from 'lucide-react'

interface GithubExportModalProps {
  appId: string
  appName: string
  onClose: () => void
}

export function GithubExportModal({ appId, appName, onClose }: GithubExportModalProps) {
  const toast = useToast()
  const [token, setToken] = useState('')
  const [repoName, setRepoName] = useState(appName.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')

  const handleExport = async () => {
    if (!token) { toast('GitHub token is required', 'error'); return }
    if (!repoName) { toast('Repository name is required', 'error'); return }

    setLoading(true)
    try {
      const res = await fetch(`/api/apps/${appId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, repoName, description }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast(data.error ?? 'Export failed', 'error')
        return
      }
      setRepoUrl(data.repoUrl)
      toast('App exported to GitHub!', 'success')
    } catch {
      toast('Network error during export', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitBranch size={18} style={{ color: 'var(--accent-green)' }} />
            <h2 style={{ fontWeight: 700 }}>Export to GitHub</h2>
          </div>
          <button className="btn btn-ghost" style={{ height: '28px', width: '28px', padding: 0, justifyContent: 'center' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {repoUrl ? (
          <div>
            <div style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(0,229,153,0.08)', border: '1px solid rgba(0,229,153,0.3)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-green)', fontWeight: 700, marginBottom: '0.75rem' }}>
                <CheckCircle size={18} />
                Exported Successfully!
              </div>
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', fontSize: '0.875rem', textDecoration: 'none', fontFamily: 'monospace' }}
              >
                <ExternalLink size={14} />
                {repoUrl}
              </a>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Your app configuration, schemas, and a README have been pushed to the repository.
            </div>
            <button className="btn btn-primary" onClick={onClose} style={{ width: '100%', height: '40px' }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(79,156,255,0.08)', border: '1px solid rgba(79,156,255,0.2)', borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              You need a <strong style={{ color: 'var(--accent-blue)' }}>GitHub Personal Access Token</strong> with{' '}
              <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: '3px' }}>repo</code> scope.{' '}
              <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)' }}>
                Create one here ↗
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="label" htmlFor="gh-token">GitHub Token <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                <input
                  id="gh-token"
                  className="input"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxx"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="label" htmlFor="gh-repo">Repository Name <span style={{ color: 'var(--accent-red)' }}>*</span></label>
                <input
                  id="gh-repo"
                  className="input"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-_.]/g, '-'))}
                  placeholder="my-app-config"
                />
              </div>
              <div>
                <label className="label" htmlFor="gh-desc">Description <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                <input
                  id="gh-desc"
                  className="input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Auto-generated by AppForge"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={onClose} style={{ height: '40px' }}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleExport}
                disabled={loading || !token || !repoName}
                style={{ flex: 1, height: '40px' }}
              >
                {loading ? <><Loader2 size={14} className="animate-spin" /> Exporting...</> : '🚀 Export to GitHub'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
