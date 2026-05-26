'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/contexts/ToastContext'
import {
  ArrowLeft, Sparkles, Send, Loader2, Zap,
  CheckCircle2, Circle, Shield, RefreshCw, Play
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function BuilderPage() {
  const router = useRouter()
  const toast = useToast()

  const [pipelineStage, setPipelineStage] = useState<1 | 2 | 3 | 4>(1)
  const [compiling, setCompiling] = useState(false)
  const [activeAgentStep, setActiveAgentStep] = useState<number>(0)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [checklist, setChecklist] = useState<{ text: string; done: boolean }[]>([
    { text: 'Describe application goals', done: false },
    { text: 'Detail step-by-step user workflow', done: false },
    { text: 'Identify app target audience', done: false },
  ])
  const [appDescription, setAppDescription] = useState('An outstanding bespoke application to be designed via natural conversation.')
  const [schemaPreview, setSchemaPreview] = useState('')
  const [uiPreview, setUiPreview] = useState<{
    widgets?: { title: string; type: string; color: string }[]
    views?: { name: string; type: string }[]
  }>({})
  const [codePreview, setCodePreview] = useState('{\n  "status": "initializing",\n  "app": "pending"\n}')

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to AppForge Architect! Let's build your new application step-by-step.

**Stage 1: Outline User Workflow**
To get started, tell me: **what should be the workflow steps for this application?** For example, what actions will a user take from start to finish, and what data are we tracking?`,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)



  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const mockEvent = { preventDefault: () => {} } as React.FormEvent
      handleSubmit(mockEvent)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      if (!res.ok) throw new Error()

      const data = await res.json()
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message
      }])

      if (data.pipelineStage) setPipelineStage(data.pipelineStage as 1 | 2 | 3 | 4)
      if (data.checklist) setChecklist(data.checklist)
      if (data.appDescription) setAppDescription(data.appDescription)
      if (data.schemaPreview !== undefined) setSchemaPreview(data.schemaPreview)
      if (data.uiPreview) setUiPreview(data.uiPreview)
      if (data.codePreview) setCodePreview(data.codePreview)
    } catch {
      toast('Failed to get a response from Architect. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Pipelining process is now handled dynamically by the Gemini API response in handleSubmit.

  const handleLaunchApp = async () => {
    if (compiling) return
    setCompiling(true)
    setActiveAgentStep(1)

    const interval = setInterval(() => {
      setActiveAgentStep((prev) => {
        if (prev < 5) return prev + 1
        return prev
      })
    }, 1800)

    try {
      toast('Orchestrating agent collaboration pipeline...', 'info')
      const res = await fetch('/api/builder/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })

      clearInterval(interval)
      setActiveAgentStep(5)

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error ?? 'Compilation failed')
      }

      toast(`"${result.data.name}" compiled and successfully deployed!`, 'success')
      router.push(`/apps/${result.data.id}`)
    } catch (err: any) {
      clearInterval(interval)
      console.error('[LaunchApp]', err)
      toast(err.message ?? 'Failed to build application. Please try again.', 'error')
    } finally {
      setCompiling(false)
      setActiveAgentStep(0)
    }
  }



  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      color: 'var(--text-primary)',
      overflow: 'hidden',
    }}>
      {/* Top Header */}
      <header style={{
        height: '56px',
        borderBottom: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--surface) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        flexShrink: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'color 0.2s',
          }} className="hover-text-primary">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '24px', height: '24px',
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
              borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles size={12} color="var(--bg)" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Conversational Builder</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleLaunchApp}
            disabled={compiling || messages.length < 2}
            style={{
              height: '36px',
              padding: '0 1.25rem',
              borderRadius: '8px',
              background: compiling
                ? 'var(--surface-overlay)'
                : messages.length >= 2
                  ? 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))'
                  : 'var(--surface-overlay)',
              color: 'var(--bg)',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: compiling || messages.length < 2 ? 'not-allowed' : 'pointer',
              opacity: messages.length >= 2 ? 1 : 0.5,
              transition: 'all 0.2s ease',
              boxShadow: messages.length >= 2 ? '0 0 16px rgba(16,185,129,0.3)' : 'none',
            }}
          >
            {compiling ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Compiling App...
              </>
            ) : (
              <>
                <Play size={13} fill="white" />
                Launch Application
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        
        {/* LEFT COLUMN: Chat Panel */}
        <div style={{
          width: '45%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--border)',
          background: 'color-mix(in srgb, var(--surface-raised) 50%, transparent)',
          position: 'relative',
          height: '100%',
        }}>
          {/* Chats Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            paddingBottom: '100px', // Pad bottom to make space for absolute/floating bottom input
          }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Speaker label */}
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.25rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  {m.role === 'user' ? 'YOU' : 'APP ARCHITECT'}
                </div>

                {/* Message bubble */}
                <div style={{
                  padding: '0.875rem 1.125rem',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: m.role === 'user'
                    ? 'color-mix(in srgb, var(--accent-purple) 12%, transparent)'
                    : 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', paddingLeft: '0.25rem' }}>
                <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent-purple)' }} />
                Architect is thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Floating Bottom-Center Chat Input within Left Pane */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1.25rem',
            background: 'linear-gradient(to top, var(--surface-raised) 80%, transparent)',
            borderTop: '1px solid var(--border)',
            zIndex: 20,
          }}>
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              gap: '0.5rem',
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: '12px',
              padding: '0.5rem 0.5rem 0.5rem 1rem',
              boxShadow: '0 4px 20px var(--shadow-color)',
              alignItems: 'flex-end',
            }}>
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Message App Architect..."
                disabled={isLoading}
                rows={1}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  minHeight: '24px',
                  maxHeight: '120px',
                  resize: 'none',
                  padding: '6px 0',
                  lineHeight: '1.5',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: input.trim() ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : 'var(--surface-raised)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  color: 'var(--bg)',
                  transition: 'all 0.2s',
                  marginBottom: '2px',
                }}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Stage Pipeline Panel */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg)',
          padding: '2rem',
          overflowY: 'auto',
        }}>
          {/* Visual Stage Progress Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            background: 'var(--surface)',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--border)',
          }}>
            {[
              { num: 1, label: 'Workflow' },
              { num: 2, label: 'Data Model' },
              { num: 3, label: 'UI views' },
              { num: 4, label: 'Launch' },
            ].map((step, idx) => {
              const isActive = pipelineStage === step.num
              const isCompleted = pipelineStage > step.num

              return (
                <React.Fragment key={step.num}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.375rem',
                    flex: 1,
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isCompleted
                        ? 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))'
                        : isActive
                          ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))'
                          : 'var(--surface-raised)',
                      border: isActive ? '2px solid var(--border-strong)' : '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: isCompleted || isActive ? 'var(--bg)' : 'var(--text-muted)',
                      transition: 'all 0.3s ease',
                      boxShadow: isActive ? '0 0 12px var(--shadow-color)' : 'none',
                    }}>
                      {isCompleted ? '✓' : step.num}
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'all 0.3s ease',
                    }}>
                      {step.label}
                    </span>
                  </div>

                  {idx < 3 && (
                    <div style={{
                      height: '2px',
                      background: isCompleted ? 'linear-gradient(90deg, var(--accent-green), var(--accent-purple))' : 'var(--border)',
                      flex: 1.5,
                      margin: '0 0.5rem',
                      alignSelf: 'center',
                      transform: 'translateY(-10px)',
                    }} />
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* Interactive Dynamic Stage Card */}
          <div style={{
            flex: 1,
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {pipelineStage === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-purple)', marginBottom: '0.375rem' }}>Stage 1: Define User Workflow</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{appDescription || 'Describe the actions your users will perform. We will construct a dynamic workflow based on this.'}</p>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Current Checklist</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {checklist.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.85rem' }}>
                        {item.done ? <CheckCircle2 size={16} color="var(--accent-green)" /> : <Circle size={16} color="var(--text-muted)" />}
                        <span style={{ color: item.done ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  background: 'var(--surface-raised)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  padding: '1.25rem',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 700 }}>Compiled App Configuration Preview</div>
                  {codePreview}
                </div>
              </div>
            )}

            {pipelineStage === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-blue)', marginBottom: '0.375rem' }}>Stage 2: Design Data Models</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{appDescription}</p>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Current Checklist</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {checklist.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.85rem' }}>
                        {item.done ? <CheckCircle2 size={16} color="var(--accent-green)" /> : <Circle size={16} color="var(--text-muted)" />}
                        <span style={{ color: item.done ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  background: 'var(--surface-raised)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  padding: '1.25rem',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  overflowY: 'auto',
                  maxHeight: '260px',
                  whiteSpace: 'pre-wrap',
                }}>
                  <div style={{ color: 'var(--accent-purple)' }}>// Proposed Relational Schema</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {schemaPreview || `model Lead {
  id: String
  name: String
  email: Email
  status: Enum ['new', 'contacted', 'closed']
}`}
                  </div>
                </div>
              </div>
            )}

            {pipelineStage === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-green)', marginBottom: '0.375rem' }}>Stage 3: Build UI & Navigation</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{appDescription}</p>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Current Checklist</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {checklist.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.85rem' }}>
                        {item.done ? <CheckCircle2 size={16} color="var(--accent-green)" /> : <Circle size={16} color="var(--text-muted)" />}
                        <span style={{ color: item.done ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  background: 'var(--surface-raised)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  padding: '1.25rem',
                  overflowY: 'auto',
                  maxHeight: '260px',
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Proposed Dashboard Widgets</div>
                  {uiPreview.widgets && uiPreview.widgets.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                      {uiPreview.widgets.map((widget, idx) => {
                        const accentColor = widget.color === 'purple' ? 'var(--accent-purple)'
                          : widget.color === 'blue' ? 'var(--accent-blue)'
                          : widget.color === 'green' ? 'var(--accent-green)'
                          : widget.color === 'amber' ? 'var(--accent-amber)'
                          : 'var(--accent-red)';
                        return (
                          <div key={idx} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{widget.type || 'STAT'}</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: accentColor, marginTop: '0.25rem' }}>{widget.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div style={{ flex: 1, height: '56px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>STAT</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple)' }}>Total Records</div>
                      </div>
                      <div style={{ flex: 1, height: '56px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>STAT</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-blue)' }}>Completed Items</div>
                      </div>
                    </div>
                  )}
                  
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '0.5rem', marginBottom: '0.25rem' }}>Proposed Navigation Views</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {uiPreview.views && uiPreview.views.length > 0 ? (
                      uiPreview.views.map((view, idx) => (
                        <span key={idx} className="badge badge-purple" style={{ fontSize: '0.7rem', padding: '0.25rem 0.625rem' }}>
                          📂 {view.name} ({view.type})
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>📂 Dashboard</span>
                        <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>📂 Manage Records</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {pipelineStage === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-purple)', marginBottom: '0.375rem' }}>Stage 4: App Launch & Deployment</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{appDescription}</p>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Deployment Checklist</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {checklist.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.85rem' }}>
                        {item.done ? <CheckCircle2 size={16} color="var(--accent-green)" /> : <Circle size={16} color="var(--text-muted)" />}
                        <span style={{ color: item.done ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(187,247,208,0.1)',
                  border: '1px dashed var(--accent-green)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: '48px', height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(187,247,208,0.25)',
                    color: 'var(--accent-green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                  }}>
                    <Play size={20} fill="var(--accent-green)" />
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>Your Application is Ready!</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', marginBottom: '1.25rem' }}>
                    Click the button below or at the top header to build, link models, and run the app.
                  </p>
                  <button
                    onClick={handleLaunchApp}
                    disabled={compiling}
                    style={{
                      height: '38px',
                      padding: '0 1.5rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: compiling ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 0 16px rgba(16,185,129,0.4)',
                    }}
                  >
                    {compiling ? <Loader2 size={14} className="animate-spin" /> : <Play size={13} fill="white" />}
                    Compile & Launch Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Multi-Agent Compiler Overlay */}
      {compiling && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'color-mix(in srgb, var(--bg) 95%, transparent)',
          backdropFilter: 'blur(20px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '520px',
            padding: '2.5rem',
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 24px 64px var(--shadow-color)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
          }}>
            <div>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                boxShadow: '0 0 24px rgba(124, 111, 255, 0.4)',
                animation: 'spin 2s linear infinite',
              }}>
                <Sparkles size={28} color="white" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }} className="gradient-text">Orchestrating Agent Pipeline</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
                Multiple specialized AI agents are collaborating to build your application.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              textAlign: 'left',
              background: 'var(--surface-raised)',
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid var(--border)',
            }}>
              {[
                { step: 1, name: 'Prompt Enhancer', desc: 'Analyzing transcript & enhancing system specifications...' },
                { step: 2, name: 'Backend Architect', desc: 'Structuring relational data schemas & field attributes...' },
                { step: 3, name: 'Frontend Designer', desc: 'Crafting UI dashboard cards, dynamic forms, and view layout grids...' },
                { step: 4, name: 'Integration Specialist', desc: 'Wiring schemas, validation rules, and navigation endpoints...' },
                { step: 5, name: 'Release Manager', desc: 'Provisioning PostgreSQL DB tables & initiating AppForge engine...' }
              ].map((agent) => {
                const isActive = activeAgentStep === agent.step
                const isCompleted = activeAgentStep > agent.step
                
                return (
                  <div key={agent.step} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.875rem',
                    opacity: isActive ? 1 : isCompleted ? 0.75 : 0.25,
                    transition: 'all 0.3s ease',
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: isCompleted 
                        ? 'var(--accent-green)' 
                        : isActive 
                          ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' 
                          : 'var(--surface-overlay)',
                      border: isActive ? '2px solid var(--border-strong)' : '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: isCompleted || isActive ? 'white' : 'var(--text-muted)',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}>
                      {isCompleted ? '✓' : agent.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 700, 
                        color: isCompleted 
                          ? 'var(--accent-green)' 
                          : isActive 
                            ? 'var(--text-primary)' 
                            : 'var(--text-muted)' 
                      }}>
                        {agent.name}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: isActive ? 'var(--text-secondary)' : 'var(--text-muted)', 
                        marginTop: '0.125rem' 
                      }}>
                        {agent.desc}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
              <Loader2 size={12} className="animate-spin" style={{ color: 'var(--accent-purple)' }} />
              Executing sequential structured pipeline...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
