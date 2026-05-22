'use client'

import { GridFour } from '@phosphor-icons/react'
import type { Product } from '@/types'
import { useCatalogStore } from '@/features/catalog/store'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  products: Product[]
}

export function MobileNav({ products }: MobileNavProps) {
  const { activeProduct, setProduct } = useCatalogStore()

  return (
    <div className="sm:hidden overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--axion-panel)]">
      <div className="flex items-center gap-1 px-4 py-2 min-w-max">
        <button
          onClick={() => setProduct(null)}
          data-active={activeProduct === null}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors whitespace-nowrap',
            'text-[var(--fg-tertiary)] hover:bg-[var(--axion-card)]',
            'data-[active=true]:bg-[rgba(255,255,255,0.05)] data-[active=true]:text-[var(--fg-on-active)]',
          )}
        >
          <GridFour
            size={14}
            weight={activeProduct === null ? 'fill' : 'regular'}
          />
          All
        </button>

        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => setProduct(product.slug)}
            data-active={activeProduct === product.slug}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors whitespace-nowrap',
              'text-[var(--fg-tertiary)] hover:bg-[var(--axion-card)]',
              'data-[active=true]:bg-[rgba(255,255,255,0.05)] data-[active=true]:text-[var(--fg-on-active)]',
            )}
          >
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ background: product.color }}
            />
            {product.name}
          </button>
        ))}
      </div>
    </div>
  )
}
