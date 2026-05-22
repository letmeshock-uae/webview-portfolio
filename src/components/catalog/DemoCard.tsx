'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Lock, GlobeSimple } from '@phosphor-icons/react'
import Link from 'next/link'
import type { Demo } from '@/types'
import { getCoverGradient } from '@/lib/utils'

interface DemoCardProps {
  demo: Demo
}

export function DemoCard({ demo }: DemoCardProps) {
  return (
    <Link href={`/demo/${demo.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="group flex flex-col rounded-[var(--radius-panel)] border border-[var(--border-subtle)] bg-[var(--axion-card)] p-5 transition-all duration-150 hover:bg-[var(--axion-card-hover)] hover:border-[var(--border-base)] cursor-pointer h-full"
      >
        {(demo.coverImage || demo.coverUrl) && (
          <div className="relative w-full aspect-video rounded-[var(--radius-md)] overflow-hidden mb-4">
            <img
              src={(demo.coverUrl || demo.coverImage)!}
              alt={demo.demoName}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {!demo.coverImage && !demo.coverUrl && (
          <div
            className="w-full aspect-video rounded-[var(--radius-md)] mb-4"
            style={{ background: getCoverGradient(demo.product) }}
          />
        )}

        <h3 className="font-[var(--font-display)] text-[16px] font-medium text-[var(--fg-primary)] mb-1.5">
          {demo.demoName}
        </h3>

        {demo.description && (
          <p className="text-[14px] text-[var(--fg-tertiary)] leading-relaxed line-clamp-2 mb-3">
            {demo.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {demo.tags.filter(t => t.toLowerCase() !== 'scene demos').map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center h-[22px] px-2 rounded-[var(--radius-xs)] text-[11px] font-medium font-[var(--font-mono)] bg-[var(--axion-card)] border border-[var(--border-subtle)] text-[var(--fg-tertiary)]"
            >
              {tag}
            </span>
          ))}
          {demo.status && (
            <span
              className="inline-flex items-center h-[22px] px-2 rounded-[var(--radius-xs)] text-[11px] font-medium font-[var(--font-mono)]"
              style={{
                background: demo.status === 'Active' ? 'rgba(59,199,125,0.1)' : 'rgba(255,205,41,0.1)',
                color: demo.status === 'Active' ? 'var(--color-success)' : 'var(--color-warning)',
              }}
            >
              {demo.status}
            </span>
          )}
          {demo.industries.slice(0, 2).map((ind) => (
            <span
              key={ind}
              className="inline-flex items-center h-[22px] px-2 rounded-[var(--radius-xs)] text-[11px] font-medium font-[var(--font-mono)] bg-[var(--axion-card)] border border-[var(--border-subtle)] text-[var(--fg-tertiary)]"
            >
              {ind}
            </span>
          ))}
        </div>

        {(demo.liveDemoUrl || demo.liveDemoShareable) && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
            {demo.liveDemoUrl && (
              <a
                href={demo.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 h-[32px] px-3 rounded-[var(--radius-md)] bg-[var(--axion-card)] border border-[var(--border-subtle)] text-[12px] font-medium text-[var(--fg-secondary)] hover:bg-[var(--axion-card-hover)] transition-colors"
              >
                {demo.liveDemoShareable ? (
                  <GlobeSimple size={12} className="text-[var(--color-success)]" />
                ) : (
                  <Lock size={12} />
                )}
                Private Demo
                <ArrowUpRight size={10} />
              </a>
            )}
            {demo.liveDemoShareable && demo.liveDemoUrl && (
              <a
                href={demo.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 h-[32px] px-3 rounded-[var(--radius-md)] bg-[var(--axion-card)] border border-[var(--border-subtle)] text-[12px] font-medium text-[var(--fg-secondary)] hover:bg-[var(--axion-card-hover)] transition-colors"
              >
                <GlobeSimple size={12} className="text-[var(--color-success)]" />
                Shareable Link
                <ArrowUpRight size={10} />
              </a>
            )}
          </div>
        )}
      </motion.div>
    </Link>
  )
}
