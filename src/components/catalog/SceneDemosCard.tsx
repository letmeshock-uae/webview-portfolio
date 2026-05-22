'use client'

import { motion } from 'framer-motion'
import { FilmSlate, CaretRight } from '@phosphor-icons/react'
import { useCatalogStore } from '@/features/catalog/store'

interface SceneDemosCardProps {
  count: number
  thumbnails: string[]
}

export function SceneDemosCard({ count, thumbnails }: SceneDemosCardProps) {
  const toggleSceneDemos = useCatalogStore((s) => s.toggleSceneDemos)

  const doubled = [...thumbnails, ...thumbnails]

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={toggleSceneDemos}
      className="relative flex flex-col rounded-[var(--radius-panel)] border border-[var(--color-teller)] bg-[var(--axion-card)] p-5 transition-all duration-150 hover:bg-[var(--axion-card-hover)] cursor-pointer text-left w-full h-full overflow-hidden"
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-2">
          <FilmSlate size={20} weight="fill" className="text-[var(--color-teller)]" />
          <h3 className="font-[var(--font-display)] text-[16px] font-medium text-[var(--fg-primary)]">
            Scene Demos
          </h3>
        </div>
        <p className="text-[14px] text-[var(--fg-tertiary)]">
          3DGS scene library covering the full range of environments
        </p>

        {thumbnails.length > 0 && (
          <div className="relative flex-1 flex items-center overflow-hidden rounded-[var(--radius-md)] my-3 -mx-5">
            <div className="absolute inset-y-0 left-0 w-8 z-10 bg-gradient-to-r from-[var(--axion-card)] to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-[var(--axion-card)] to-transparent pointer-events-none" />
            <div className="flex gap-4 animate-marquee items-center">
              {doubled.map((src, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[216px] h-[144px] rounded-[var(--radius-sm)] overflow-hidden"
                  style={{ transform: `rotate(${((i * 7 + 3) % 11) - 5}deg)` }}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
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
