'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Lock, GlobeSimple } from '@phosphor-icons/react'
import type { Demo } from '@/types'
import { getCoverGradient, formatRelative } from '@/lib/utils'
import { ProductBadge } from '@/components/catalog/ProductBadge'
import { MaterialsList } from './MaterialsList'
import { CredentialsBlock } from './CredentialsBlock'

interface DemoDetailProps {
  demo: Demo
}

export function DemoDetail({ demo }: DemoDetailProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[var(--axion-bg)]">
      <div className="mx-auto max-w-[800px] px-6 py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 h-[36px] px-4 rounded-[var(--radius-md)] text-[14px] font-medium text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)] hover:bg-[var(--axion-overlay)] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="relative w-full aspect-video rounded-[var(--radius-panel)] overflow-hidden mb-8">
          {(demo.coverImage || demo.coverUrl) ? (
            <img
              src={(demo.coverUrl || demo.coverImage)!}
              alt={demo.demoName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: getCoverGradient(demo.product) }}
            />
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          {demo.product && <ProductBadge name={demo.product} />}
          <span className="text-[13px] text-[var(--fg-tertiary)]">
            Updated {formatRelative(demo.updatedAt)}
          </span>
        </div>

        <h1 className="font-[var(--font-display)] text-[32px] font-medium text-[var(--fg-primary)] mb-4">
          {demo.demoName}
        </h1>

        {demo.fullDescription && (
          <p className="text-[14px] text-[var(--fg-secondary)] leading-relaxed whitespace-pre-line mb-8">
            {demo.fullDescription}
          </p>
        )}

        {!demo.fullDescription && demo.description && (
          <p className="text-[14px] text-[var(--fg-secondary)] leading-relaxed mb-8">
            {demo.description}
          </p>
        )}

        <MaterialsList demo={demo} />

        <CredentialsBlock credentials={demo.liveDemoCredentials} />

        {demo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-8">
            {demo.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center h-[28px] px-[10px] rounded-[var(--radius-sm)] text-[12px] font-medium font-[var(--font-mono)] bg-[var(--axion-card)] border border-[var(--border-subtle)] text-[var(--fg-tertiary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-8 pt-6 border-t border-[var(--border-subtle)]">
          {demo.liveDemoUrl && (
            <a
              href={demo.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-[36px] px-4 rounded-[var(--radius-md)] bg-[var(--fg-primary)] text-[var(--axion-bg)] text-[14px] font-medium hover:opacity-90 transition-opacity"
            >
              {demo.liveDemoShareable ? (
                <GlobeSimple size={14} className="text-[var(--color-success)]" />
              ) : (
                <Lock size={14} />
              )}
              Private Demo
              <ArrowUpRight size={14} weight="bold" />
            </a>
          )}
          {demo.liveDemoShareable && demo.liveDemoUrl && (
            <a
              href={demo.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-[36px] px-4 rounded-[var(--radius-md)] bg-[var(--axion-card)] border border-[var(--border-subtle)] text-[var(--fg-secondary)] text-[14px] font-medium hover:bg-[var(--axion-card-hover)] transition-colors"
            >
              <GlobeSimple size={14} className="text-[var(--color-success)]" />
              Shareable Link
              <ArrowUpRight size={14} />
            </a>
          )}
          {demo.viewerLink && (
            <a
              href={demo.viewerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-[36px] px-4 rounded-[var(--radius-md)] bg-[var(--axion-card)] border border-[var(--border-subtle)] text-[var(--fg-secondary)] text-[14px] font-medium hover:bg-[var(--axion-card-hover)] transition-colors"
            >
              Viewer
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
