import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface CsvProjectRow {
  name: string
  access: string
  credentials: string
  customerDemo: string
  description: string
  lastUpdated: string
  link: string
  product: string
  resourceType: string
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function appendProjectToCsv(row: CsvProjectRow): void {
  const csvPath = join(process.cwd(), 'src', 'data', 'portfolio.csv')
  const existing = readFileSync(csvPath, 'utf-8')

  const now = new Date()
  const dateStr = row.lastUpdated || now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const fields = [
    escapeCsvField(row.name),
    escapeCsvField(row.access),
    escapeCsvField(row.credentials),
    escapeCsvField(row.customerDemo),
    escapeCsvField(row.description),
    escapeCsvField(dateStr),
    escapeCsvField(row.link),
    escapeCsvField(row.product),
    escapeCsvField(row.resourceType),
  ]

  const newLine = fields.join(',')
  const content = existing.endsWith('\n') ? existing + newLine + '\n' : existing + '\n' + newLine + '\n'

  writeFileSync(csvPath, content, 'utf-8')
}
