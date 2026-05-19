import { Client } from '@notionhq/client'
import { writeFileSync } from 'fs'
import { join } from 'path'
import https from 'https'
import http from 'http'
import { slugify } from '@/lib/utils'

export interface ParsedProject {
  title: string
  description: string
  product: string
  resourceType: string
  link: string
  access: string
  customerDemo: string
  coverPath: string | null
}

function extractPageId(url: string): string {
  // Handle various Notion URL formats:
  // https://www.notion.so/workspace/Page-Title-abc123def456...
  // https://notion.so/Page-Title-abc123def456...
  // https://www.notion.so/abc123def456...
  // Raw page ID: abc123def456...
  const cleaned = url.split('?')[0].split('#')[0]

  // Try to extract 32-char hex ID (with or without dashes)
  const hexMatch = cleaned.match(/([a-f0-9]{32})/i)
  if (hexMatch) return hexMatch[1]

  // Try UUID format with dashes
  const uuidMatch = cleaned.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i)
  if (uuidMatch) return uuidMatch[1].replace(/-/g, '')

  // Last segment of URL might contain the ID at the end
  const segments = cleaned.split('/')
  const last = segments[segments.length - 1]
  const tailMatch = last.match(/([a-f0-9]{32})$/i)
  if (tailMatch) return tailMatch[1]

  // Try extracting from slug-id format (Page-Name-hexid)
  const slugMatch = last.match(/-([a-f0-9]{32})$/i)
  if (slugMatch) return slugMatch[1]

  throw new Error(`Could not extract page ID from: ${url}`)
}

function getNotionClient(): Client {
  const token = process.env.NOTION_API_TOKEN
  if (!token) throw new Error('NOTION_API_TOKEN not set')
  return new Client({ auth: token })
}

function extractTitle(page: Record<string, unknown>): string {
  const properties = page.properties as Record<string, unknown>
  if (!properties) return 'Untitled'

  for (const value of Object.values(properties)) {
    const prop = value as Record<string, unknown>
    if (prop.type === 'title') {
      const titleArr = prop.title as Array<{ plain_text: string }>
      if (titleArr?.length > 0) {
        return titleArr.map((t) => t.plain_text).join('')
      }
    }
  }
  return 'Untitled'
}

function extractRichTextProperty(properties: Record<string, unknown>, name: string): string {
  const prop = properties[name] as Record<string, unknown> | undefined
  if (!prop) return ''

  if (prop.type === 'rich_text') {
    const arr = prop.rich_text as Array<{ plain_text: string }>
    return arr?.map((t) => t.plain_text).join('') || ''
  }
  if (prop.type === 'url') {
    return (prop.url as string) || ''
  }
  if (prop.type === 'select') {
    const sel = prop.select as { name: string } | null
    return sel?.name || ''
  }
  if (prop.type === 'multi_select') {
    const arr = prop.multi_select as Array<{ name: string }>
    return arr?.map((s) => s.name).join(', ') || ''
  }
  if (prop.type === 'checkbox') {
    return prop.checkbox ? 'Yes' : 'No'
  }
  return ''
}

function extractCoverUrl(page: Record<string, unknown>): string | null {
  const cover = page.cover as Record<string, unknown> | null
  if (!cover) return null

  if (cover.type === 'external') {
    const ext = cover.external as { url: string }
    return ext?.url || null
  }
  if (cover.type === 'file') {
    const file = cover.file as { url: string }
    return file?.url || null
  }
  return null
}

async function downloadImage(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadImage(res.headers.location, destPath).then(resolve).catch(reject)
        return
      }
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode}`))
        return
      }
      const chunks: Buffer[] = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        writeFileSync(destPath, Buffer.concat(chunks))
        resolve()
      })
      res.on('error', reject)
    }).on('error', reject)
  })
}

export async function parseNotionPage(notionUrl: string): Promise<ParsedProject> {
  const pageId = extractPageId(notionUrl)
  const notion = getNotionClient()

  const page = await notion.pages.retrieve({ page_id: pageId }) as unknown as Record<string, unknown>
  const properties = page.properties as Record<string, unknown>

  const title = extractTitle(page)
  const description = extractRichTextProperty(properties, 'Description')
  const product = extractRichTextProperty(properties, 'Product') || extractRichTextProperty(properties, 'product')
  const resourceType = extractRichTextProperty(properties, 'Resource type') || extractRichTextProperty(properties, 'Type')
  const link = extractRichTextProperty(properties, 'Link') || extractRichTextProperty(properties, 'URL') || extractRichTextProperty(properties, 'link')
  const access = extractRichTextProperty(properties, 'Access') || 'Internal'
  const customerDemo = extractRichTextProperty(properties, 'Customer demo') || 'No'

  // Try to download cover image
  let coverPath: string | null = null
  const coverUrl = extractCoverUrl(page)

  if (coverUrl) {
    const slug = slugify(title)
    const ext = coverUrl.match(/\.(png|jpg|jpeg|webp|gif)/i)?.[1] || 'png'
    const filename = `${slug}.${ext}`
    const destPath = join(process.cwd(), 'public', 'covers', filename)

    try {
      await downloadImage(coverUrl, destPath)
      coverPath = `/covers/${filename}`
    } catch (err) {
      console.error('Failed to download cover:', err)
    }
  }

  return {
    title,
    description,
    product,
    resourceType,
    link,
    access,
    customerDemo,
    coverPath,
  }
}

export { extractPageId }
