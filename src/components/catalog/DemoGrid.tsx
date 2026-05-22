'use client'

import { AnimatePresence } from 'framer-motion'
import type { Demo } from '@/types'
import { DemoCard } from './DemoCard'
import { SceneDemosCard } from './SceneDemosCard'
import { EmptyState } from './EmptyState'
import { useCatalogStore } from '@/features/catalog/store'

interface DemoGridProps {
  demos: Demo[]
  sceneDemos?: Demo[]
  sceneDemosCount?: number
}

export function DemoGrid({ demos, sceneDemos = [], sceneDemosCount = 0 }: DemoGridProps) {
  const activeProduct = useCatalogStore((s) => s.activeProduct)
  const showSceneCard = activeProduct === 'datum-teller' && sceneDemosCount > 0

  if (demos.length === 0 && !showSceneCard) {
    return <EmptyState />
  }

  const sceneThumbnails = sceneDemos
    .map((d) => d.coverUrl || d.coverImage)
    .filter((url): url is string => !!url)

  return (
    <div className="project-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
      <AnimatePresence mode="popLayout">
        {showSceneCard && (
          <SceneDemosCard key="scene-demos" count={sceneDemosCount} thumbnails={sceneThumbnails} />
        )}
        {demos.map((demo) => (
          <DemoCard key={demo.id} demo={demo} />
        ))}
      </AnimatePresence>
    </div>
  )
}
