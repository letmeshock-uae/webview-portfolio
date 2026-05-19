'use client'

import { useState, useEffect, useRef } from 'react'
import { Lock, Link as LinkIcon, CircleNotch, CheckCircle, XCircle, FileZip, UploadSimple } from '@phosphor-icons/react'
import JSZip from 'jszip'

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
  projects: string[]
  images: number
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseCsv(text: string): Record<string, string>[] {
  const lines: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === '\n' && !inQuotes) {
      lines.push(current)
      current = ''
    } else if (ch === '\r' && !inQuotes) {
      // skip
    } else {
      current += ch
    }
  }
  if (current.trim()) lines.push(current)

  if (lines.length < 2) return []

  const headerLine = lines[0]
  const headers = splitCsvLine(headerLine)

  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = splitCsvLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').trim()
    })
    rows.push(row)
  }
  return rows
}

function splitCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current)
  return fields
}

function findValue(row: Record<string, string>, ...keys: string[]): string {
  for (const k of Object.keys(row)) {
    const lower = k.toLowerCase()
    for (const target of keys) {
      if (lower === target.toLowerCase() || lower.includes(target.toLowerCase())) {
        return row[k] || ''
      }
    }
  }
  return ''
}

function isImageFile(name: string): boolean {
  return /\.(png|jpg|jpeg|webp|gif)$/i.test(name)
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
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
  const [zipProgress, setZipProgress] = useState('')
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
    setZipProgress('Reading ZIP...')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)

      setZipProgress('Parsing contents...')

      // Find CSV files
      const csvFiles: string[] = []
      const imageFiles: Map<string, JSZip.JSZipObject> = new Map()

      zip.forEach((path, entry) => {
        if (entry.dir) return
        if (path.toLowerCase().endsWith('.csv')) csvFiles.push(path)
        if (isImageFile(path)) imageFiles.set(path, entry)
      })

      if (csvFiles.length === 0) {
        throw new Error('No CSV file found in the archive')
      }

      // Parse the first CSV
      const csvFile = zip.file(csvFiles[0])
      if (!csvFile) throw new Error('Could not read CSV')

      let csvText = await csvFile.async('string')
      if (csvText.charCodeAt(0) === 0xFEFF) csvText = csvText.slice(1)

      const rows = parseCsv(csvText)
      if (rows.length === 0) throw new Error('CSV is empty')

      setZipProgress(`Found ${rows.length} projects, processing...`)

      // Build projects
      const projects = rows
        .map((row) => ({
          name: findValue(row, 'name', 'title'),
          access: findValue(row, 'access') || 'Internal',
          credentials: findValue(row, 'credentials'),
          customerDemo: findValue(row, 'customer demo', 'demo') || 'No',
          description: findValue(row, 'description'),
          lastUpdated: findValue(row, 'last updated', 'updated', 'date'),
          link: findValue(row, 'link', 'url'),
          product: findValue(row, 'product'),
          resourceType: findValue(row, 'resource type', 'type'),
        }))
        .filter((p) => p.name)

      // Send projects to server (small JSON, no images)
      setZipProgress('Saving projects...')
      const res = await fetch('/api/admin/import-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save projects')
      }

      // Build a map of folder name -> first image in that folder
      const folderImageMap: Map<string, { path: string; entry: JSZip.JSZipObject }> = new Map()
      for (const [imgPath, imgEntry] of imageFiles) {
        if (imgPath.includes('__MACOSX')) continue
        const parts = imgPath.split('/')
        if (parts.length >= 2) {
          const folder = parts[parts.length - 2]
          if (!folderImageMap.has(folder)) {
            folderImageMap.set(folder, { path: imgPath, entry: imgEntry })
          }
        }
      }

      // Upload images one by one, matching by folder name
      let imagesUploaded = 0
      for (const project of projects) {
        const slug = slugify(project.name)
        const nameNorm = project.name.toLowerCase().replace(/[^a-z0-9]/g, '')

        let matched: { path: string; entry: JSZip.JSZipObject } | null = null

        for (const [folder, img] of folderImageMap) {
          const folderNorm = folder.toLowerCase().replace(/[^a-z0-9]/g, '')
          if (folderNorm === nameNorm || folderNorm.includes(nameNorm) || nameNorm.includes(folderNorm)) {
            matched = img
            break
          }
        }

        if (matched) {
          const ext = matched.path.split('.').pop()?.toLowerCase() || 'jpeg'
          const imgBuffer = await matched.entry.async('arraybuffer')

          if (imgBuffer.byteLength < 3500000) {
            setZipProgress(`Uploading cover: ${project.name}...`)
            const base64 = arrayBufferToBase64(imgBuffer)

            await fetch('/api/admin/upload-cover', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slug, data: base64, ext }),
            })
            imagesUploaded++
          }
        }
      }

      setZipResult({
        count: projects.length,
        projects: projects.map((p) => p.name),
        images: imagesUploaded,
      })
      setZipStatus('success')
      setZipProgress('')
    } catch (err) {
      setZipError(err instanceof Error ? err.message : 'Import failed')
      setZipStatus('error')
      setZipProgress('')
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
                <div className="flex flex-col items-center gap-2">
                  <CircleNotch size={32} className="animate-spin text-white/40" />
                  {zipProgress && <p className="text-[13px] text-white/40">{zipProgress}</p>}
                </div>
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
              Export your Notion database as CSV+ZIP. Run import locally (<code className="text-white/40">npm run dev</code>), then push to GitHub to deploy.
            </p>

            {zipStatus === 'success' && zipResult && (
              <div className="mt-6 rounded-[8px] border border-green-500/20 bg-green-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={18} className="text-green-400" weight="fill" />
                  <span className="text-[14px] font-medium text-green-400">
                    {zipResult.count} project{zipResult.count !== 1 ? 's' : ''} imported, {zipResult.images} cover{zipResult.images !== 1 ? 's' : ''} saved
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
                  {zipResult.projects.map((name, i) => (
                    <div key={i} className="text-[13px] text-white/70">{name}</div>
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
