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
    const { slug, data, ext } = await req.json()

    if (!slug || !data || !ext) {
      return NextResponse.json({ error: 'Missing slug, data, or ext' }, { status: 400 })
    }

    const buffer = Buffer.from(data, 'base64')
    const coverUrl = await uploadCover(slug, buffer, ext)

    // Update the project's coverUrl in blob storage
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
