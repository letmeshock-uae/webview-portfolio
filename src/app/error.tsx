'use client'

import { WarningCircle } from '@phosphor-icons/react'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <WarningCircle size={48} weight="duotone" className="text-[var(--color-error)]" />
        <h2 className="font-[var(--font-display)] text-[20px] font-medium text-[var(--fg-primary)]">
          Failed to load demos
        </h2>
        <p className="text-[14px] text-[var(--fg-tertiary)] max-w-md">
          Something went wrong while loading data. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-2 h-[36px] px-4 rounded-[var(--radius-md)] bg-[var(--fg-primary)] text-[var(--axion-bg)] text-[14px] font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
