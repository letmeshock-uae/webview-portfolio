'use client'

import { PRODUCTS } from '@/types'

interface ProductBadgeProps {
  name: string
  color?: string
}

export function ProductBadge({ name, color }: ProductBadgeProps) {
  const found = PRODUCTS.find(
    (p) => p.name.toLowerCase() === name.toLowerCase(),
  )
  const badgeColor = color || found?.color || '#5b9cf6'

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        backgroundColor: `${badgeColor}15`,
        color: badgeColor,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: badgeColor }}
      />
      {name}
    </span>
  )
}
