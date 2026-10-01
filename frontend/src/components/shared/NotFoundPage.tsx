import { MapPinOff } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--color-canvas)] px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-border)]">
        <MapPinOff size={28} aria-hidden="true" className="text-[var(--color-muted)]" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
          404 – Trang không tồn tại
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Đường dẫn bạn truy cập không hợp lệ hoặc đã bị xóa.
        </p>
      </div>
      <Link
        to="/dealer/dashboard"
        className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
      >
        Về trang chủ
      </Link>
    </div>
  )
}