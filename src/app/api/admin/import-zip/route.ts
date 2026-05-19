import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/admin-auth'
import { getBlobProjects, saveBlobProjects, type BlobProject } from '@/lib/blob-storage'
import { slugify } from '@/lib/utils'

export const maxDuration = 60

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
      const tags: string[] = resourceType ? [resourceType] : []
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
        status: p.access || 'Internal',
        updatedAt: p.lastUpdated ? new Date(p.lastUpdated).toISOString() : new Date().toISOString(),
        createdAt: p.lastUpdated ? new Date(p.lastUpdated).toISOString() : new Date().toISOString(),
      }
    })

    // Deduplicate by title
    const existingTitles = new Set(existing.map((p) => slugify(p.title)))
    const uniqueNew = newProjects.filter((p) => !existingTitles.has(slugify(p.title)))

    const merged = [...existing, ...uniqueNew]
    await saveBlobProjects(merged)

    revalidatePath('/')

    return NextResponse.json({
      ok: true,
      count: uniqueNew.length,
      skipped: newProjects.length - uniqueNew.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed'
    console.error('ZIP import error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
