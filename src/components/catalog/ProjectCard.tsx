'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ArrowUpRight } from '@phosphor-icons/react'
import type { Project } from '@/types'
import { getCoverGradient, formatRelative } from '@/lib/utils'

function RelativeTime({ date }: { date: string }) {
  const [text, setText] = useState('')

  useEffect(() => {
    setText(formatRelative(date))
  }, [date])

  return <>{text}</>
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const }}
      whileHover={{ scale: 0.95 }}
      className="group relative aspect-square w-full overflow-hidden rounded-[16px]"
      style={{ cursor: project.externalUrl ? 'pointer' : 'default' }}
    >
      {project.coverImage ? (
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: getCoverGradient(project.product[0]) }}
        />
      )}

      <div className="absolute inset-0 flex flex-col justify-between p-[16px]">
        <div className="flex items-center justify-between w-full">
          {project.product[0] ? (
            <div className="flex items-center justify-center rounded-[4px] bg-white/20 backdrop-blur-[8px] px-[8px] py-[4px]">
              <span className="font-mono text-[13px] font-bold uppercase leading-[1.2] text-white [text-shadow:0px_8px_16px_rgba(0,0,0,0.48)]">
                {project.product[0]}
              </span>
            </div>
          ) : (
            <div />
          )}
          <span className="font-mono text-[13px] uppercase leading-[1.2] text-white [text-shadow:0px_8px_16px_rgba(0,0,0,0.48)]">
            <RelativeTime date={project.updatedAt} />
          </span>
        </div>

        <div className="flex items-end justify-between w-full">
          <h3 className="font-[var(--font-display)] text-[22px] font-semibold leading-[1.2] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] truncate">
            {project.title}
          </h3>
          {project.externalUrl && (
            <div className="flex items-center justify-center size-[24px] flex-shrink-0 ml-3">
              <ArrowUpRight size={20} weight="bold" className="text-white [filter:drop-shadow(0px_8px_16px_rgba(0,0,0,0.48))]" />
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[125px] bg-gradient-to-t from-black/50 to-transparent" />
    </motion.div>
  )

  if (project.externalUrl) {
    return (
      <a href={project.externalUrl} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return content
}
