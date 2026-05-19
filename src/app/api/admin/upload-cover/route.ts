import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { uploadCover, getBlobProjects, saveBlobProjects } from '@/lib/blob-storage'
import { slugify } from '@/lib/utils'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Batch update mode: just update coverUrls in project data (no image upload)
    if (body.updateUrls && typeof body.updateUrls === 'object') {
      const urlMap: Record<string, string> = body.updateUrls
      const projects = await getBlobProjects()
      const updated = projects.map((p) => {
        const slug = slugify(p.title)
        if (urlMap[slug]) {
          return { ...p, coverUrl: urlMap[slug] }
        }
        return p
      })
      await saveBlobProjects(updated)
      return NextResponse.json({ ok: true, updated: Object.keys(urlMap).length })
    }

    // Single image upload mode
    const { slug, data, ext, skipProjectUpdate } = body
    if (!slug || !data || !ext) {
      return NextResponse.json({ error: 'Missing slug, data, or ext' }, { status: 400 })
    }

    const buffer = Buffer.from(data, 'base64')
    const coverUrl = await uploadCover(slug, buffer, ext)

    // Optionally skip project data update (caller will batch-update later)
    if (!skipProjectUpdate) {
      const projects = await getBlobProjects()
      const updated = projects.map((p) => {
        if (slugify(p.title) === slug) {
          return { ...p, coverUrl }
        }
        return p
      })
      if (JSON.stringify(updated) !== JSON.stringify(projects)) {
        await saveBlobProjects(updated)
      }
    }

    return NextResponse.json({ ok: true, url: coverUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    console.error('Cover upload error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
