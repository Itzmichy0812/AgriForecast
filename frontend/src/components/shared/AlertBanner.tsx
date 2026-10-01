import * as React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StatusVariant } from './StatusBadge'

interface AlertBannerProps {
  variant: StatusVariant
  title: string
  description?: string
  actions?: React.ReactNode
  dismissible?: boolean
  className?: string
}

interface VariantConfig {
  containerClass: string
  Icon: typeof Info
  /** Accessible label prefix for screen readers */
  srPrefix: string
}

/** All colors reference centralized semantic CSS custom properties. */
const variantConfig: Record<StatusVariant, VariantConfig> = {
  neutral: {
    containerClass:
      'border-[var(--color-status-neutral-border)] bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral-fg)]',
    Icon: Info,
    srPrefix: 'Thông báo',
  },
  info: {
    containerClass:
      'border-[var(--color-status-info-border)] bg-[var(--color-status-info-bg)] text-[var(--color-status-info-fg)]',
    Icon: Info,
    srPrefix: 'Thông tin',
  },
  success: {
    containerClass:
      'border-[var(--color-status-success-border)] bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)]',
    Icon: CheckCircle2,
    srPrefix: 'Thành công',
  },
  warning: {
    containerClass:
      'border-[var(--color-status-warning-border)] bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)]',
    Icon: AlertTriangle,
    srPrefix: 'Cảnh báo',
  },
  critical: {
    containerClass:
      'border-[var(--color-status-critical-border)] bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical-fg)]',
    Icon: AlertCircle,
    srPrefix: 'Khẩn cấp',
  },
}

/**
 * Inline alert banner for page-level notifications.
 * Color is always paired with an icon and text; never color alone.
 */
export function AlertBanner({
  variant,
  title,
  description,
  actions,
  dismissible = false,
  className,
}: AlertBannerProps) {
  const [dismissed, setDismissed] = React.useState(false)

  if (dismissed) return null

  const { containerClass, Icon, srPrefix } = variantConfig[variant]

  return (
    <div
      role="alert"
      aria-label={`${srPrefix}: ${title}`}
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius-control)] border p-4',
        containerClass,
        className,
      )}
    >
      <Icon size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="mt-1 text-sm opacity-90">{description}</p>
        )}
        {actions && <div className="mt-2.5">{actions}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          aria-label="Đóng thông báo"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 hover:bg-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] transition-opacity"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}