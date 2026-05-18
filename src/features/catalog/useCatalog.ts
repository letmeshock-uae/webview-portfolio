'use client'

import { useMemo } from 'react'
import Fuse from 'fuse.js'
import type { Project } from '@/types'
import { fuseOptions } from '@/lib/fuse'
import { slugify } from '@/lib/utils'
import { useCatalogStore } from './store'

export function useCatalog(projects: Project[]) {
  const { query, activeProduct, activeIndustries, activeTags, sortBy } = useCatalogStore()

  const fuse = useMemo(() => new Fuse(projects, fuseOptions), [projects])

  const filtered = useMemo(() => {
    let result = projects

    if (query.trim().length >= 2) {
      result = fuse.search(query).map((r) => r.item)
    }

    if (activeProduct) {
      result = result.filter((p) =>
        p.product.some((prod) => slugify(prod) === activeProduct)
      )
    }

    if (activeIndustries.length > 0) {
      result = result.filter((p) =>
        activeIndustries.every((ind) => p.industries.includes(ind))
      )
    }

    if (activeTags.length > 0) {
      result = result.filter((p) =>
        activeTags.some((tag) => p.tags.includes(tag))
      )
    }

    if (sortBy === 'title') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title))
    } else {
      result = [...result].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    }

    return result
  }, [projects, query, activeProduct, activeIndustries, activeTags, sortBy, fuse])

  return filtered
}
