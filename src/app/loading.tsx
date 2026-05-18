import { LoadingSkeletons } from '@/components/catalog/LoadingSkeletons'

export default function Loading() {
  return (
    <div className="sm:pl-[var(--sidebar-width)]">
      <div className="mx-auto max-w-[var(--content-max-w)] px-6 py-6">
        <LoadingSkeletons count={6} />
      </div>
    </div>
  )
}
