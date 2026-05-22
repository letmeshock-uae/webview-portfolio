'use client'

import { useMemo } from 'react'
import Fuse from 'fuse.js'
import type { Demo } from '@/types'
import { fuseOptions } from '@/lib/fuse'
import { slugify } from '@/lib/utils'
import { useCatalogStore } from './store'

export function useCatalog(demos: Demo[]) {
  const { activeProduct, activeTags, activeIndustries, activeClients, liveDemo, sortBy } =
    useCatalogStore()

  const nonCoverDemos = useMemo(() => demos.filter((d) => !d.isCover), [demos])
  const fuse = useMemo(() => new Fuse(nonCoverDemos, fuseOptions), [nonCoverDemos])

  return useMemo(() => {
    let result = nonCoverDemos

    if (activeProduct) {
      const productName =
        { 'datum-teller': 'Datum Teller', axion: 'Axion', meridien: 'Meridien', lansy: 'Lansy', 'external-lcc': 'External LCC' }[activeProduct] || ''
      result = result.filter((d) => d.product === productName)
    }

    if (activeTags.length > 0) {
      result = result.filter((d) => activeTags.some((tag) => d.tags.includes(tag)))
    }

    if (activeIndustries.length > 0) {
      result = result.filter((d) =>
        activeIndustries.some((ind) => d.industries.includes(ind)),
      )
    }

    if (activeClients.length > 0) {
      result = result.filter((d) =>
        activeClients.some((c) => d.client === c),
      )
    }

    if (liveDemo === true) {
      result = result.filter((d) => d.isLiveDemo)
    } else if (liveDemo === false) {
      result = result.filter((d) => !d.isLiveDemo)
    }

    const isSceneDemo = (d: Demo) =>
      d.product === 'Datum Teller' &&
      d.tags.some((t) => t.toLowerCase() === 'scene demos')

    const isTellerActive = activeProduct === 'datum-teller'

    const regularDemos = isTellerActive
      ? result.filter((d) => !isSceneDemo(d))
      : result
    const sceneDemos = isTellerActive ? result.filter(isSceneDemo) : []

    const sortFn = (a: Demo, b: Demo) =>
      sortBy === 'demoName'
        ? a.demoName.localeCompare(b.demoName)
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()

    return {
      regularDemos: [...regularDemos].sort(sortFn),
      sceneDemos: [...sceneDemos].sort(sortFn),
      sceneDemosCount: sceneDemos.length,
    }
  }, [nonCoverDemos, activeProduct, activeTags, activeIndustries, activeClients, liveDemo, sortBy, fuse])
}
