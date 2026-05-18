import 'server-only'
import { parse } from 'csv-parse/sync'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { Project, Product } from '@/types'
import { slugify } from '@/lib/utils'

const PRODUCT_COLORS: Record<string, string> = {
  'datum teller': '#6e56cf',
  'lansy': '#3dd68c',
  'axion': '#f0a050',
  'meridien': '#5b9cf6',
  'external lcc studio by xgrids': '#f16c75',
}

const DEFAULT_COLOR = '#5b9cf6'

interface CsvRow {
  Name: string
  Access: string
  Credentials: string
  'Customer demo': string
  Description: string
  'Last updated': string
  Link: string
  Product: string
  'Resource type': string
}

function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString()
  const parsed = new Date(dateStr)
  if (isNaN(parsed.getTime())) return new Date().toISOString()
  return parsed.toISOString()
}

function findCoverImage(title: string): string | null {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const extensions = ['jpeg', 'jpg', 'png', 'webp']
  for (const ext of extensions) {
    const filePath = join(process.cwd(), 'public', 'covers', `${slug}.${ext}`)
    if (existsSync(filePath)) {
      return `/covers/${slug}.${ext}`
    }
  }
  return null
}

function transformCsvRow(row: CsvRow, index: number): Project {
  const product = row.Product ? [row.Product.trim()] : []
  const resourceType = row['Resource type']?.trim()
  const tags: string[] = resourceType ? [resourceType] : []
  const industries: string[] = []
  const title = row.Name?.trim() || 'Untitled'

  if (row['Customer demo']?.trim().toLowerCase() === 'yes') {
    tags.push('Customer Demo')
  }

  return {
    id: `project-${index}`,
    title,
    description: row.Description?.trim() || '',
    coverImage: findCoverImage(title),
    product,
    industries,
    tags,
    externalUrl: row.Link?.trim() || null,
    status: row.Access?.trim() || 'Internal',
    updatedAt: parseDate(row['Last updated']),
    createdAt: parseDate(row['Last updated']),
  }
}

export async function fetchProjects(): Promise<Project[]> {
  const csvPath = join(process.cwd(), 'src', 'data', 'portfolio.csv')

  try {
    let csvContent = readFileSync(csvPath, 'utf-8')
    if (csvContent.charCodeAt(0) === 0xFEFF) {
      csvContent = csvContent.slice(1)
    }
    const records: CsvRow[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    })

    return records.map((row, i) => transformCsvRow(row, i))
  } catch (error) {
    console.error('Failed to read portfolio CSV:', error)
    return []
  }
}

export function deriveProducts(projects: Project[]): Product[] {
  const productSet = new Map<string, string>()

  for (const project of projects) {
    for (const name of project.product) {
      if (!productSet.has(name)) {
        productSet.set(name, slugify(name))
      }
    }
  }

  const products: Product[] = []

  for (const [name, slug] of productSet) {
    const color = PRODUCT_COLORS[name.toLowerCase()] || DEFAULT_COLOR
    products.push({ id: slug, name, slug, color })
  }

  return products
}
