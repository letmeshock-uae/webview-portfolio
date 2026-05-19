'use client'

import { useState, useEffect } from 'react'
import { Lock, Link as LinkIcon, CircleNotch, CheckCircle, XCircle } from '@phosphor-icons/react'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface ImportResult {
  title: string
  description: string
  product: string
  resourceType: string
  link: string
  coverPath: string | null
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const [notionUrl, setNotionUrl] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)

  useEffect(() => {
    fetch('/api/admin/auth')
      .then((r) => {
        if (r.ok) setAuthenticated(true)
      })
      .finally(() => setChecking(false))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setAuthenticated(true)
    } else {
      setAuthError('Wrong password')
    }
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notionUrl.trim()) return

    setStatus('loading')
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionUrl: notionUrl.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setResult(data.project)
      setStatus('success')
      setNotionUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
      setStatus('error')
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
        <CircleNotch size={32} className="animate-spin text-white/40" />
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] p-4">
        <form onSubmit={handleLogin} className="w-full max-w-[320px] flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <Lock size={24} className="text-white/60" />
            <h1 className="text-[18px] font-medium text-white">Admin Access</h1>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full rounded-[8px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
          />

          {authError && (
            <p className="text-[13px] text-red-400">{authError}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-[8px] bg-white/10 py-3 text-[14px] font-medium text-white hover:bg-white/15 transition-colors"
          >
            Enter
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="mx-auto max-w-[560px] pt-[10vh]">
        <h1 className="text-[20px] font-semibold text-white mb-6">Import from Notion</h1>

        <form onSubmit={handleImport} className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/5 px-4 py-3">
            <LinkIcon size={18} className="text-white/40 flex-shrink-0" />
            <input
              type="text"
              value={notionUrl}
              onChange={(e) => setNotionUrl(e.target.value)}
              placeholder="Paste Notion page URL..."
              className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/30 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || !notionUrl.trim()}
            className="w-full rounded-[8px] bg-white/10 py-3 text-[14px] font-medium text-white hover:bg-white/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <CircleNotch size={16} className="animate-spin" />
                Importing...
              </>
            ) : (
              'Import Project'
            )}
          </button>
        </form>

        {status === 'success' && result && (
          <div className="mt-6 rounded-[8px] border border-green-500/20 bg-green-500/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={18} className="text-green-400" weight="fill" />
              <span className="text-[14px] font-medium text-green-400">Project imported</span>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
              <dt className="text-white/40">Title</dt>
              <dd className="text-white">{result.title}</dd>
              {result.product && (
                <>
                  <dt className="text-white/40">Product</dt>
                  <dd className="text-white">{result.product}</dd>
                </>
              )}
              {result.resourceType && (
                <>
                  <dt className="text-white/40">Type</dt>
                  <dd className="text-white">{result.resourceType}</dd>
                </>
              )}
              {result.link && (
                <>
                  <dt className="text-white/40">Link</dt>
                  <dd className="text-white truncate">
                    <a href={result.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80">
                      {result.link}
                    </a>
                  </dd>
                </>
              )}
              <dt className="text-white/40">Cover</dt>
              <dd className="text-white">{result.coverPath ? 'Saved' : 'None'}</dd>
            </dl>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 rounded-[8px] border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-center gap-2">
              <XCircle size={18} className="text-red-400" weight="fill" />
              <span className="text-[14px] text-red-400">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
