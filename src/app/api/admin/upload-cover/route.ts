import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { uploadCover, getBlobProjects, saveBlobProjects } from '@/lib/blob-storage'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Batch mode: update multiple coverUrls at once
    if (body.covers && Array.isArray(body.covers)) {
      const covers: { slug: string; data: string; ext: string }[] = body.covers
      const urlMap: Record<string, string> = {}

      for (const cover of covers) {
        const buffer = Buffer.from(cover.data, 'base64')
        const url = await uploadCover(cover.slug, buffer, cover.ext)
        urlMap[cover.slug] = url
      }

      // Single read-modify-write for all covers
      const projects = await getBlobProjects()
      const updated = projects.map((p) => {
        const slug = slugify(p.title)
        if (urlMap[slug]) {
          return { ...p, coverUrl: urlMap[slug] }
        }
        return p
      })
      await saveBlobProjects(updated)

      return NextResponse.json({ ok: true, uploaded: Object.keys(urlMap).length })
    }

    // Single mode (legacy)
    const { slug, data, ext } = body
    if (!slug || !data || !ext) {
      return NextResponse.json({ error: 'Missing slug, data, or ext' }, { status: 400 })
    }

    const buffer = Buffer.from(data, 'base64')
    const coverUrl = await uploadCover(slug, buffer, ext)

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

    return NextResponse.json({ ok: true, url: coverUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    console.error('Cover upload error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
