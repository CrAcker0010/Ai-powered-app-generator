'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Zap, Loader2, Eye, EyeOff } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user, loading: authLoading } = useAuth()
  const toast = useToast()

  React.useEffect(() => {
    if (!authLoading && user) {
      const redirectTo = searchParams.get('redirect')
      router.push(redirectTo || '/dashboard')
    }
  }, [user, authLoading, router, searchParams])

  const [email, setEmail] = useState('demo@appforge.dev')
  const [password, setPassword] = useState('demo1234')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      toast('Welcome back!', 'success')
      const redirectTo = searchParams.get('redirect')
      router.push(redirectTo || '/dashboard')
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
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.375rem' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            Sign in to your account to continue
          </p>

          {error && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: '8px', marginBottom: '1rem', color: 'var(--accent-red)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input
                  id="email"
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
                <label className="label" htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    className="input"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
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
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', height: '44px', marginTop: '1.5rem', fontSize: '0.9375rem' }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 600 }}>
              Sign up free
            </Link>
          </p>
        </div>

        {/* Demo credentials hint */}
        <div style={{ marginTop: '1rem', padding: '0.875rem 1rem', background: 'rgba(79,156,255,0.08)', border: '1px solid rgba(79,156,255,0.2)', borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--accent-blue)' }}>Demo:</strong> Credentials have been pre-filled for testing. Just click Sign In!
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-purple)' }} /></div>}>
      <LoginForm />
    </React.Suspense>
  )
}
