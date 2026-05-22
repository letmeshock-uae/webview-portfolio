'use client'

import { ArrowUpRight, GlobeSimple, Lock } from '@phosphor-icons/react'
import type { Demo } from '@/types'

interface Material {
  label: string
  url: string
  isShareable?: boolean
}

interface MaterialsListProps {
  demo: Demo
}

export function MaterialsList({ demo }: MaterialsListProps) {
  const materials: Material[] = [
    demo.liveDemoUrl ? { label: 'Live Demo', url: demo.liveDemoUrl, isShareable: demo.liveDemoShareable } : null,
    demo.figmaDemoUrl ? { label: 'Figma Demo', url: demo.figmaDemoUrl, isShareable: demo.figmaDemoShareable } : null,
    demo.salesKitUrl ? { label: 'Sales KIT', url: demo.salesKitUrl, isShareable: demo.salesKitShareable } : null,
    demo.viewerLink ? { label: 'Viewer', url: demo.viewerLink } : null,
    demo.websiteUrl ? { label: 'Website', url: demo.websiteUrl } : null,
  ].filter((m): m is Material => m !== null)

  if (materials.length === 0) return null

  return (
    <div className="mb-8">
      <h3 className="text-[14px] font-medium text-[var(--fg-primary)] mb-3">
        Materials
      </h3>
      <div className="rounded-[var(--radius-panel)] bg-[var(--axion-card)] border border-[var(--border-subtle)] overflow-hidden">
        {materials.map((material, i) => (
          <div
            key={material.label}
            className={`flex items-center justify-between px-4 py-3 ${
              i < materials.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-[var(--fg-secondary)]">
                {material.label}
              </span>
              {material.isShareable !== undefined && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-medium"
                  style={{
                    color: material.isShareable
                      ? 'var(--color-success)'
                      : 'var(--fg-tertiary)',
                  }}
                >
                  {material.isShareable ? (
                    <GlobeSimple size={12} />
                  ) : (
                    <Lock size={12} />
                  )}
                  {material.isShareable ? 'Public' : 'Private'}
                </span>
              )}
            </div>
            <a
              href={material.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-[32px] px-3 rounded-[var(--radius-md)] text-[13px] font-medium text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)] hover:bg-[var(--axion-overlay)] transition-colors"
            >
              Open
              <ArrowUpRight size={12} />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
