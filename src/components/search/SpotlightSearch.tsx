'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, ArrowUpRight, Buildings, X } from '@phosphor-icons/react'
import Fuse from 'fuse.js'
import Image from 'next/image'
import type { Project, Product } from '@/types'
import { fuseOptions } from '@/lib/fuse'
import { useCatalogStore } from '@/features/catalog/store'
import { getCoverGradient } from '@/lib/utils'
import { ProductBadge } from '@/components/catalog/ProductBadge'

interface SpotlightSearchProps {
  projects: Project[]
  products: Product[]
}

type SearchResultType = 'project' | 'product' | 'industry'

interface SearchResult {
  type: SearchResultType
  id: string
  title: string
  subtitle?: string
  project?: Project
  product?: Product
  industry?: string
}

export function SpotlightSearch({ projects, products }: SpotlightSearchProps) {
  const { isSearchOpen, closeSearch, setProduct, toggleIndustry } = useCatalogStore()
  const [localQuery, setLocalQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fuse = useMemo(() => new Fuse(projects, fuseOptions), [projects])

  const allIndustries = useMemo(
    () => [...new Set(projects.flatMap((p) => p.industries))].sort(),
    [projects]
  )

  const results: SearchResult[] = useMemo(() => {
    if (localQuery.trim().length < 2) return []

    const items: SearchResult[] = []
    const queryLower = localQuery.toLowerCase()

    const fuseResults = fuse.search(localQuery, { limit: 8 })
    for (const r of fuseResults) {
      items.push({
        type: 'project',
        id: r.item.id,
        title: r.item.title,
        subtitle: r.item.product[0],
        project: r.item,
      })
    }

    const matchingProducts = products.filter((p) =>
      p.name.toLowerCase().includes(queryLower)
    )
    for (const p of matchingProducts) {
      items.push({
        type: 'product',
        id: `product-${p.slug}`,
        title: `Show all ${p.name} projects`,
        product: p,
      })
    }

    const matchingIndustries = allIndustries.filter((i) =>
      i.toLowerCase().includes(queryLower)
    )
    for (const ind of matchingIndustries) {
      items.push({
        type: 'industry',
        id: `industry-${ind}`,
        title: `Filter by ${ind}`,
        industry: ind,
      })
    }

    return items
  }, [localQuery, fuse, products, allIndustries])

  useEffect(() => {
    setActiveIndex(0)
  }, [results])

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
    if (!isSearchOpen) {
      setLocalQuery('')
      setActiveIndex(0)
    }
  }, [isSearchOpen])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isSearchOpen) {
          closeSearch()
        } else {
          useCatalogStore.getState().openSearch()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, closeSearch])

  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.type === 'project' && result.project?.externalUrl) {
        window.open(result.project.externalUrl, '_blank', 'noopener,noreferrer')
      } else if (result.type === 'product' && result.product) {
        setProduct(result.product.slug)
      } else if (result.type === 'industry' && result.industry) {
        toggleIndustry(result.industry)
      }
      closeSearch()
    },
    [setProduct, toggleIndustry, closeSearch]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && results[activeIndex]) {
        e.preventDefault()
        handleSelect(results[activeIndex])
      } else if (e.key === 'Escape') {
        closeSearch()
      }
    },
    [results, activeIndex, handleSelect, closeSearch]
  )

  useEffect(() => {
    if (resultsRef.current) {
      const activeEl = resultsRef.current.querySelector('[data-active="true"]')
      activeEl?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSearch()
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-[640px] mx-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)]"
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center gap-3 h-[56px] px-4 border-b border-[var(--color-border)]">
              <MagnifyingGlass size={20} className="text-[var(--color-text-muted)] flex-shrink-0" />
              <input
                ref={inputRef}
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search projects, tags, industries…"
                className="flex-1 bg-transparent text-[18px] text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] outline-none"
              />
              {localQuery && (
                <button
                  onClick={() => setLocalQuery('')}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <kbd className="rounded-[4px] bg-[var(--color-surface-alt)] border border-[var(--color-border)] px-1.5 py-0.5 text-[11px] font-mono text-[var(--color-text-muted)]">
                esc
              </kbd>
            </div>

            {localQuery.trim().length >= 2 && (
              <div ref={resultsRef} className="max-h-[400px] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <MagnifyingGlass size={28} weight="duotone" className="text-[var(--color-text-subtle)] mb-2" />
                    <p className="text-[14px] text-[var(--color-text)]">
                      No results for &ldquo;{localQuery}&rdquo;
                    </p>
                    <p className="text-[12px] text-[var(--color-text-muted)] mt-1">
                      Try a different keyword or browse by product
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {results.some((r) => r.type === 'project') && (
                      <>
                        <div className="px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-subtle)] font-medium">
                          Projects
                        </div>
                        {results
                          .filter((r) => r.type === 'project')
                          .map((result, idx) => {
                            const globalIdx = results.indexOf(result)
                            return (
                              <button
                                key={result.id}
                                data-active={globalIdx === activeIndex}
                                onClick={() => handleSelect(result)}
                                className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-surface-alt)] transition-colors data-[active=true]:bg-[var(--color-primary)]/10 data-[active=true]:border-l-2 data-[active=true]:border-l-[var(--color-primary)]"
                              >
                                <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--color-surface-alt)]">
                                  {result.project?.coverImage ? (
                                    <Image
                                      src={result.project.coverImage}
                                      alt=""
                                      width={40}
                                      height={40}
                                      className="h-full w-full object-cover"
                                      unoptimized
                                    />
                                  ) : (
                                    <div
                                      className="h-full w-full"
                                      style={{ background: getCoverGradient(result.project?.product[0]) }}
                                    />
                                  )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[14px] font-medium text-[var(--color-text)] truncate">
                                      {result.title}
                                    </span>
                                  </div>
                                  {result.subtitle && (
                                    <ProductBadge name={result.subtitle} />
                                  )}
                                </div>
                                {result.project?.externalUrl && (
                                  <ArrowUpRight size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />
                                )}
                              </button>
                            )
                          })}
                      </>
                    )}

                    {results.some((r) => r.type === 'product') && (
                      <>
                        <div className="px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-subtle)] font-medium">
                          Products
                        </div>
                        {results
                          .filter((r) => r.type === 'product')
                          .map((result) => {
                            const globalIdx = results.indexOf(result)
                            return (
                              <button
                                key={result.id}
                                data-active={globalIdx === activeIndex}
                                onClick={() => handleSelect(result)}
                                className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-surface-alt)] transition-colors data-[active=true]:bg-[var(--color-primary)]/10"
                              >
                                <span
                                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                  style={{ background: result.product?.color }}
                                />
                                <span className="text-[14px] text-[var(--color-text)]">{result.title}</span>
                              </button>
                            )
                          })}
                      </>
                    )}

                    {results.some((r) => r.type === 'industry') && (
                      <>
                        <div className="px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[var(--color-text-subtle)] font-medium">
                          Industries
                        </div>
                        {results
                          .filter((r) => r.type === 'industry')
                          .map((result) => {
                            const globalIdx = results.indexOf(result)
                            return (
                              <button
                                key={result.id}
                                data-active={globalIdx === activeIndex}
                                onClick={() => handleSelect(result)}
                                className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-surface-alt)] transition-colors data-[active=true]:bg-[var(--color-primary)]/10"
                              >
                                <Buildings size={16} className="text-[var(--color-text-muted)] flex-shrink-0" />
                                <span className="text-[14px] text-[var(--color-text)]">{result.title}</span>
                              </button>
                            )
                          })}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 h-[36px] px-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-[4px] bg-[var(--color-surface-alt)] border border-[var(--color-border)] px-1.5 py-0.5 text-[11px] font-mono text-[var(--color-text-muted)]">↑↓</kbd>
                <span className="text-[11px] text-[var(--color-text-muted)]">navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-[4px] bg-[var(--color-surface-alt)] border border-[var(--color-border)] px-1.5 py-0.5 text-[11px] font-mono text-[var(--color-text-muted)]">↵</kbd>
                <span className="text-[11px] text-[var(--color-text-muted)]">open</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-[4px] bg-[var(--color-surface-alt)] border border-[var(--color-border)] px-1.5 py-0.5 text-[11px] font-mono text-[var(--color-text-muted)]">esc</kbd>
                <span className="text-[11px] text-[var(--color-text-muted)]">close</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    typeof document !== 'undefined' ? document.body : (null as unknown as Element)
  )
}
