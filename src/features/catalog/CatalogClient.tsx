'use client'

import type { Project, Product } from '@/types'
import { useCatalog } from './useCatalog'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { MobileNav } from '@/components/layout/MobileNav'
import { ProjectGrid } from '@/components/catalog/ProjectGrid'
import { SpotlightSearch } from '@/components/search/SpotlightSearch'

interface CatalogClientProps {
  projects: Project[]
  products: Product[]
}

export function CatalogClient({ projects, products }: CatalogClientProps) {
  const filteredProjects = useCatalog(projects)

  return (
    <>
      <Sidebar products={products} />
      <SpotlightSearch projects={projects} products={products} />

      <div
        className="hidden sm:block"
        style={{
          position: 'fixed',
          top: 0,
          left: 'var(--sidebar-width)',
          right: 0,
          height: 'calc(var(--topbar-height) + 100px)',
          pointerEvents: 'none',
          zIndex: 25,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 100%)',
        }}
      />

      <div className="sm:pl-[var(--sidebar-width)]">
        <TopBar projects={projects} />
        <MobileNav products={products} />

        <main className="mx-auto max-w-[var(--content-max-w)] px-6 py-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h1 className="font-[var(--font-display)] text-[20px] font-semibold text-[var(--color-text)]">
              Projects
            </h1>
            <span className="text-[13px] text-[var(--color-text-muted)]">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            </span>
          </div>

          <ProjectGrid projects={filteredProjects} />
        </main>
      </div>
    </>
  )
}
