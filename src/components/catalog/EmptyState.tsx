'use client'

import { MagnifyingGlass } from '@phosphor-icons/react'
import { useCatalogStore } from '@/features/catalog/store'

export function EmptyState() {
  const { resetFilters, activeIndustries, activeTags, activeClients, activeProduct, liveDemo } =
    useCatalogStore()
  const hasFilters =
    activeIndustries.length > 0 ||
    activeTags.length > 0 ||
    activeClients.length > 0 ||
    activeProduct !== null ||
    liveDemo !== null

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <MagnifyingGlass
        size={32}
        weight="duotone"
        className="text-[var(--fg-tertiary)] mb-3"
      />
      <h3 className="text-[16px] font-medium text-[var(--fg-primary)]">
        No demos found
      </h3>
      <p className="mt-1 text-[13px] text-[var(--fg-tertiary)]">
        Try adjusting your search or filters
      </p>
      {hasFilters && (
        <button
          onClick={resetFilters}
          className="mt-4 h-[36px] px-4 rounded-[var(--radius-md)] bg-[var(--fg-primary)] text-[var(--axion-bg)] text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          Reset all filters
        </button>
      )}
    </div>
  )
}
