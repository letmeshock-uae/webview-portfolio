import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-auth'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

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

    const coversDir = join(process.cwd(), 'public', 'covers')
    if (!existsSync(coversDir)) mkdirSync(coversDir, { recursive: true })

    const destPath = join(coversDir, `${slug}.${ext}`)
    const buffer = Buffer.from(data, 'base64')
    writeFileSync(destPath, buffer)

    return NextResponse.json({ ok: true, path: `/covers/${slug}.${ext}` })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    console.error('Cover upload error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
