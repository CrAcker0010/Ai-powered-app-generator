'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Zap, Loader2, Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { signup, user, loading: authLoading } = useAuth()
  const toast = useToast()

  React.useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    const result = await signup(name, email, password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      toast('Account created! Welcome to AppForge 🎉', 'success')
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem' }} className="gradient-text">AppForge</span>
          </Link>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.375rem' }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            Start building apps from JSON in minutes
          </p>

          {error && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: '8px', marginBottom: '1rem', color: 'var(--accent-red)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label" htmlFor="name">Name <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                <input
                  id="name"
                  className="input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="label" htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="label" htmlFor="signup-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-password"
                    className="input"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    autoComplete="new-password"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password && (
                  <div style={{ marginTop: '0.375rem', display: 'flex', gap: '3px' }}>
                    {[...Array(4)].map((_, i) => (
                      <div key={i} style={{
                        height: '3px', flex: 1, borderRadius: '2px',
                        background: password.length > i * 2
                          ? password.length >= 12 ? 'var(--accent-green)'
                            : password.length >= 8 ? 'var(--accent-amber)'
                            : 'var(--accent-red)'
                          : 'var(--surface-overlay)',
                        transition: 'background 0.2s',
                      }} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              id="signup-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', height: '44px', marginTop: '1.5rem', fontSize: '0.9375rem' }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
