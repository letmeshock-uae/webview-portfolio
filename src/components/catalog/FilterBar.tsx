'use client'

import { X } from '@phosphor-icons/react'
import type { Demo } from '@/types'
import { useCatalogStore } from '@/features/catalog/store'
import { cn, slugify } from '@/lib/utils'

interface FilterBarProps {
  demos: Demo[]
}

export function FilterBar({ demos }: FilterBarProps) {
  const {
    activeProduct,
    activeTags,
    activeIndustries,
    activeClients,
    liveDemo,
    toggleTag,
    toggleIndustry,
    toggleClient,
    setLiveDemo,
  } = useCatalogStore()

  const relevant = activeProduct
    ? demos.filter(
        (d) => !d.isCover && slugify(d.product) === activeProduct,
      )
    : demos.filter((d) => !d.isCover)

  const allTags = [...new Set(relevant.flatMap((d) => d.tags))].filter(
    (t) => t.toLowerCase() !== 'scene demos',
  ).sort()
  const allIndustries = [...new Set(relevant.flatMap((d) => d.industries))].sort()
  const allClients = [...new Set(relevant.map((d) => d.client).filter(Boolean))].sort()
  const hasLiveDemos = relevant.some((d) => d.isLiveDemo)

  if (allTags.length === 0 && allIndustries.length === 0 && allClients.length === 0 && !hasLiveDemos) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-[0.1em] text-[var(--fg-tertiary)] font-medium min-w-[70px]">
            Tags
          </span>
          {allTags.map((tag) => {
            const active = activeTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                data-active={active}
                className={cn(
                  'inline-flex items-center gap-1.5 h-[28px] px-[10px] rounded-[var(--radius-sm)] border text-[12px] font-medium transition-all',
                  'border-[var(--border-subtle)] text-[var(--fg-tertiary)] hover:border-[var(--border-base)] hover:text-[var(--fg-secondary)]',
                  'data-[active=true]:border-[var(--border-base)] data-[active=true]:bg-[rgba(255,255,255,0.05)] data-[active=true]:text-[var(--fg-on-active)]',
                )}
              >
                {tag}
                {active && <X size={10} weight="bold" />}
              </button>
            )
          })}
        </div>
      )}

      {allIndustries.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-[0.1em] text-[var(--fg-tertiary)] font-medium min-w-[70px]">
            Industries
          </span>
          {allIndustries.map((ind) => {
            const active = activeIndustries.includes(ind)
            return (
              <button
                key={ind}
                onClick={() => toggleIndustry(ind)}
                data-active={active}
                className={cn(
                  'inline-flex items-center gap-1.5 h-[28px] px-[10px] rounded-[var(--radius-sm)] border text-[12px] font-medium transition-all',
                  'border-[var(--border-subtle)] text-[var(--fg-tertiary)] hover:border-[var(--border-base)] hover:text-[var(--fg-secondary)]',
                  'data-[active=true]:border-[var(--border-base)] data-[active=true]:bg-[rgba(255,255,255,0.05)] data-[active=true]:text-[var(--fg-on-active)]',
                )}
              >
                {ind}
                {active && <X size={10} weight="bold" />}
              </button>
            )
          })}
        </div>
      )}

      {allClients.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] uppercase tracking-[0.1em] text-[var(--fg-tertiary)] font-medium min-w-[70px]">
            Client
          </span>
          {allClients.map((client) => {
            const active = activeClients.includes(client)
            return (
              <button
                key={client}
                onClick={() => toggleClient(client)}
                data-active={active}
                className={cn(
                  'inline-flex items-center gap-1.5 h-[28px] px-[10px] rounded-[var(--radius-sm)] border text-[12px] font-medium transition-all',
                  'border-[var(--border-subtle)] text-[var(--fg-tertiary)] hover:border-[var(--border-base)] hover:text-[var(--fg-secondary)]',
                  'data-[active=true]:border-[var(--border-base)] data-[active=true]:bg-[rgba(255,255,255,0.05)] data-[active=true]:text-[var(--fg-on-active)]',
                )}
              >
                {client}
                {active && <X size={10} weight="bold" />}
              </button>
            )
          })}
        </div>
      )}

      {hasLiveDemos && (
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-[0.1em] text-[var(--fg-tertiary)] font-medium min-w-[70px]">
            Live Demo
          </span>
          <button
            onClick={() => setLiveDemo(liveDemo === true ? null : true)}
            className="relative w-[44px] h-[24px] rounded-full transition-colors duration-150 cursor-pointer"
            style={{
              background: liveDemo === true ? 'var(--color-success)' : 'var(--axion-card)',
              border: `1px solid ${liveDemo === true ? 'var(--color-success)' : 'var(--border-subtle)'}`,
            }}
          >
            <span
              className="absolute top-[1px] left-[1px] w-[20px] h-[20px] rounded-full bg-[var(--fg-primary)] transition-transform duration-150"
              style={{ transform: liveDemo === true ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </button>
        </div>
      )}
    </div>
  )
}
