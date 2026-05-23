'use client'

import React, { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { Upload, X, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'

interface CsvImportModalProps {
  appId: string
  modelNames: string[]
  onClose: () => void
  onImported: () => void
}

export function CsvImportModal({ appId, modelNames, onClose, onImported }: CsvImportModalProps) {
  const toast = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [modelName, setModelName] = useState(modelNames[0] ?? '')
  const [customModel, setCustomModel] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    imported: number; failed: number; total: number; errors?: Array<{ row: number; error: string }>
  } | null>(null)
  const [dragging, setDragging] = useState(false)

  const targetModel = modelName === '__custom__' ? customModel : modelName

  const handleImport = async () => {
    if (!file) { toast('Please select a CSV file', 'error'); return }
    if (!targetModel) { toast('Please specify a model name', 'error'); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('model', targetModel)

      const res = await fetch(`/api/apps/${appId}/import`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        toast(data.error ?? 'Import failed', 'error')
        return
      }

      setResult(data)
      if (data.imported > 0) {
        toast(`${data.imported} records imported successfully!`, 'success')
      }
    } catch {
      toast('Network error during import', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={18} style={{ color: 'var(--accent-blue)' }} />
            <h2 style={{ fontWeight: 700 }}>Import CSV Data</h2>
          </div>
          <button className="btn btn-ghost" style={{ height: '28px', width: '28px', padding: 0, justifyContent: 'center' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {result ? (
          <div>
            <div style={{ padding: '1.25rem', borderRadius: '10px', background: result.imported > 0 ? 'rgba(0,229,153,0.08)' : 'rgba(255,77,109,0.08)', border: `1px solid ${result.imported > 0 ? 'rgba(0,229,153,0.3)' : 'rgba(255,77,109,0.3)'}`, marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: result.imported > 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>
                {result.imported > 0 ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                Import {result.imported > 0 ? 'Complete' : 'Failed'}
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{result.imported}</span> <span style={{ color: 'var(--text-secondary)' }}>imported</span></div>
                <div><span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>{result.failed}</span> <span style={{ color: 'var(--text-secondary)' }}>failed</span></div>
                <div><span style={{ fontWeight: 700 }}>{result.total}</span> <span style={{ color: 'var(--text-secondary)' }}>total</span></div>
              </div>
              {result.errors && result.errors.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  {result.errors.slice(0, 3).map((e, i) => (
                    <div key={i} style={{ fontSize: '0.75rem', color: 'var(--accent-red)', fontFamily: 'monospace', marginTop: '0.25rem' }}>
                      Row {e.row}: {e.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1, height: '40px' }}>Close</button>
              {result.imported > 0 && (
                <button className="btn btn-primary" onClick={onImported} style={{ flex: 1, height: '40px' }}>View Data →</button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Model selector */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Target Model</label>
              <select
                className="input"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              >
                {modelNames.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                <option value="__custom__">+ New model name...</option>
              </select>
              {modelName === '__custom__' && (
                <input
                  className="input"
                  style={{ marginTop: '0.5rem' }}
                  placeholder="Enter model name (e.g. products)"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                />
              )}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                const f = e.dataTransfer.files[0]
                if (f?.name.endsWith('.csv')) setFile(f)
                else toast('Please drop a .csv file', 'error')
              }}
              onClick={() => document.getElementById('csv-file-input')?.click()}
              style={{
                border: `2px dashed ${dragging ? 'var(--accent-blue)' : file ? 'var(--accent-green)' : 'var(--border)'}`,
                borderRadius: '10px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? 'rgba(79,156,255,0.05)' : file ? 'rgba(0,229,153,0.05)' : 'transparent',
                transition: 'all 0.2s ease',
                marginBottom: '1rem',
              }}
            >
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <Upload size={24} style={{ margin: '0 auto 0.5rem', color: file ? 'var(--accent-green)' : 'var(--text-muted)' }} />
              {file ? (
                <>
                  <p style={{ fontWeight: 600, color: 'var(--accent-green)', fontSize: '0.875rem' }}>{file.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                </>
              ) : (
                <>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Drop CSV file or click to browse</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Headers auto-map to model fields. Schema inferred if model is new.
                  </p>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={onClose} style={{ height: '40px' }}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleImport}
                disabled={!file || loading || !targetModel}
                style={{ flex: 1, height: '40px' }}
              >
                {loading ? <><Loader2 size={14} className="animate-spin" /> Importing...</> : '⬆ Import Data'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
