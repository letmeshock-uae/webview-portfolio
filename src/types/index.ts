export interface Demo {
  id: string
  demoName: string
  description: string
  fullDescription: string
  coverImage: string | null
  coverUrl?: string | null
  product: string
  tags: string[]
  status: string
  industries: string[]
  client: string
  isLiveDemo: boolean
  liveDemoUrl: string | null
  liveDemoShareable: boolean
  liveDemoCredentials: string | null
  salesKitUrl: string | null
  salesKitShareable: boolean
  figmaDemoUrl: string | null
  figmaDemoShareable: boolean
  viewerLink: string | null
  websiteUrl: string | null
  isCover: boolean
  updatedAt: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  color: string
}

export interface ProductHero {
  productSlug: string
  productName: string
  description: string
  salesKitUrl: string | null
  salesKitShareable: boolean
  backgroundImage: string | null
  websiteUrl: string | null
}

export const PRODUCTS: Product[] = [
  { id: 'datum-teller', name: 'Datum Teller', slug: 'datum-teller', color: '#6e56cf' },
  { id: 'axion', name: 'Axion', slug: 'axion', color: '#f0a050' },
  { id: 'meridien', name: 'Meridien', slug: 'meridien', color: '#5b9cf6' },
  { id: 'lansy', name: 'Lansy', slug: 'lansy', color: '#3dd68c' },
]
