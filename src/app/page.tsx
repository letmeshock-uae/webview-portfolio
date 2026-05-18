import { fetchProjects, deriveProducts } from '@/lib/notion'
import { CatalogClient } from '@/features/catalog/CatalogClient'

export const revalidate = 60

export default async function HomePage() {
  const projects = await fetchProjects()
  const products = deriveProducts(projects)

  return <CatalogClient projects={projects} products={products} />
}
