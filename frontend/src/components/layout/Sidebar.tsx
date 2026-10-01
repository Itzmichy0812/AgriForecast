import { ChevronLeft, ChevronRight, Leaf } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { resolveWorkspace } from '@/app/router/navConfig'
import type { NavItem } from '@/types/nav'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

function SidebarNavItem({
  item,
  collapsed,
}: {
  item: NavItem
  collapsed: boolean
}) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-accent)]',
          isActive
            ? 'bg-[var(--color-sidebar-active-bg)] text-white'
            : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover-bg)] hover:text-white',
        )
      }
    >
      <Icon size={18} aria-hidden="true" className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto rounded-full bg-[var(--color-critical)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
          {item.badge}
        </span>
      )}
    </NavLink>
  )
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { pathname } = useLocation()
  const workspace = resolveWorkspace(pathname)

  return (
    <aside
      aria-label="Sidebar navigation"
      style={{
        width: collapsed
          ? 'var(--sidebar-width-collapsed)'
          : 'var(--sidebar-width)',
      }}
      className={cn(
        'flex flex-col shrink-0 bg-[var(--color-sidebar-bg)] border-r border-[var(--color-sidebar-border)]',
        'transition-[width] duration-200 ease-in-out overflow-hidden',
        'min-h-screen',
      )}
    >
      {/* Logo / Brand */}
      <div
        className={cn(
          'flex items-center gap-2.5 border-b border-[var(--color-sidebar-border)] h-14 px-3 shrink-0',
          collapsed && 'justify-center',
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary)]">
          <Leaf size={16} className="text-white" aria-hidden="true" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white leading-tight">
              AgriForecast
            </p>
            <p className="truncate text-[10px] text-[var(--color-sidebar-text-muted)] leading-tight mt-0.5">
              {workspace.displayName}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        {workspace.sections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.title && !collapsed && (
              <p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-sidebar-text-muted)]">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5" role="list">
              {section.items.map((item) => (
                <li key={item.to}>
                  <SidebarNavItem item={item} collapsed={collapsed} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-[var(--color-sidebar-border)] px-2 py-2">
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          className={cn(
            'flex w-full items-center rounded-[var(--radius-control)] px-3 py-2 text-[var(--color-sidebar-text-muted)]',
            'hover:bg-[var(--color-sidebar-hover-bg)] hover:text-white transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]',
            collapsed ? 'justify-center' : 'gap-3',
          )}
        >
          {collapsed ? (
            <ChevronRight size={16} aria-hidden="true" />
          ) : (
            <>
              <ChevronLeft size={16} aria-hidden="true" />
              <span className="text-xs">Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}