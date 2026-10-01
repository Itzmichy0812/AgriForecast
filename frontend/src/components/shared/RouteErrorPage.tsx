import { AlertCircle } from 'lucide-react'
import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom'

/**
 * Shown when a route loader or action throws.
 * Attached as `errorElement` on the AppShell route.
 */
export function RouteErrorPage() {
  const error = useRouteError()

  const isNotFound =
    isRouteErrorResponse(error) && error.status === 404

  const title = isNotFound
    ? '404 - Trang không tồn tại'
    : 'Đã xảy ra lỗi'

  const description = isNotFound
    ? 'Đường dẫn bạn truy cập không hợp lệ hoặc đã bị xóa.'
    : 'Có lỗi xảy ra khi tải trang này. Vui lòng thử lại sau.'

  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const firstSegment = pathname.split('/').filter(Boolean)[0]
  const recoveryPath = firstSegment === 'scm' ? '/scm/dashboard' : '/dealer/dashboard'

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-status-critical-bg)]">
        <AlertCircle
          size={26}
          aria-hidden="true"
          className="text-[var(--color-status-critical-fg)]"
        />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">{title}</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{description}</p>
      </div>
      <Link
        to={recoveryPath}
        className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
      >
        Về trang chủ
      </Link>
    </div>
  )
}