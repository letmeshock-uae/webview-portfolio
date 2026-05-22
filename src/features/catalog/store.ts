'use client'

import { create } from 'zustand'

interface CatalogStore {
  activeProduct: string | null
  isSearchOpen: boolean
  isFiltersOpen: boolean
  activeTags: string[]
  activeIndustries: string[]
  activeClients: string[]
  liveDemo: boolean | null
  sortBy: 'updatedAt' | 'demoName'
  isSidebarCollapsed: boolean
  isSceneDemosOpen: boolean

  setProduct: (slug: string | null) => void
  openSearch: () => void
  closeSearch: () => void
  toggleFilters: () => void
  toggleTag: (tag: string) => void
  toggleIndustry: (industry: string) => void
  toggleClient: (client: string) => void
  setLiveDemo: (val: boolean | null) => void
  setSortBy: (sort: 'updatedAt' | 'demoName') => void
  resetFilters: () => void
  toggleSidebar: () => void
  toggleSceneDemos: () => void
  closeSceneDemos: () => void
}

export const useCatalogStore = create<CatalogStore>((set) => ({
  activeProduct: null,
  isSearchOpen: false,
  isFiltersOpen: false,
  activeTags: [],
  activeIndustries: [],
  activeClients: [],
  liveDemo: null,
  sortBy: 'updatedAt',
  isSidebarCollapsed: false,
  isSceneDemosOpen: false,

  setProduct: (slug) =>
    set({
      activeProduct: slug,
      activeTags: [],
      activeIndustries: [],
      activeClients: [],
      liveDemo: null,
      isSceneDemosOpen: false,
    }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleFilters: () => set((s) => ({ isFiltersOpen: !s.isFiltersOpen })),
  toggleTag: (tag) =>
    set((s) => ({
      activeTags: s.activeTags.includes(tag)
        ? s.activeTags.filter((t) => t !== tag)
        : [...s.activeTags, tag],
    })),
  toggleIndustry: (industry) =>
    set((s) => ({
      activeIndustries: s.activeIndustries.includes(industry)
        ? s.activeIndustries.filter((i) => i !== industry)
        : [...s.activeIndustries, industry],
    })),
  toggleClient: (client) =>
    set((s) => ({
      activeClients: s.activeClients.includes(client)
        ? s.activeClients.filter((c) => c !== client)
        : [...s.activeClients, client],
    })),
  setLiveDemo: (val) => set({ liveDemo: val }),
  setSortBy: (sort) => set({ sortBy: sort }),
  resetFilters: () =>
    set({ activeTags: [], activeIndustries: [], activeClients: [], liveDemo: null }),
  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  toggleSceneDemos: () => set((s) => ({ isSceneDemosOpen: !s.isSceneDemosOpen })),
  closeSceneDemos: () => set({ isSceneDemosOpen: false }),
}))
