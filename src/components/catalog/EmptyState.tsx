'use client'

import { MagnifyingGlass } from '@phosphor-icons/react'
import { useCatalogStore } from '@/features/catalog/store'

export function EmptyState() {
  const { resetFilters, activeIndustries, activeTags, activeProduct, query } = useCatalogStore()
  const hasFilters = activeIndustries.length > 0 || activeTags.length > 0 || activeProduct !== null || query.length > 0

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <MagnifyingGlass size={32} weight="duotone" className="text-[var(--color-text-subtle)] mb-3" />
      <h3 className="text-[16px] font-medium text-[var(--color-text)]">No projects found</h3>
      <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
        Try adjusting your search or filters
      </p>
      {hasFilters && (
        <button
          onClick={resetFilters}
          className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-[13px] font-medium text-[var(--color-primary-fg)] transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Reset all filters
        </button>
      )}
    </div>
  )
}
