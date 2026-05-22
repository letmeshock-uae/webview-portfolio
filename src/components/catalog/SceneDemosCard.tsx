'use client'

import { motion } from 'framer-motion'
import { FilmSlate, CaretRight } from '@phosphor-icons/react'
import { useCatalogStore } from '@/features/catalog/store'

interface SceneDemosCardProps {
  count: number
  coverImage?: string | null
}

export function SceneDemosCard({ count, coverImage }: SceneDemosCardProps) {
  const toggleSceneDemos = useCatalogStore((s) => s.toggleSceneDemos)

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={toggleSceneDemos}
      className="relative flex flex-col rounded-[var(--radius-panel)] border border-[var(--color-teller)] bg-[var(--axion-card)] p-5 transition-all duration-150 hover:bg-[var(--axion-card-hover)] cursor-pointer text-left w-full h-full overflow-hidden"
    >
      {coverImage && (
        <img
          src={coverImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      )}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <FilmSlate size={20} weight="fill" className="text-[var(--color-teller)]" />
          <h3 className="font-[var(--font-display)] text-[16px] font-medium text-[var(--fg-primary)]">
            Scene Demos
          </h3>
        </div>
        <p className="text-[14px] text-[var(--fg-tertiary)] mb-4">
          3DGS scene library covering the full range of environments
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-[28px] font-[var(--font-display)] font-medium text-[var(--fg-primary)]">
            {count}
          </span>
          <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-teller)]">
            View all
            <CaretRight size={14} weight="bold" />
          </span>
        </div>
      </div>
    </motion.button>
  )
}
