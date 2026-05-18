'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { MagnifyingGlass, FunnelSimple, X } from '@phosphor-icons/react'
import type { Project } from '@/types'
import { useCatalogStore } from '@/features/catalog/store'
import { FilterBar } from '@/components/catalog/FilterBar'
import { cn } from '@/lib/utils'

interface TopBarProps {
  projects: Project[]
}

export function TopBar({ projects }: TopBarProps) {
  const { openSearch, toggleFilters, isFiltersOpen, activeIndustries, activeTags, activeProduct, resetFilters } = useCatalogStore()
  const activeCount = activeIndustries.length + activeTags.length
  const hasActiveFilters = activeIndustries.length > 0 || activeTags.length > 0 || activeProduct !== null

  return (
    <header className="sticky top-0 z-30">
      <div className="flex h-[var(--topbar-height)] items-center justify-between gap-4 px-6">
        <button
          onClick={openSearch}
          className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[13px] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
        >
          <MagnifyingGlass size={14} />
          <span>Search projects...</span>
          <kbd className="ml-2 rounded-[4px] bg-[var(--color-surface-alt)] border border-[var(--color-border)] px-1.5 py-0.5 text-[11px] font-mono text-[var(--color-text-subtle)]">
            ⌘K
          </kbd>
        </button>

      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/10"
          >
            <X size={12} weight="bold" />
            <span>Reset</span>
          </button>
        )}

        <button
          onClick={toggleFilters}
          data-active={isFiltersOpen}
          className={cn(
            "flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-text)]",
            "data-[active=true]:border-[var(--color-primary)] data-[active=true]:bg-[var(--color-primary)]/10 data-[active=true]:text-[var(--color-primary)]"
          )}
        >
          <FunnelSimple size={14} weight={isFiltersOpen ? 'fill' : 'regular'} />
          <span>Filters</span>
        {activeCount > 0 && (
          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-semibold text-[var(--color-primary-fg)]">
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
              <FilterBar projects={projects} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
