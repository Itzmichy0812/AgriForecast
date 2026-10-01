import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface SectionCardProps {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  /** Set true to remove default padding from the card body */
  noPadding?: boolean
}

/**
 * Standard card container for grouping related content within a page.
 *
 * The card header is rendered whenever any of title, description, or
 * actions is provided (not just title || actions).
 */
export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  noPadding = false,
}: SectionCardProps) {
  const hasHeader = Boolean(title ?? description ?? actions)

  return (
    <section
      className={cn(
        'rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]',
        className,
      )}
    >
      {hasHeader && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold text-[var(--color-ink)]">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className={cn(!noPadding && 'px-5 py-4')}>{children}</div>
    </section>
  )
}