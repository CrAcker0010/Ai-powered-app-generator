'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  toasts: Toast[]
  toast: (message: string, type?: ToastType) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => dismiss(id), 5000)
    },
    [dismiss]
  )

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    info: <Info size={18} />,
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {icons[t.type]}
            <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{t.message}</span>
            <button onClick={() => dismiss(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, color: 'inherit', padding: 0 }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}
