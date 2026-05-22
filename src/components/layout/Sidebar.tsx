'use client'

import { DotOutline, SidebarSimple, GridFour } from '@phosphor-icons/react'
import type { Product } from '@/types'
import { useCatalogStore } from '@/features/catalog/store'
import { cn } from '@/lib/utils'

interface SidebarProps {
  products: Product[]
}

export function Sidebar({ products }: SidebarProps) {
  const { activeProduct, setProduct, isSidebarCollapsed, toggleSidebar } =
    useCatalogStore()

  return (
    <aside
      className="hidden sm:flex fixed left-0 top-0 bottom-0 items-stretch transition-all duration-200"
      style={{
        width: isSidebarCollapsed ? '72px' : 'var(--sidebar-width)',
        padding: 'var(--gutter)',
      }}
    >
      <div className="axion-panel flex h-full w-full flex-col justify-between overflow-hidden p-2">
        {isSidebarCollapsed ? (
          <div className="flex items-center justify-center">
            <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.1)] flex-shrink-0">
              <span className="text-[var(--fg-primary)] text-[16px] font-semibold">D</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.05)] p-1.5">
            <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.1)] flex-shrink-0">
              <span className="text-[var(--fg-primary)] text-[20px] font-semibold">D</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[16px] font-medium text-[var(--fg-primary)] leading-normal">
                Datum
              </span>
              <span className="text-[12px] text-[var(--fg-tertiary)] leading-[10px]">
                Organization
              </span>
            </div>
          </div>
        )}

        <div className="flex-1" />

        <nav
          className={cn(
            'flex flex-col gap-1',
            isSidebarCollapsed ? 'px-1 items-center' : 'px-1.5',
          )}
        >
          <button
            onClick={() => setProduct(null)}
            data-active={activeProduct === null}
            title={isSidebarCollapsed ? 'All Projects' : undefined}
            className={cn(
              'flex items-center rounded-[var(--radius-md)] h-[36px] text-left text-[14px] font-medium transition-colors',
              'text-[var(--fg-tertiary)] hover:bg-[var(--axion-card)] hover:text-[var(--fg-secondary)]',
              'data-[active=true]:bg-[var(--axion-card)] data-[active=true]:text-[var(--fg-on-active)]',
              isSidebarCollapsed
                ? 'w-[36px] justify-center'
                : 'w-full gap-3 pl-3 pr-4 py-2',
            )}
          >
            <GridFour
              size={20}
              weight={activeProduct === null ? 'fill' : 'regular'}
              className="flex-shrink-0"
            />
            {!isSidebarCollapsed && <span>All Projects</span>}
          </button>

          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => setProduct(product.slug)}
              data-active={activeProduct === product.slug}
              title={isSidebarCollapsed ? product.name : undefined}
              className={cn(
                'flex items-center rounded-[var(--radius-md)] h-[36px] text-left text-[14px] font-medium transition-colors',
                'text-[var(--fg-tertiary)] hover:bg-[var(--axion-card)] hover:text-[var(--fg-secondary)]',
                'data-[active=true]:bg-[var(--axion-card)] data-[active=true]:text-[var(--fg-on-active)]',
                isSidebarCollapsed
                  ? 'w-[36px] justify-center'
                  : 'w-full gap-3 pl-3 pr-4 py-2',
              )}
            >
              <DotOutline
                size={20}
                weight="fill"
                className="flex-shrink-0"
                style={{ color: product.color }}
              />
              {!isSidebarCollapsed && (
                <span className="truncate">{product.name}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        <div
          className={cn(
            'pt-4',
            isSidebarCollapsed ? 'px-1 flex justify-center' : 'px-1.5',
          )}
        >
          <button
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? 'Expand' : 'Collapse'}
            className={cn(
              'flex items-center rounded-[var(--radius-md)] h-[36px] text-[14px] font-medium text-[var(--fg-on-active)] hover:bg-[var(--axion-card)] transition-colors',
              isSidebarCollapsed
                ? 'w-[36px] justify-center'
                : 'w-full gap-3 px-3 py-2',
            )}
          >
            <SidebarSimple
              size={20}
              className={cn(
                'transition-transform',
                isSidebarCollapsed && 'rotate-180',
              )}
            />
            {!isSidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}
