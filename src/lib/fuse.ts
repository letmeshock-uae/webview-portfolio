import Fuse, { type IFuseOptions } from 'fuse.js'
import type { Project } from '@/types'

export const fuseOptions: IFuseOptions<Project> = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.2 },
    { name: 'tags', weight: 0.2 },
    { name: 'industries', weight: 0.1 },
    { name: 'product', weight: 0.1 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
}

export function createFuseIndex(projects: Project[]) {
  return new Fuse(projects, fuseOptions)
}
