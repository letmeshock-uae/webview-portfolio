import { fetchDemos } from '@/lib/data'
import { PRODUCTS } from '@/types'
import { CatalogClient } from '@/features/catalog/CatalogClient'

export const revalidate = 60

export default async function HomePage() {
  const demos = await fetchDemos()

  return <CatalogClient demos={demos} products={PRODUCTS} />
}
