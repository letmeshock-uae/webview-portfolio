'use client'

import { X } from '@phosphor-icons/react'
import type { Project } from '@/types'
import { useCatalogStore } from '@/features/catalog/store'
import { cn, slugify } from '@/lib/utils'

interface FilterBarProps {
  projects: Project[]
}

export function FilterBar({ projects }: FilterBarProps) {
  const { activeProduct, activeIndustries, activeTags, toggleIndustry, toggleTag } =
    useCatalogStore()

  const relevantProjects = activeProduct
    ? projects.filter((p) => p.product.some((prod) => slugify(prod) === activeProduct))
    : projects

  const allIndustries = [...new Set(relevantProjects.flatMap((p) => p.industries))].sort()
  const allTags = [...new Set(relevantProjects.flatMap((p) => p.tags))].sort()

  if (allIndustries.length === 0 && allTags.length === 0) return null

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1">
      <div className="flex items-center gap-1.5 flex-wrap">
        {allIndustries.map((industry) => {
          const active = activeIndustries.includes(industry)
          return (
            <button
              key={`ind-${industry}`}
              onClick={() => toggleIndustry(industry)}
              data-active={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-1 text-[12px] font-medium text-[var(--color-text-muted)] transition-all hover:border-[var(--color-primary)]",
                "data-[active=true]:border-[var(--color-primary)] data-[active=true]:bg-[var(--color-primary)]/10 data-[active=true]:text-[var(--color-primary)]"
              )}
            >
              {industry}
              {active && <X size={12} weight="bold" />}
            </button>
          )
        })}

        {allTags.map((tag) => {
          const active = activeTags.includes(tag)
          return (
            <button
              key={`tag-${tag}`}
              onClick={() => toggleTag(tag)}
              data-active={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-1 text-[12px] font-medium text-[var(--color-text-muted)] transition-all hover:border-[var(--color-primary)]",
                "data-[active=true]:border-[var(--color-primary)] data-[active=true]:bg-[var(--color-primary)]/10 data-[active=true]:text-[var(--color-primary)]"
              )}
            >
              {tag}
              {active && <X size={12} weight="bold" />}
            </button>
          )
        })}
      </div>

    </div>
  )
}
