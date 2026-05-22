'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { MagnifyingGlass, FunnelSimple, X } from '@phosphor-icons/react'
import type { Demo } from '@/types'
import { useCatalogStore } from '@/features/catalog/store'
import { FilterBar } from '@/components/catalog/FilterBar'
import { cn } from '@/lib/utils'

interface TopBarProps {
  demos: Demo[]
}

export function TopBar({ demos }: TopBarProps) {
  const { openSearch, toggleFilters, isFiltersOpen, activeIndustries, activeTags, activeClients, liveDemo, resetFilters } =
    useCatalogStore()
  const activeCount = activeIndustries.length + activeTags.length + activeClients.length + (liveDemo !== null ? 1 : 0)
  const hasActiveFilters = activeCount > 0

  return (
    <header className="sticky top-0 z-30">
      <div className="flex h-[var(--topbar-height)] items-center justify-between gap-4 px-6">
        <button
          onClick={openSearch}
          className="flex items-center gap-2 h-[36px] rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--axion-card)] px-3 text-[13px] text-[var(--fg-tertiary)] transition-colors hover:border-[var(--border-base)] hover:text-[var(--fg-secondary)]"
        >
          <MagnifyingGlass size={14} />
          <span>Search demos...</span>
          <kbd className="ml-2 rounded-[var(--radius-xs)] bg-[var(--axion-overlay)] border border-[var(--border-subtle)] px-1.5 py-0.5 text-[11px] font-mono text-[var(--fg-tertiary)]">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 h-[36px] rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--axion-card)] px-3 text-[13px] font-medium text-[var(--fg-secondary)] transition-colors hover:bg-[var(--axion-card-hover)]"
            >
              <X size={12} weight="bold" />
              Reset
            </button>
          )}

          <button
            onClick={toggleFilters}
            data-active={isFiltersOpen}
            className={cn(
              'flex items-center gap-2 h-[36px] rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--axion-card)] px-3 text-[13px] font-medium text-[var(--fg-tertiary)] transition-colors hover:border-[var(--border-base)] hover:text-[var(--fg-secondary)]',
              'data-[active=true]:border-[var(--border-base)] data-[active=true]:bg-[rgba(255,255,255,0.05)] data-[active=true]:text-[var(--fg-on-active)]',
            )}
          >
            <FunnelSimple
              size={14}
              weight={isFiltersOpen ? 'fill' : 'regular'}
            />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--fg-primary)] px-1 text-[10px] font-semibold text-[var(--axion-bg)]">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 py-3">
              <FilterBar demos={demos} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
