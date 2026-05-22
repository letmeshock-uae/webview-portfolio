'use client'

import { ArrowLeft } from '@phosphor-icons/react'
import { AnimatePresence } from 'framer-motion'
import type { Demo } from '@/types'
import { useCatalogStore } from '@/features/catalog/store'
import { DemoCard } from './DemoCard'

interface SceneDemosSectionProps {
  demos: Demo[]
}

export function SceneDemosSection({ demos }: SceneDemosSectionProps) {
  const closeSceneDemos = useCatalogStore((s) => s.closeSceneDemos)

  return (
    <div>
      <button
        onClick={closeSceneDemos}
        className="inline-flex items-center gap-2 mb-5 h-[36px] px-4 rounded-[var(--radius-md)] text-[14px] font-medium text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)] hover:bg-[var(--axion-overlay)] transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Datum Teller
      </button>

      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[var(--font-display)] text-[20px] font-medium text-[var(--fg-primary)]">
          Scene Demos
        </h2>
        <span className="text-[13px] text-[var(--fg-tertiary)]">
          {demos.length} scene{demos.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="project-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {demos.map((demo) => (
            <DemoCard key={demo.id} demo={demo} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
