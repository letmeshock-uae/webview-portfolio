import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/admin-auth'
import { appendProjectToCsv } from '@/lib/csv-writer'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

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

interface ImportPayload {
  projects: ProjectRow[]
  images?: Array<{ slug: string; data: string; ext: string }>
}

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload: ImportPayload = await req.json()

    if (!payload.projects || payload.projects.length === 0) {
      return NextResponse.json({ error: 'No projects in payload' }, { status: 400 })
    }

    // Save images
    const coversDir = join(process.cwd(), 'public', 'covers')
    if (!existsSync(coversDir)) mkdirSync(coversDir, { recursive: true })

    if (payload.images) {
      for (const img of payload.images) {
        const destPath = join(coversDir, `${img.slug}.${img.ext}`)
        const buffer = Buffer.from(img.data, 'base64')
        writeFileSync(destPath, buffer)
      }
    }

    // Append projects to CSV
    for (const project of payload.projects) {
      appendProjectToCsv(project)
    }

    revalidatePath('/')

    return NextResponse.json({
      ok: true,
      count: payload.projects.length,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed'
    console.error('ZIP import error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
