'use client'

import { create } from 'zustand'

interface CatalogStore {
  query: string
  activeProduct: string | null
  activeIndustries: string[]
  activeTags: string[]
  sortBy: 'updatedAt' | 'title'
  isSearchOpen: boolean
  isFiltersOpen: boolean

  setQuery: (q: string) => void
  setProduct: (slug: string | null) => void
  toggleIndustry: (industry: string) => void
  toggleTag: (tag: string) => void
  setSortBy: (sort: 'updatedAt' | 'title') => void
  resetFilters: () => void
  openSearch: () => void
  closeSearch: () => void
  toggleFilters: () => void
}

export const useCatalogStore = create<CatalogStore>((set) => ({
  query: '',
  activeProduct: null,
  activeIndustries: [],
  activeTags: [],
  sortBy: 'updatedAt',
  isSearchOpen: false,
  isFiltersOpen: false,

  setQuery: (q) => set({ query: q }),
  setProduct: (slug) => set({ activeProduct: slug }),
  toggleIndustry: (industry) =>
    set((state) => ({
      activeIndustries: state.activeIndustries.includes(industry)
        ? state.activeIndustries.filter((i) => i !== industry)
        : [...state.activeIndustries, industry],
    })),
  toggleTag: (tag) =>
    set((state) => ({
      activeTags: state.activeTags.includes(tag)
        ? state.activeTags.filter((t) => t !== tag)
        : [...state.activeTags, tag],
    })),
  setSortBy: (sort) => set({ sortBy: sort }),
  resetFilters: () =>
    set({
      query: '',
      activeProduct: null,
      activeIndustries: [],
      activeTags: [],
    }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleFilters: () => set((state) => ({ isFiltersOpen: !state.isFiltersOpen })),
}))
