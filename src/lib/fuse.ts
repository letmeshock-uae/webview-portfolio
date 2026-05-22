import type { IFuseOptions } from 'fuse.js'
import type { Demo } from '@/types'

export const fuseOptions: IFuseOptions<Demo> = {
  keys: [
    { name: 'demoName', weight: 0.35 },
    { name: 'description', weight: 0.2 },
    { name: 'fullDescription', weight: 0.1 },
    { name: 'tags', weight: 0.15 },
    { name: 'industries', weight: 0.1 },
    { name: 'client', weight: 0.1 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
}
