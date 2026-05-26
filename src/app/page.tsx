import React from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Database, Code2, Globe, GitBranch, FileSpreadsheet } from 'lucide-react'

const features = [
  {
    icon: <Code2 size={20} />,
    title: 'JSON-Driven UI',
    description: 'Define your entire app in JSON — forms, tables, dashboards auto-render from configuration.',
    color: 'var(--accent-purple)',
  },
  {
    icon: <Database size={20} />,
    title: 'Dynamic Database',
    description: 'JSONB-powered records adapt to any schema. Add fields anytime without migrations.',
    color: 'var(--accent-blue)',
  },
  {
    icon: <Zap size={20} />,
    title: 'Instant APIs',
    description: 'Every model gets full CRUD APIs automatically. Zod validation included out of the box.',
    color: 'var(--accent-cyan)',
  },
  {
    icon: <Globe size={20} />,
    title: 'Multi-Language',
    description: 'Built-in i18n support for 6 languages. Configure locale per-app.',
    color: 'var(--accent-green)',
  },
  {
    icon: <FileSpreadsheet size={20} />,
    title: 'CSV Import',
    description: 'Bulk-import data from CSV files. Schema auto-inferred from column headers.',
    color: 'var(--accent-amber)',
  },
  {
    icon: <GitBranch size={20} />,
    title: 'GitHub Export',
    description: 'Export your app configuration and schemas to a GitHub repository in one click.',
    color: 'var(--accent-red)',
  },
]

const sampleConfigs = [
  {
    name: 'CRM App',
    description: 'Contacts, deals, and pipeline tracking',
    emoji: '👥',
    color: 'var(--accent-purple)',
  },
  {
    name: 'Task Tracker',
    description: 'Projects, tasks, and assignments',
    emoji: '✅',
    color: 'var(--accent-blue)',
  },
  {
    name: 'Inventory',
    description: 'Products, stock levels, and suppliers',
    emoji: '📦',
    color: 'var(--accent-green)',
  },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        borderBottom: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--surface) 90%, transparent)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem' }} className="gradient-text">AppForge</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link href="/dashboard" className="btn btn-primary" style={{ height: '36px' }}>
              Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem 4rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', borderRadius: '100px', background: 'rgba(124,111,255,0.1)', border: '1px solid rgba(124,111,255,0.3)', marginBottom: '1.5rem' }}>
          <Zap size={13} style={{ color: 'var(--accent-purple)' }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--accent-purple)', fontWeight: 600 }}>Metadata-Driven Application Runtime</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          Build apps from{' '}
          <span className="gradient-text">JSON configuration</span>
        </h1>

        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Define your app once. Get frontend UI, database, and APIs instantly.
          No code required for common patterns — just JSON.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="btn btn-primary" style={{ height: '48px', fontSize: '1rem', padding: '0 1.75rem' }}>
            Start Building Free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Sample configs */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {sampleConfigs.map((s) => (
            <div key={s.name} className="card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{s.emoji}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: s.color }}>{s.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.description}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Everything you need
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          From config to production in minutes.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {features.map((f) => (
            <div key={f.title} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: `${f.color}20`, color: f.color }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{f.title}</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '1200px', margin: '4rem auto 6rem', padding: '0 1.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,111,255,0.15), rgba(79,156,255,0.1))',
          border: '1px solid rgba(124,111,255,0.2)',
          borderRadius: '20px',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Ready to build?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Create your first app in under 2 minutes.
          </p>
          <Link href="/dashboard" className="btn btn-primary" style={{ height: '48px', fontSize: '1rem', padding: '0 2rem' }}>
            Get Started Free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
        AppForge — AI App Generator · Built with Next.js, TypeScript, PostgreSQL, Prisma
      </footer>
    </div>
  )
}
