'use client'

import { EnvelopeSimple, ArrowUpRight } from '@phosphor-icons/react'
import type { ProductHero } from '@/types'
import { getCoverGradient } from '@/lib/utils'

interface HeroCoverProps {
  hero: ProductHero
}

export function HeroCover({ hero }: HeroCoverProps) {
  const handleShare = () => {
    const subject = encodeURIComponent(`${hero.productName} — Sales KIT`)
    const body = encodeURIComponent(
      `Check out the ${hero.productName} Sales KIT:\n${hero.salesKitUrl || hero.websiteUrl || ''}`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-panel)] min-h-[240px]">
      {hero.backgroundImage ? (
        <img
          src={hero.backgroundImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: getCoverGradient(hero.productName) }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

      <div className="relative z-10 flex flex-col justify-end min-h-[240px] p-8">
        <h2 className="font-[var(--font-display)] text-[32px] font-medium text-[var(--fg-primary)] mb-2">
          {hero.productName}
        </h2>
        {hero.description && (
          <p className="text-[14px] text-[var(--fg-secondary)] max-w-[600px] mb-6 leading-relaxed">
            {hero.description}
          </p>
        )}
        <div className="flex items-center gap-3">
          {hero.salesKitUrl && (
            <a
              href={hero.salesKitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-[36px] px-4 rounded-[var(--radius-md)] bg-[var(--fg-primary)] text-[var(--axion-bg)] text-[14px] font-medium hover:opacity-90 transition-opacity"
            >
              Sales KIT
              <ArrowUpRight size={14} weight="bold" />
            </a>
          )}
          {(hero.salesKitUrl || hero.websiteUrl) && (
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 h-[36px] px-4 rounded-[var(--radius-md)] text-[var(--fg-tertiary)] text-[14px] font-medium hover:text-[var(--fg-secondary)] hover:bg-[var(--axion-overlay)] transition-colors"
            >
              <EnvelopeSimple size={16} />
              Share
            </button>
          )}
          {hero.websiteUrl && (
            <a
              href={hero.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-[36px] px-4 rounded-[var(--radius-md)] text-[var(--fg-tertiary)] text-[14px] font-medium hover:text-[var(--fg-secondary)] hover:bg-[var(--axion-overlay)] transition-colors"
            >
              Website
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
