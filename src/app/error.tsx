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
        <h2 className="font-[var(--font-display)] text-[20px] font-semibold text-[var(--color-text)]">
          Failed to load projects
        </h2>
        <p className="text-[14px] text-[var(--color-text-muted)] max-w-md">
          Something went wrong while fetching data from Notion. Please check that the integration token is valid and the database is shared with the integration.
        </p>
        <button
          onClick={reset}
          className="mt-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-[14px] font-medium text-[var(--color-primary-fg)] transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
