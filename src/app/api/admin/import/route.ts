import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyAdminSession } from '@/lib/admin-auth'
import { parseNotionPage } from '@/lib/notion-import'
import { takeScreenshot } from '@/lib/screenshot'
import { appendProjectToCsv } from '@/lib/csv-writer'

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { notionUrl } = await req.json()

  if (!notionUrl || typeof notionUrl !== 'string') {
    return NextResponse.json({ error: 'notionUrl is required' }, { status: 400 })
  }

  try {
    const parsed = await parseNotionPage(notionUrl)

    // If no cover was found from Notion, try taking a screenshot of the project link
    let coverPath = parsed.coverPath
    if (!coverPath && parsed.link) {
      coverPath = await takeScreenshot(parsed.link, parsed.title)
    }

    appendProjectToCsv({
      name: parsed.title,
      access: parsed.access,
      credentials: '',
      customerDemo: parsed.customerDemo,
      description: parsed.description,
      lastUpdated: '',
      link: parsed.link,
      product: parsed.product,
      resourceType: parsed.resourceType,
    })

    revalidatePath('/')

    return NextResponse.json({
      ok: true,
      project: {
        title: parsed.title,
        description: parsed.description,
        product: parsed.product,
        resourceType: parsed.resourceType,
        link: parsed.link,
        coverPath,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed'
    console.error('Import error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
