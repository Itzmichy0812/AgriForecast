import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronsUpDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { allWorkspaces } from '@/app/router/navConfig'
import type { WorkspaceConfig } from '@/types/nav'

interface WorkspaceSelectorProps {
  current: WorkspaceConfig
}

/**
 * Compact workspace switcher rendered in the TopBar.
 * Navigates to each workspace's home path on selection.
 * Uses Radix DropdownMenu for correct keyboard navigation,
 * Escape handling, and focus management.
 */
export function WorkspaceSelector({ current }: WorkspaceSelectorProps) {
  const navigate = useNavigate()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Khong gian lam viec hien tai: ${current.label}. Nhan de chuyen doi.`}
          className={cn(
            'flex items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5',
            'text-sm font-medium text-[var(--color-ink)]',
            'hover:bg-[var(--color-canvas)] transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]',
          )}
        >
          <span>{current.label}</span>
          <ChevronsUpDown size={13} aria-hidden="true" className="text-[var(--color-muted)]" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className={cn(
            'z-50 min-w-[160px] rounded-[var(--radius-card)] border border-[var(--color-border)]',
            'bg-[var(--color-surface)] shadow-md py-1',
            // Radix animation data attributes
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
          )}
        >
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Khong gian lam viec
          </p>
          {allWorkspaces.map((ws) => (
            <DropdownMenu.Item
              key={ws.role}
              onSelect={() => navigate(ws.homePath)}
              className={cn(
                'flex cursor-pointer select-none items-center gap-2 px-3 py-2 text-sm outline-none',
                'transition-colors',
                ws.role === current.role
                  ? 'bg-[var(--color-canvas)] font-medium text-[var(--color-primary)]'
                  : 'text-[var(--color-text)] data-[highlighted]:bg-[var(--color-canvas)] data-[highlighted]:text-[var(--color-ink)]',
              )}
            >
              {ws.label}
              {ws.role === current.role && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}