'use client'

import { useState, useEffect, useRef } from 'react'
import { Lock, Link as LinkIcon, CircleNotch, CheckCircle, XCircle, FileZip, UploadSimple } from '@phosphor-icons/react'

type Status = 'idle' | 'loading' | 'success' | 'error'
type Tab = 'notion' | 'zip'

interface ImportResult {
  title: string
  description: string
  product: string
  resourceType: string
  link: string
  coverPath: string | null
}

interface ZipImportResult {
  count: number
  projects: Array<{
    title: string
    product: string
    resourceType: string
    link: string
    coverSaved: boolean
  }>
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [tab, setTab] = useState<Tab>('zip')

  // Notion import state
  const [notionUrl, setNotionUrl] = useState('')
  const [notionStatus, setNotionStatus] = useState<Status>('idle')
  const [notionError, setNotionError] = useState('')
  const [notionResult, setNotionResult] = useState<ImportResult | null>(null)

  // ZIP import state
  const [zipStatus, setZipStatus] = useState<Status>('idle')
  const [zipError, setZipError] = useState('')
  const [zipResult, setZipResult] = useState<ZipImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleNotionImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notionUrl.trim()) return

    setNotionStatus('loading')
    setNotionError('')
    setNotionResult(null)

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionUrl: notionUrl.trim() }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Import failed')

      setNotionResult(data.project)
      setNotionStatus('success')
      setNotionUrl('')
    } catch (err) {
      setNotionError(err instanceof Error ? err.message : 'Import failed')
      setNotionStatus('error')
    }
  }

  const handleZipUpload = async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      setZipError('Please upload a .zip file')
      setZipStatus('error')
      return
    }

    setZipStatus('loading')
    setZipError('')
    setZipResult(null)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )

      const res = await fetch('/api/admin/import-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64, filename: file.name }),
      })

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await res.text()
        throw new Error(text.slice(0, 100) || `Server error: ${res.status}`)
      }

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')

      setZipResult(data)
      setZipStatus('success')
    } catch (err) {
      setZipError(err instanceof Error ? err.message : 'Import failed')
      setZipStatus('error')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleZipUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleZipUpload(file)
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
        <h1 className="text-[20px] font-semibold text-white mb-6">Import Projects</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-[8px] bg-white/5 p-1">
          <button
            onClick={() => setTab('zip')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-[6px] py-2 text-[13px] font-medium transition-colors ${
              tab === 'zip' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <FileZip size={16} />
            ZIP Export
          </button>
          <button
            onClick={() => setTab('notion')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-[6px] py-2 text-[13px] font-medium transition-colors ${
              tab === 'notion' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <LinkIcon size={16} />
            Notion URL
          </button>
        </div>

        {/* ZIP Tab */}
        {tab === 'zip' && (
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-[8px] border-2 border-dashed p-8 cursor-pointer transition-colors ${
                dragOver
                  ? 'border-white/40 bg-white/5'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              {zipStatus === 'loading' ? (
                <CircleNotch size={32} className="animate-spin text-white/40" />
              ) : (
                <>
                  <UploadSimple size={32} className="text-white/30" />
                  <div className="text-center">
                    <p className="text-[14px] text-white/60">Drop Notion export ZIP here</p>
                    <p className="text-[12px] text-white/30 mt-1">or click to browse</p>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-[12px] text-white/30 mt-3">
              Export your Notion database as ZIP (HTML or CSV format). Images will be extracted automatically.
            </p>

            {zipStatus === 'success' && zipResult && (
              <div className="mt-6 rounded-[8px] border border-green-500/20 bg-green-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={18} className="text-green-400" weight="fill" />
                  <span className="text-[14px] font-medium text-green-400">
                    {zipResult.count} project{zipResult.count !== 1 ? 's' : ''} imported
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
                  {zipResult.projects.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-[13px]">
                      <span className="text-white truncate">{p.title}</span>
                      <span className="text-white/30 flex-shrink-0 ml-2">
                        {p.coverSaved ? 'with cover' : 'no cover'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {zipStatus === 'error' && (
              <div className="mt-6 rounded-[8px] border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2">
                  <XCircle size={18} className="text-red-400" weight="fill" />
                  <span className="text-[14px] text-red-400">{zipError}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notion URL Tab */}
        {tab === 'notion' && (
          <div>
            <form onSubmit={handleNotionImport} className="flex flex-col gap-4">
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
                disabled={notionStatus === 'loading' || !notionUrl.trim()}
                className="w-full rounded-[8px] bg-white/10 py-3 text-[14px] font-medium text-white hover:bg-white/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {notionStatus === 'loading' ? (
                  <>
                    <CircleNotch size={16} className="animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import Project'
                )}
              </button>
            </form>

            <p className="text-[12px] text-white/30 mt-3">
              Requires NOTION_API_TOKEN configured on the server.
            </p>

            {notionStatus === 'success' && notionResult && (
              <div className="mt-6 rounded-[8px] border border-green-500/20 bg-green-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={18} className="text-green-400" weight="fill" />
                  <span className="text-[14px] font-medium text-green-400">Project imported</span>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
                  <dt className="text-white/40">Title</dt>
                  <dd className="text-white">{notionResult.title}</dd>
                  {notionResult.product && (
                    <>
                      <dt className="text-white/40">Product</dt>
                      <dd className="text-white">{notionResult.product}</dd>
                    </>
                  )}
                  {notionResult.resourceType && (
                    <>
                      <dt className="text-white/40">Type</dt>
                      <dd className="text-white">{notionResult.resourceType}</dd>
                    </>
                  )}
                  {notionResult.link && (
                    <>
                      <dt className="text-white/40">Link</dt>
                      <dd className="text-white truncate">
                        <a href={notionResult.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80">
                          {notionResult.link}
                        </a>
                      </dd>
                    </>
                  )}
                  <dt className="text-white/40">Cover</dt>
                  <dd className="text-white">{notionResult.coverPath ? 'Saved' : 'None'}</dd>
                </dl>
              </div>
            )}

            {notionStatus === 'error' && (
              <div className="mt-6 rounded-[8px] border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2">
                  <XCircle size={18} className="text-red-400" weight="fill" />
                  <span className="text-[14px] text-red-400">{notionError}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
