import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function formatRelative(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 30) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMin > 0) return `${diffMin}m ago`
  return 'just now'
}

export function parseCredentials(raw: string | null): { login: string; password: string } | null {
  if (!raw) return null
  const loginMatch = raw.match(/(?:login|user(?:name)?|email)\s*:\s*(.+)/i)
  const passMatch = raw.match(/(?:pass(?:word)?|pw)\s*:\s*(.+)/i)
  if (!loginMatch && !passMatch) return null
  return {
    login: loginMatch?.[1]?.trim() || '',
    password: passMatch?.[1]?.trim() || '',
  }
}

const coverGradients: Record<string, string> = {
  'datum teller': 'linear-gradient(135deg, #2d1f5e 0%, #000000 100%)',
  axion: 'linear-gradient(135deg, #3d2800 0%, #000000 100%)',
  meridien: 'linear-gradient(135deg, #1a2040 0%, #000000 100%)',
  lansy: 'linear-gradient(135deg, #0f3d28 0%, #000000 100%)',
  'external lcc': 'linear-gradient(135deg, #3d1020 0%, #000000 100%)',
  default: 'linear-gradient(135deg, #1a1a2e 0%, #000000 100%)',
}

export function getCoverGradient(productName?: string): string {
  if (!productName) return coverGradients.default
  const key = productName.toLowerCase()
  return coverGradients[key] || coverGradients.default
}
