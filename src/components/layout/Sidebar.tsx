'use client'

import { DotOutline, SidebarSimple, GridFour } from '@phosphor-icons/react'
import type { Product } from '@/types'
import { useCatalogStore } from '@/features/catalog/store'
import { cn } from '@/lib/utils'

interface SidebarProps {
  products: Product[]
}

export function Sidebar({ products }: SidebarProps) {
  const { activeProduct, setProduct } = useCatalogStore()

  return (
    <aside className="hidden sm:flex fixed left-0 top-0 bottom-0 w-[var(--sidebar-width)] items-stretch p-3">
      <div className="flex h-full w-full flex-col justify-between overflow-hidden rounded-tl-[24px] rounded-tr-[24px] rounded-bl-[24px] rounded-br-[8px] bg-white/[0.04] p-[8px]">
        {/* Header */}
        <div className="flex items-center gap-[12px] rounded-tl-[16px] rounded-tr-[16px] rounded-bl-[12px] rounded-br-[12px] bg-white/5 p-[6px]">
          <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[10px] bg-white/10 flex-shrink-0">
            <span className="text-white text-[20px] font-semibold">D</span>
          </div>
          <div className="flex flex-col gap-[2px]">
            <span className="font-[var(--font-sans)] text-[16px] font-medium text-white leading-normal">
              Datum
            </span>
            <span className="font-[var(--font-sans)] text-[12px] font-normal text-[#797979] leading-[10px]">
              Organization
            </span>
          </div>
        </div>

        {/* Spacer top */}
        <div className="flex-1" />

        {/* Navigation */}
        <nav className="flex flex-col gap-[8px] px-[6px]">
          <button
            onClick={() => setProduct(null)}
            data-active={activeProduct === null}
            className={cn(
              "flex w-full items-center gap-[12px] rounded-[8px] h-[36px] pl-[12px] pr-[16px] py-[8px] text-left text-[14px] font-medium transition-colors",
              "text-[#9e9e9e] hover:bg-white/5 hover:text-[#fdfdfd]",
              "data-[active=true]:bg-white/5 data-[active=true]:text-[#fdfdfd]"
            )}
          >
            <GridFour size={20} weight={activeProduct === null ? 'fill' : 'regular'} className="flex-shrink-0" />
            <span className="text-left">All Projects</span>
          </button>

          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => setProduct(product.slug)}
              data-active={activeProduct === product.slug}
              className={cn(
                "flex w-full items-center gap-[12px] rounded-[8px] h-[36px] pl-[12px] pr-[16px] py-[8px] text-left text-[14px] font-medium transition-colors",
                "text-[#9e9e9e] hover:bg-white/5 hover:text-[#fdfdfd]",
                "data-[active=true]:bg-white/5 data-[active=true]:text-[#fdfdfd]"
              )}
            >
              <DotOutline size={20} weight="fill" className="flex-shrink-0" style={{ color: product.color }} />
              <span className="text-left truncate">{product.name === 'External LCC Studio by XGrids' ? 'External Project' : product.name}</span>
            </button>
          ))}
        </nav>

        {/* Spacer bottom */}
        <div className="flex-1" />

        {/* Bottom */}
        <div className="px-[6px] pt-[16px]">
          <button className="flex w-full items-center gap-[12px] rounded-[8px] h-[36px] px-[12px] py-[8px] text-[14px] font-medium text-[#fdfdfd] hover:bg-white/5 transition-colors">
            <SidebarSimple size={20} />
            Collapse
          </button>
        </div>
      </div>
    </aside>
  )
}
