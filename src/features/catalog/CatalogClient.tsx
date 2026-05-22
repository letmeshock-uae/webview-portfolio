'use client'

import type { Demo, Product } from '@/types'
import { useCatalog } from './useCatalog'
import { useCatalogStore } from './store'
import { findHeroForProduct } from '@/lib/data-client'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { MobileNav } from '@/components/layout/MobileNav'
import { HeroCover } from '@/components/catalog/HeroCover'
import { DemoGrid } from '@/components/catalog/DemoGrid'
import { SceneDemosSection } from '@/components/catalog/SceneDemosSection'
import { SpotlightSearch } from '@/components/search/SpotlightSearch'

interface CatalogClientProps {
  demos: Demo[]
  products: Product[]
}

export function CatalogClient({ demos, products }: CatalogClientProps) {
  const { regularDemos, sceneDemos, sceneDemosCount } = useCatalog(demos)
  const activeProduct = useCatalogStore((s) => s.activeProduct)
  const isSceneDemosOpen = useCatalogStore((s) => s.isSceneDemosOpen)
  const isSidebarCollapsed = useCatalogStore((s) => s.isSidebarCollapsed)
  const sidebarWidth = isSidebarCollapsed ? '72px' : 'var(--sidebar-width)'

  const hero = findHeroForProduct(demos, activeProduct)

  return (
    <>
      <Sidebar products={products} />
      <SpotlightSearch demos={demos} products={products} />

      <div
        className="hidden sm:block"
        style={{
          position: 'fixed',
          top: 0,
          left: `calc(${sidebarWidth} + var(--gutter))`,
          right: 0,
          height: 'calc(var(--topbar-height) + 80px)',
          pointerEvents: 'none',
          zIndex: 25,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 100%)',
          transition: 'left 200ms',
        }}
      />

      <div
        className="sm:transition-all sm:duration-200"
        style={{ paddingLeft: 'var(--applied-sidebar-width)' }}
      >
        <style>{`
          :root { --applied-sidebar-width: 0px; }
          @media (min-width: 640px) { :root { --applied-sidebar-width: calc(${sidebarWidth} + var(--gutter)); } }
        `}</style>

        <TopBar demos={demos} />
        <MobileNav products={products} />

        <main className="mx-auto max-w-[var(--content-max-w)] px-6 py-6 flex flex-col gap-6">
          {hero && <HeroCover hero={hero} />}

          <div className="flex items-center justify-between">
            <h1 className="font-[var(--font-display)] text-[20px] font-medium text-[var(--fg-primary)]">
              {activeProduct
                ? products.find((p) => p.slug === activeProduct)?.name || 'Demos'
                : 'All Projects'}
            </h1>
            <span className="text-[13px] text-[var(--fg-tertiary)]">
              {regularDemos.length + sceneDemosCount} demo
              {regularDemos.length + sceneDemosCount !== 1 ? 's' : ''}
            </span>
          </div>

          {isSceneDemosOpen && activeProduct === 'datum-teller' ? (
            <SceneDemosSection demos={sceneDemos} />
          ) : (
            <DemoGrid
              demos={regularDemos}
              sceneDemos={sceneDemos}
              sceneDemosCount={sceneDemosCount}
            />
          )}
        </main>
      </div>
    </>
  )
}
