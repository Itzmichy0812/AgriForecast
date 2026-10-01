import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/** Single skeleton line/block */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded bg-[var(--color-border)]', className)}
    />
  )
}

/** Skeleton layout matching a MetricCard */
export function MetricCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-[var(--radius-control)]" />
      </div>
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-3.5 w-32" />
    </div>
  )
}

/** Skeleton layout for a list of rows */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Đang tải dữ liệu">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )
}