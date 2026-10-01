import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type StatusVariant = 'neutral' | 'info' | 'success' | 'warning' | 'critical'

/** Maps each variant to its centralized semantic CSS custom properties. */
const variantClass: Record<StatusVariant, string> = {
  neutral:  'bg-[var(--color-status-neutral-bg)]  text-[var(--color-status-neutral-fg)]',
  info:     'bg-[var(--color-status-info-bg)]     text-[var(--color-status-info-fg)]',
  success:  'bg-[var(--color-status-success-bg)]  text-[var(--color-status-success-fg)]',
  warning:  'bg-[var(--color-status-warning-bg)]  text-[var(--color-status-warning-fg)]',
  critical: 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical-fg)]',
}

const dotClass: Record<StatusVariant, string> = {
  neutral:  'bg-[var(--color-status-neutral-fg)]',
  info:     'bg-[var(--color-status-info-fg)]',
  success:  'bg-[var(--color-status-success-fg)]',
  warning:  'bg-[var(--color-warning)]',
  critical: 'bg-[var(--color-critical)]',
}

interface StatusBadgeProps {
  variant: StatusVariant
  /** Text label – never rely on color alone */
  children: ReactNode
  /** Show the indicator dot (default: true) */
  dot?: boolean
  className?: string
}

/**
 * Semantic status badge. Color is always paired with text and an
 * optional dot indicator. Status must never rely on color alone.
 */
export function StatusBadge({
  variant,
  children,
  dot = true,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClass[variant],
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn(
            'inline-block h-1.5 w-1.5 shrink-0 rounded-full',
            dotClass[variant],
          )}
        />
      )}
      {children}
    </span>
  )
}