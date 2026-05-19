import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/admin-auth'
import { processNotionZip } from '@/lib/zip-import'

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json({ error: 'File must be a .zip archive' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const imported = await processNotionZip(buffer)

    if (imported.length === 0) {
      return NextResponse.json({ error: 'No projects found in the archive. Make sure it contains a CSV or HTML export from Notion.' }, { status: 400 })
    }

    revalidatePath('/')

    return NextResponse.json({
      ok: true,
      count: imported.length,
      projects: imported,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed'
    console.error('ZIP import error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
