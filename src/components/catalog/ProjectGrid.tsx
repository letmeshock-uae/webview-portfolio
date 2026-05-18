'use client'

import { AnimatePresence } from 'framer-motion'
import type { Project } from '@/types'
import { ProjectCard } from './ProjectCard'
import { EmptyState } from './EmptyState'

interface ProjectGridProps {
  projects: Project[]
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="project-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
      <AnimatePresence mode="popLayout">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </AnimatePresence>
    </div>
  )
}
