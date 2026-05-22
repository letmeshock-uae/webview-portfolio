import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchDemos } from '@/lib/data'
import { DemoDetail } from '@/components/demo/DemoDetail'

export const revalidate = 60

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const demos = await fetchDemos()
  const demo = demos.find((d) => d.id === id)
  return {
    title: demo ? `${demo.demoName} — Project Catalog` : 'Demo Not Found',
    description: demo?.description || '',
  }
}

export default async function DemoPage({ params }: Props) {
  const { id } = await params
  const demos = await fetchDemos()
  const demo = demos.find((d) => d.id === id)

  if (!demo) notFound()

  return <DemoDetail demo={demo} />
}
