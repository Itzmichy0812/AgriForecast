import { useLocation } from 'react-router-dom'
import { resolveWorkspace } from '@/app/router/navConfig'
import { NotificationButton } from './NotificationButton'
import { UserMenu } from './UserMenu'
import { WorkspaceSelector } from './WorkspaceSelector'

export function TopBar() {
  const { pathname } = useLocation()
  const workspace = resolveWorkspace(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:px-6">
      <div className="flex items-center gap-3">
        <WorkspaceSelector current={workspace} />
      </div>
      <div className="flex items-center gap-2">
        <NotificationButton count={3} />
        <UserMenu />
      </div>
    </header>
  )
}