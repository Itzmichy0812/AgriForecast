import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationButtonProps {
  count?: number
  onClick?: () => void
}

export function NotificationButton({ count = 0, onClick }: NotificationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        count > 0
          ? `${count} thông báo chưa đọc`
          : 'Thông báo'
      }
      className={cn(
        'relative flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)]',
        'text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]',
        'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]',
      )}
    >
      <Bell size={18} aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-critical)] text-[10px] font-semibold text-white leading-none"
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}