import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/admin-auth'
import { getBlobProjects, saveBlobProjects, type BlobProject } from '@/lib/blob-storage'
import { slugify } from '@/lib/utils'

export const maxDuration = 60

function safeDate(str: string): string {
  if (!str) return new Date().toISOString()
  try {
    const d = new Date(str)
    if (isNaN(d.getTime())) return new Date().toISOString()
    return d.toISOString()
  } catch {
    return new Date().toISOString()
  }
}

interface ProjectRow {
  name: string
  access: string
  credentials: string
  customerDemo: string
  description: string
  lastUpdated: string
  link: string
  product: string
  resourceType: string
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { projects } = await req.json() as { projects: ProjectRow[] }

    if (!projects || projects.length === 0) {
      return NextResponse.json({ error: 'No projects in payload' }, { status: 400 })
    }

    // Load existing blob projects
    const existing = await getBlobProjects()

    // Convert incoming rows to BlobProject format
    const newProjects: BlobProject[] = projects.map((p, i) => {
      const resourceType = p.resourceType?.trim()
      const access = p.access?.trim() || 'Internal'
      const tags: string[] = []
      if (resourceType) tags.push(resourceType)
      if (access) tags.push(access)
      if (p.customerDemo?.toLowerCase() === 'yes') tags.push('Customer Demo')

      return {
        id: `blob-${Date.now()}-${i}`,
        title: p.name,
        description: p.description || '',
        coverUrl: null,
        product: p.product ? [p.product.trim()] : [],
        industries: [],
        tags,
        externalUrl: p.link || null,
        status: access,
        updatedAt: safeDate(p.lastUpdated),
        createdAt: safeDate(p.lastUpdated),
      }
    })

    // Replace existing projects with same titles, add new ones
    const newBySlug = new Map(newProjects.map((p) => [slugify(p.title), p]))
    const kept = existing.filter((p) => !newBySlug.has(slugify(p.title)))
    const merged = [...kept, ...newProjects]
    await saveBlobProjects(merged)

    revalidatePath('/')

    const replaced = existing.length - kept.length

    return NextResponse.json({
      ok: true,
      count: newProjects.length,
      replaced,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed'
    console.error('ZIP import error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
