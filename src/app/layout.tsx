import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/contexts/ToastContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'AppForge — AI App Generator',
    template: '%s | AppForge',
  },
  description:
    'Build production apps from JSON configuration. A metadata-driven application runtime that converts JSON into working frontend UI, APIs, and database structure.',
  keywords: ['app generator', 'no-code', 'low-code', 'JSON config', 'dynamic apps'],
  openGraph: {
    title: 'AppForge — AI App Generator',
    description: 'Build production apps from JSON configuration.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="noise-bg">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
