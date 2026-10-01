import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserMenuProps {
  name?: string
  email?: string
}

export function UserMenu({
  name = 'Nguyen Van A',
  email = 'nguyenvana@agri.vn',
}: UserMenuProps) {
  const initials = name
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`Tai khoan cua ${name}`}
          className={cn(
            'flex items-center gap-2 rounded-[var(--radius-control)] px-2 py-1',
            'hover:bg-[var(--color-border)] transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]',
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-white">
            {initials}
          </div>
          <span className="hidden text-sm font-medium text-[var(--color-ink)] lg:block truncate max-w-[120px]">
            {name}
          </span>
          <ChevronDown
            size={14}
            aria-hidden="true"
            className="text-[var(--color-muted)]"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className={cn(
            'z-50 min-w-[192px] rounded-[var(--radius-card)] border border-[var(--color-border)]',
            'bg-[var(--color-surface)] shadow-md py-1',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
          )}
        >
          {/* User info header – not interactive */}
          <div className="border-b border-[var(--color-border)] px-3 py-2">
            <p className="text-sm font-medium text-[var(--color-ink)] truncate">{name}</p>
            <p className="text-xs text-[var(--color-muted)] truncate">{email}</p>
          </div>

          {/* Unimplemented actions – rendered disabled with clear semantics */}
          <DropdownMenu.Item
            disabled
            className={cn(
              'flex cursor-not-allowed select-none items-center gap-2 px-3 py-2 text-sm outline-none',
              'text-[var(--color-muted)] opacity-60',
            )}
          >
            <User size={14} aria-hidden="true" />
            Ho so
          </DropdownMenu.Item>

          <DropdownMenu.Item
            disabled
            className={cn(
              'flex cursor-not-allowed select-none items-center gap-2 px-3 py-2 text-sm outline-none',
              'text-[var(--color-muted)] opacity-60',
            )}
          >
            <Settings size={14} aria-hidden="true" />
            Cai dat
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 border-t border-[var(--color-border)]" />

          <DropdownMenu.Item
            disabled
            className={cn(
              'flex cursor-not-allowed select-none items-center gap-2 px-3 py-2 text-sm outline-none',
              'text-[var(--color-status-critical-fg)] opacity-60',
            )}
          >
            <LogOut size={14} aria-hidden="true" />
            Dang xuat
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}