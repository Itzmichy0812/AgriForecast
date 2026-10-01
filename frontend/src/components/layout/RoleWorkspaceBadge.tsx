import { cn } from '@/lib/utils'
import type { Role } from '@/types/nav'

const roleStyles: Record<Role, string> = {
  dealer: 'bg-[var(--color-status-success-bg)] text-[var(--color-status-success-fg)]',
  rm:     'bg-[var(--color-status-info-bg)]    text-[var(--color-status-info-fg)]',
  scm:    'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)]',
  admin:  'bg-[#F3E8FF]                        text-[#7E22CE]',
}

const roleLabels: Record<Role, string> = {
  dealer: 'Dai ly',
  rm:     'Vung',
  scm:    'SCM',
  admin:  'Admin',
}

interface RoleWorkspaceBadgeProps {
  role: Role
  className?: string
}

export function RoleWorkspaceBadge({ role, className }: RoleWorkspaceBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        roleStyles[role],
        className,
      )}
    >
      {roleLabels[role]}
    </span>
  )
}