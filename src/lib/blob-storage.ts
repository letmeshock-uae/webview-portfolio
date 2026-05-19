import { put, list } from '@vercel/blob'

function hasBlobToken(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

export interface BlobProject {
  id: string
  title: string
  description: string
  coverUrl: string | null
  product: string[]
  industries: string[]
  tags: string[]
  externalUrl: string | null
  status: string
  updatedAt: string
  createdAt: string
}

const PROJECTS_BLOB_PATH = 'catalog/projects.json'

export async function getBlobProjects(): Promise<BlobProject[]> {
  if (!hasBlobToken()) return []

  try {
    const { blobs } = await list({ prefix: PROJECTS_BLOB_PATH })
    if (blobs.length === 0) return []

    const response = await fetch(blobs[0].url, { cache: 'no-store' })
    if (!response.ok) return []

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function saveBlobProjects(projects: BlobProject[]): Promise<void> {
  if (!hasBlobToken()) {
    throw new Error('BLOB_READ_WRITE_TOKEN not configured. Set it up in Vercel Dashboard -> Storage -> Blob.')
  }

  await put(PROJECTS_BLOB_PATH, JSON.stringify(projects), {
    access: 'public',
    contentType: 'application/json',
    allowOverwrite: true,
  })
}

export async function uploadCover(slug: string, buffer: Buffer, ext: string): Promise<string> {
  if (!hasBlobToken()) {
    throw new Error('BLOB_READ_WRITE_TOKEN not configured')
  }

  const path = `catalog/covers/${slug}.${ext}`

  const blob = await put(path, buffer, {
    access: 'public',
    contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    allowOverwrite: true,
  })

  return blob.url
}
