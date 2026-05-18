import { Skeleton } from '@/components/ui/skeleton'

interface LoadingSkeletonsProps {
  count?: number
}

export function LoadingSkeletons({ count = 6 }: LoadingSkeletonsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-[var(--card-radius)] border border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          <Skeleton className="aspect-video w-full" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
