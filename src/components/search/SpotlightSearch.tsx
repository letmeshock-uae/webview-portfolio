'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MagnifyingGlass, ArrowUpRight, Buildings, X } from '@phosphor-icons/react'
import Fuse from 'fuse.js'
import type { Demo, Product } from '@/types'
import { fuseOptions } from '@/lib/fuse'
import { useCatalogStore } from '@/features/catalog/store'
import { getCoverGradient } from '@/lib/utils'
import { ProductBadge } from '@/components/catalog/ProductBadge'

interface SpotlightSearchProps {
  demos: Demo[]
  products: Product[]
}

type SearchResultType = 'demo' | 'product' | 'industry'

interface SearchResult {
  type: SearchResultType
  id: string
  title: string
  subtitle?: string
  demo?: Demo
  product?: Product
  industry?: string
}

export function SpotlightSearch({ demos, products }: SpotlightSearchProps) {
  const { isSearchOpen, closeSearch, setProduct, toggleIndustry } =
    useCatalogStore()
  const [localQuery, setLocalQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const nonCoverDemos = useMemo(() => demos.filter((d) => !d.isCover), [demos])
  const fuse = useMemo(() => new Fuse(nonCoverDemos, fuseOptions), [nonCoverDemos])

  const allIndustries = useMemo(
    () => [...new Set(nonCoverDemos.flatMap((d) => d.industries))].sort(),
    [nonCoverDemos],
  )

  const results: SearchResult[] = useMemo(() => {
    if (localQuery.trim().length < 2) return []
    const items: SearchResult[] = []
    const qLower = localQuery.toLowerCase()

    for (const r of fuse.search(localQuery, { limit: 8 })) {
      items.push({
        type: 'demo',
        id: r.item.id,
        title: r.item.demoName,
        subtitle: r.item.product,
        demo: r.item,
      })
    }

    for (const p of products.filter((p) => p.name.toLowerCase().includes(qLower))) {
      items.push({
        type: 'product',
        id: `product-${p.slug}`,
        title: `Show all ${p.name} demos`,
        product: p,
      })
    }

    for (const ind of allIndustries.filter((i) => i.toLowerCase().includes(qLower))) {
      items.push({
        type: 'industry',
        id: `industry-${ind}`,
        title: `Filter by ${ind}`,
        industry: ind,
      })
    }

    return items
  }, [localQuery, fuse, products, allIndustries])

  useEffect(() => { setActiveIndex(0) }, [results])

  useEffect(() => {
    if (isSearchOpen && inputRef.current) inputRef.current.focus()
    if (!isSearchOpen) { setLocalQuery(''); setActiveIndex(0) }
  }, [isSearchOpen])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        isSearchOpen ? closeSearch() : useCatalogStore.getState().openSearch()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, closeSearch])

  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.type === 'demo' && result.demo) {
        window.location.href = `/demo/${result.demo.id}`
      } else if (result.type === 'product' && result.product) {
        setProduct(result.product.slug)
      } else if (result.type === 'industry' && result.industry) {
        toggleIndustry(result.industry)
      }
      closeSearch()
    },
    [setProduct, toggleIndustry, closeSearch],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)) }
      else if (e.key === 'Enter' && results[activeIndex]) { e.preventDefault(); handleSelect(results[activeIndex]) }
      else if (e.key === 'Escape') closeSearch()
    },
    [results, activeIndex, handleSelect, closeSearch],
  )

  useEffect(() => {
    if (resultsRef.current) {
      const el = resultsRef.current.querySelector('[data-active="true"]')
      el?.scrollIntoView({ block: 'nearest' })
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
          onClick={(e) => { if (e.target === e.currentTarget) closeSearch() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            className="axion-panel w-full max-w-[640px] mx-4 overflow-hidden shadow-[var(--shadow-panel)]"
            onKeyDown={handleKeyDown}
          >
            <div className="flex items-center gap-3 h-[56px] px-4 border-b border-[var(--border-subtle)]">
              <MagnifyingGlass size={20} className="text-[var(--fg-tertiary)] flex-shrink-0" />
              <input
                ref={inputRef}
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search demos, tags, industries…"
                className="flex-1 bg-transparent text-[18px] font-[var(--font-display)] text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] outline-none"
              />
              {localQuery && (
                <button onClick={() => setLocalQuery('')} className="text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)]">
                  <X size={16} />
                </button>
              )}
              <kbd className="rounded-[var(--radius-xs)] bg-[var(--axion-overlay)] border border-[var(--border-subtle)] px-1.5 py-0.5 text-[11px] font-mono text-[var(--fg-tertiary)]">
                esc
              </kbd>
            </div>

            {localQuery.trim().length >= 2 && (
              <div ref={resultsRef} className="max-h-[400px] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <MagnifyingGlass size={28} weight="duotone" className="text-[var(--fg-tertiary)] mb-2" />
                    <p className="text-[14px] text-[var(--fg-primary)]">No results for &ldquo;{localQuery}&rdquo;</p>
                    <p className="text-[12px] text-[var(--fg-tertiary)] mt-1">Try a different keyword</p>
                  </div>
                ) : (
                  <div className="py-2">
                    {results.some((r) => r.type === 'demo') && (
                      <>
                        <div className="px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[var(--fg-tertiary)] font-medium">Demos</div>
                        {results.filter((r) => r.type === 'demo').map((result) => {
                          const gi = results.indexOf(result)
                          return (
                            <button
                              key={result.id}
                              data-active={gi === activeIndex}
                              onClick={() => handleSelect(result)}
                              className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-[var(--axion-card-hover)] transition-colors data-[active=true]:bg-[var(--axion-card-hover)]"
                            >
                              <div className="h-10 w-10 rounded-[var(--radius-sm)] overflow-hidden flex-shrink-0 bg-[var(--axion-card)]">
                                {result.demo?.coverImage ? (
                                  <img src={result.demo.coverImage} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full" style={{ background: getCoverGradient(result.demo?.product) }} />
                                )}
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <span className="text-[14px] font-medium text-[var(--fg-primary)] truncate block">{result.title}</span>
                                {result.subtitle && <ProductBadge name={result.subtitle} />}
                              </div>
                              <ArrowUpRight size={14} className="text-[var(--fg-tertiary)] flex-shrink-0" />
                            </button>
                          )
                        })}
                      </>
                    )}

                    {results.some((r) => r.type === 'product') && (
                      <>
                        <div className="px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[var(--fg-tertiary)] font-medium">Products</div>
                        {results.filter((r) => r.type === 'product').map((result) => {
                          const gi = results.indexOf(result)
                          return (
                            <button
                              key={result.id}
                              data-active={gi === activeIndex}
                              onClick={() => handleSelect(result)}
                              className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-[var(--axion-card-hover)] transition-colors data-[active=true]:bg-[var(--axion-card-hover)]"
                            >
                              <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: result.product?.color }} />
                              <span className="text-[14px] text-[var(--fg-secondary)]">{result.title}</span>
                            </button>
                          )
                        })}
                      </>
                    )}

                    {results.some((r) => r.type === 'industry') && (
                      <>
                        <div className="px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[var(--fg-tertiary)] font-medium">Industries</div>
                        {results.filter((r) => r.type === 'industry').map((result) => {
                          const gi = results.indexOf(result)
                          return (
                            <button
                              key={result.id}
                              data-active={gi === activeIndex}
                              onClick={() => handleSelect(result)}
                              className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-[var(--axion-card-hover)] transition-colors data-[active=true]:bg-[var(--axion-card-hover)]"
                            >
                              <Buildings size={16} className="text-[var(--fg-tertiary)] flex-shrink-0" />
                              <span className="text-[14px] text-[var(--fg-secondary)]">{result.title}</span>
                            </button>
                          )
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 h-[36px] px-4 border-t border-[var(--border-subtle)]">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-[var(--radius-xs)] bg-[var(--axion-overlay)] border border-[var(--border-subtle)] px-1.5 py-0.5 text-[11px] font-mono text-[var(--fg-tertiary)]">↑↓</kbd>
                <span className="text-[11px] text-[var(--fg-tertiary)]">navigate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-[var(--radius-xs)] bg-[var(--axion-overlay)] border border-[var(--border-subtle)] px-1.5 py-0.5 text-[11px] font-mono text-[var(--fg-tertiary)]">↵</kbd>
                <span className="text-[11px] text-[var(--fg-tertiary)]">open</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-[var(--radius-xs)] bg-[var(--axion-overlay)] border border-[var(--border-subtle)] px-1.5 py-0.5 text-[11px] font-mono text-[var(--fg-tertiary)]">esc</kbd>
                <span className="text-[11px] text-[var(--fg-tertiary)]">close</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    typeof document !== 'undefined' ? document.body : (null as unknown as Element),
  )
}
