import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type TrendDirection = 'up' | 'down' | 'neutral'
type TrendSentiment = 'positive' | 'negative' | 'neutral'

interface MetricCardProps {
  /** Card title / metric name */
  title: string
  /** Primary value display (string to support formatting) */
  value: string
  /** Optional unit shown after the value */
  unit?: string
  /** Trend percentage string e.g. "+12%" */
  trend?: string
  /** Direction of the trend arrow */
  trendDirection?: TrendDirection
  /** Semantic meaning of the trend (positive = good, negative = bad) */
  trendSentiment?: TrendSentiment
  /** Context label for the trend e.g. "so với tháng trước" */
  trendLabel?: string
  /** Icon rendered at top-right */
  icon?: LucideIcon
  /** Optional CSS class */
  className?: string
}

const sentimentTextColor: Record<TrendSentiment, string> = {
  positive: 'text-[var(--color-success)]',
  negative: 'text-[var(--color-critical)]',
  neutral:  'text-[var(--color-muted)]',
}

export function MetricCard({
  title,
  value,
  unit,
  trend,
  trendDirection = 'neutral',
  trendSentiment = 'neutral',
  trendLabel,
  icon: Icon,
  className,
}: MetricCardProps) {
  const trendColor = sentimentTextColor[trendSentiment]

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5',
        className,
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-[var(--color-muted)]">{title}</p>
        {Icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-canvas)]">
            <Icon size={16} aria-hidden="true" className="text-[var(--color-primary)]" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold leading-none text-[var(--color-ink)]">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-[var(--color-muted)]">{unit}</span>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div className={cn('flex items-center gap-1.5 text-xs', trendColor)}>
          {trendDirection === 'up' && (
            <TrendingUp size={13} aria-hidden="true" />
          )}
          {trendDirection === 'down' && (
            <TrendingDown size={13} aria-hidden="true" />
          )}
          <span className="font-medium">{trend}</span>
          {trendLabel && (
            <span className="text-[var(--color-muted)]">{trendLabel}</span>
          )}
        </div>
      )}
    </article>
  )
}