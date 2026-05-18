export interface Project {
  id: string
  title: string
  description: string
  coverImage: string | null
  product: string[]
  industries: string[]
  tags: string[]
  externalUrl: string | null
  status: string
  updatedAt: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  color: string
}
