import JSZip from 'jszip'
import { parse } from 'csv-parse/sync'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, extname, basename } from 'path'
import { slugify } from '@/lib/utils'
import { appendProjectToCsv } from '@/lib/csv-writer'

interface NotionExportRow {
  [key: string]: string
}

interface ImportedProject {
  title: string
  product: string
  resourceType: string
  link: string
  coverSaved: boolean
}

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, ' ')
}

function findValue(row: NotionExportRow, ...possibleKeys: string[]): string {
  for (const key of Object.keys(row)) {
    const normalized = normalizeKey(key)
    for (const possible of possibleKeys) {
      if (normalized === possible.toLowerCase() || normalized.includes(possible.toLowerCase())) {
        return row[key]?.trim() || ''
      }
    }
  }
  return ''
}

function isImageFile(filename: string): boolean {
  const ext = extname(filename).toLowerCase()
  return ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext)
}

export async function processNotionZip(buffer: Buffer): Promise<ImportedProject[]> {
  const zip = await JSZip.loadAsync(buffer)
  const imported: ImportedProject[] = []

  // Find CSV files in the zip
  const csvFiles: string[] = []
  const imageFiles: Map<string, JSZip.JSZipObject> = new Map()

  zip.forEach((relativePath, file) => {
    if (file.dir) return
    const lower = relativePath.toLowerCase()
    if (lower.endsWith('.csv')) {
      csvFiles.push(relativePath)
    }
    if (isImageFile(relativePath)) {
      imageFiles.set(relativePath, file)
    }
  })

  // Also look for HTML files to extract images referenced within
  const htmlFiles: string[] = []
  zip.forEach((relativePath, file) => {
    if (!file.dir && relativePath.toLowerCase().endsWith('.html')) {
      htmlFiles.push(relativePath)
    }
  })

  // Process CSV files (Notion database exports)
  for (const csvPath of csvFiles) {
    const file = zip.file(csvPath)
    if (!file) continue

    let content = await file.async('string')
    // Remove BOM
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1)
    }

    let records: NotionExportRow[]
    try {
      records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
      })
    } catch {
      continue
    }

    for (const row of records) {
      const title = findValue(row, 'name', 'title', 'Name', 'Title')
      if (!title) continue

      const product = findValue(row, 'product', 'Product')
      const resourceType = findValue(row, 'resource type', 'type', 'Resource type')
      const link = findValue(row, 'link', 'url', 'Link', 'URL')
      const access = findValue(row, 'access', 'Access') || 'Internal'
      const customerDemo = findValue(row, 'customer demo', 'demo') || 'No'
      const description = findValue(row, 'description', 'Description')
      const credentials = findValue(row, 'credentials', 'Credentials')
      const lastUpdated = findValue(row, 'last updated', 'updated', 'date')

      // Try to find a cover image for this project
      const slug = slugify(title)
      let coverSaved = false

      // Look for image that matches the project title
      for (const [imgPath, imgFile] of imageFiles) {
        const imgName = basename(imgPath, extname(imgPath)).toLowerCase()
        if (imgName.includes(slug) || slug.includes(imgName.replace(/[^a-z0-9]/g, ''))) {
          const ext = extname(imgPath).toLowerCase().slice(1)
          const destDir = join(process.cwd(), 'public', 'covers')
          if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
          const destPath = join(destDir, `${slug}.${ext}`)
          const imgBuffer = await imgFile.async('nodebuffer')
          writeFileSync(destPath, imgBuffer)
          coverSaved = true
          break
        }
      }

      // If no matching image found, check if there's an image in a folder named after the page
      if (!coverSaved) {
        for (const [imgPath, imgFile] of imageFiles) {
          const parts = imgPath.split('/')
          if (parts.length >= 2) {
            const folder = parts[parts.length - 2].toLowerCase()
            if (folder.includes(slug) || slug.includes(folder.replace(/[^a-z0-9]/g, ''))) {
              const ext = extname(imgPath).toLowerCase().slice(1)
              const destDir = join(process.cwd(), 'public', 'covers')
              if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
              const destPath = join(destDir, `${slug}.${ext}`)
              const imgBuffer = await imgFile.async('nodebuffer')
              writeFileSync(destPath, imgBuffer)
              coverSaved = true
              break
            }
          }
        }
      }

      appendProjectToCsv({
        name: title,
        access,
        credentials,
        customerDemo,
        description,
        lastUpdated,
        link,
        product,
        resourceType,
      })

      imported.push({ title, product, resourceType, link, coverSaved })
    }
  }

  // If no CSV found, try to parse individual HTML pages
  if (csvFiles.length === 0 && htmlFiles.length > 0) {
    for (const htmlPath of htmlFiles) {
      const file = zip.file(htmlPath)
      if (!file) continue

      const html = await file.async('string')
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
      const title = titleMatch?.[1]?.trim() || basename(htmlPath, '.html')
      if (!title || title === 'Untitled') continue

      const slug = slugify(title)

      // Find first image in the HTML's sibling folder
      let coverSaved = false
      const htmlDir = htmlPath.includes('/') ? htmlPath.substring(0, htmlPath.lastIndexOf('/')) : ''

      for (const [imgPath, imgFile] of imageFiles) {
        if (htmlDir && imgPath.startsWith(htmlDir)) {
          const ext = extname(imgPath).toLowerCase().slice(1)
          const destDir = join(process.cwd(), 'public', 'covers')
          if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
          const destPath = join(destDir, `${slug}.${ext}`)
          const imgBuffer = await imgFile.async('nodebuffer')
          writeFileSync(destPath, imgBuffer)
          coverSaved = true
          break
        }
      }

      appendProjectToCsv({
        name: title,
        access: 'Internal',
        credentials: '',
        customerDemo: 'No',
        description: '',
        lastUpdated: '',
        link: '',
        product: '',
        resourceType: '',
      })

      imported.push({ title, product: '', resourceType: '', link: '', coverSaved })
    }
  }

  return imported
}
