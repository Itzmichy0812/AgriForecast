import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** Primary page title (rendered as h1) */
  title: string
  /** Optional supporting description */
  description?: string
  /** Slot for right-side action buttons */
  actions?: ReactNode
  className?: string
}

/**
 * Reusable page-level header.
 * Each page must have exactly one <h1>, which this component renders.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-4 mb-6',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-[var(--color-ink)] leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}