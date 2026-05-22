'use client'

import { useState } from 'react'
import { Copy, Eye, EyeSlash, Check } from '@phosphor-icons/react'
import { parseCredentials } from '@/lib/utils'

interface CredentialsBlockProps {
  credentials: string | null
}

export function CredentialsBlock({ credentials }: CredentialsBlockProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const creds = parseCredentials(credentials)
  if (!creds) return null

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="mb-8">
      <h3 className="text-[14px] font-medium text-[var(--fg-primary)] mb-3">
        Credentials
      </h3>
      <div className="rounded-[var(--radius-panel)] bg-[var(--axion-card)] border border-[var(--border-subtle)] overflow-hidden">
        {creds.login && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[var(--fg-tertiary)] min-w-[70px]">Login</span>
              <span className="text-[14px] font-mono text-[var(--fg-primary)]">
                {creds.login}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(creds.login, 'login')}
              className="inline-flex items-center justify-center w-[32px] h-[32px] rounded-[var(--radius-md)] text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)] hover:bg-[var(--axion-overlay)] transition-colors"
            >
              {copied === 'login' ? <Check size={14} className="text-[var(--color-success)]" /> : <Copy size={14} />}
            </button>
          </div>
        )}

        {creds.password && (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[var(--fg-tertiary)] min-w-[70px]">Password</span>
              <span className="text-[14px] font-mono text-[var(--fg-primary)]">
                {showPassword ? creds.password : '••••••••'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="inline-flex items-center justify-center w-[32px] h-[32px] rounded-[var(--radius-md)] text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)] hover:bg-[var(--axion-overlay)] transition-colors"
              >
                {showPassword ? <EyeSlash size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => copyToClipboard(creds.password, 'password')}
                className="inline-flex items-center justify-center w-[32px] h-[32px] rounded-[var(--radius-md)] text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)] hover:bg-[var(--axion-overlay)] transition-colors"
              >
                {copied === 'password' ? <Check size={14} className="text-[var(--color-success)]" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
