import 'server-only'
import { parse } from 'csv-parse/sync'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { Demo, ProductHero } from '@/types'
import { PRODUCTS } from '@/types'
import { getBlobProjects } from '@/lib/blob-storage'

interface CsvRow {
  'Demo name': string
  Client: string
  'Figma Demo ': string
  'Figma Demo shareable': string
  'Full description': string
  Industries: string
  'Last updated': string
  'Live demo': string
  'Live demo URL': string
  'Live demo credentials': string
  'Live demo shareable': string
  Product: string
  'Sales KIT URL': string
  'Sales KIT shareable': string
  'Short description': string
  Status: string
  Tags: string
  'Viewer Link': string
  Website: string
}

function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString()
  const parsed = new Date(dateStr)
  if (isNaN(parsed.getTime())) return new Date().toISOString()
  return parsed.toISOString()
}

function parseBool(val: string): boolean {
  return val?.trim().toLowerCase() === 'yes'
}

function parseMulti(val: string): string[] {
  if (!val) return []
  return val.split(',').map(s => s.trim()).filter(Boolean)
}

function findCoverImage(title: string): string | null {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const extensions = ['jpeg', 'jpg', 'png', 'webp']
  for (const ext of extensions) {
    const filePath = join(process.cwd(), 'public', 'covers', `${slug}.${ext}`)
    if (existsSync(filePath)) return `/covers/${slug}.${ext}`
  }
  return null
}

function transformCsvRow(row: CsvRow, index: number): Demo {
  const title = row['Demo name']?.trim() || 'Untitled'
  const isCover = parseMulti(row.Tags).some(t => t.toLowerCase() === 'cover')

  return {
    id: `demo-${index}`,
    demoName: title,
    description: row['Short description']?.trim() || '',
    fullDescription: row['Full description']?.trim() || '',
    coverImage: findCoverImage(title),
    product: row.Product?.trim() || '',
    tags: parseMulti(row.Tags).filter(t => t.toLowerCase() !== 'cover'),
    status: row.Status?.trim() || '',
    industries: parseMulti(row.Industries),
    client: row.Client?.trim() || '',
    isLiveDemo: parseBool(row['Live demo']),
    liveDemoUrl: row['Live demo URL']?.trim() || null,
    liveDemoShareable: parseBool(row['Live demo shareable']),
    liveDemoCredentials: row['Live demo credentials']?.trim() || null,
    salesKitUrl: row['Sales KIT URL']?.trim() || null,
    salesKitShareable: parseBool(row['Sales KIT shareable']),
    figmaDemoUrl: row['Figma Demo ']?.trim() || null,
    figmaDemoShareable: parseBool(row['Figma Demo shareable']),
    viewerLink: row['Viewer Link']?.trim() || null,
    websiteUrl: row.Website?.trim() || null,
    isCover,
    updatedAt: parseDate(row['Last updated']),
    createdAt: parseDate(row['Last updated']),
  }
}

export async function fetchDemos(): Promise<Demo[]> {
  try {
    const blobData = await getBlobProjects()
    if (blobData.length > 0) {
      return blobData as unknown as Demo[]
    }
  } catch (error) {
    console.error('Failed to load blob data:', error)
  }

  const csvPath = join(process.cwd(), 'src', 'data', 'portfolio.csv')
  try {
    let csvContent = readFileSync(csvPath, 'utf-8')
    if (csvContent.charCodeAt(0) === 0xFEFF) csvContent = csvContent.slice(1)
    const records: CsvRow[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
    })
    return records.map((row, i) => transformCsvRow(row, i))
  } catch (error) {
    console.error('Failed to read portfolio CSV:', error)
  }

  return []
}

export function findHeroForProduct(demos: Demo[], productSlug: string | null): ProductHero | null {
  if (!productSlug) {
    const mainCover = demos.find(d => d.isCover && !d.product)
    if (!mainCover) return null
    return {
      productSlug: '',
      productName: 'Datum',
      description: mainCover.fullDescription || mainCover.description,
      salesKitUrl: mainCover.salesKitUrl,
      salesKitShareable: mainCover.salesKitShareable,
      backgroundImage: mainCover.coverUrl || mainCover.coverImage,
      websiteUrl: mainCover.websiteUrl,
    }
  }

  const product = PRODUCTS.find(p => p.slug === productSlug)
  if (!product) return null

  const coverDemo = demos.find(d => d.isCover && d.product === product.name)
  if (!coverDemo) return null

  return {
    productSlug,
    productName: product.name,
    description: coverDemo.fullDescription || coverDemo.description,
    salesKitUrl: coverDemo.salesKitUrl,
    salesKitShareable: coverDemo.salesKitShareable,
    backgroundImage: coverDemo.coverUrl || coverDemo.coverImage,
    websiteUrl: coverDemo.websiteUrl,
  }
}
