'use client'

interface ProductBadgeProps {
  name: string
  color?: string
}

const PRODUCT_COLOR_MAP: Record<string, string> = {
  teller: '#6e56cf',
  lansy: '#3dd68c',
  axion: '#f0a050',
}

export function ProductBadge({ name, color }: ProductBadgeProps) {
  const badgeColor = color || PRODUCT_COLOR_MAP[name.toLowerCase()] || '#5b9cf6'

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
