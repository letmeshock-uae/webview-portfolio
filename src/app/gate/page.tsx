'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function GatePage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(false)
    setLoading(true)

    const res = await fetch('/api/gate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--axion-bg)] px-4">
      <form
        onSubmit={handleSubmit}
        className="axion-panel flex w-full max-w-[360px] flex-col gap-5 p-8"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.1)]">
            <span className="text-[var(--fg-primary)] text-[24px] font-semibold font-[var(--font-display)]">D</span>
          </div>
          <h1 className="font-[var(--font-display)] text-[20px] font-medium text-[var(--fg-primary)]">
            Project Catalog
          </h1>
          <p className="text-[13px] text-[var(--fg-tertiary)]">Enter password to continue</p>
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false) }}
            placeholder="Password"
            autoFocus
            className="h-[40px] w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--axion-card)] px-3 text-[14px] text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] outline-none focus:border-[var(--border-base)] transition-colors"
          />
          {error && (
            <p className="text-[12px] text-[var(--color-error)]">Wrong password</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !password}
          className="h-[40px] w-full rounded-[var(--radius-md)] bg-[var(--fg-primary)] text-[var(--axion-bg)] text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  )
}
