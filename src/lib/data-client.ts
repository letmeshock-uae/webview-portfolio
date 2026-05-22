import type { Demo, ProductHero } from '@/types'
import { PRODUCTS } from '@/types'

export function findHeroForProduct(demos: Demo[], productSlug: string | null): ProductHero | null {
  if (productSlug === null) {
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
