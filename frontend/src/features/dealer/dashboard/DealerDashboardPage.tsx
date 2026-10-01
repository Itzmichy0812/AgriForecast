import {
  AlertTriangle,
  ArrowDownToLine,
  BarChart3,
  ClipboardCheck,
  Package,
} from 'lucide-react'
import { AlertBanner } from '@/components/shared/AlertBanner'
import { EmptyState } from '@/components/shared/EmptyState'
import { MetricCard } from '@/components/shared/MetricCard'
import { PageContainer } from '@/components/shared/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'

/** Demo data – will be replaced by real API calls in later phases. */
const METRICS = [
  {
    title: 'Tổng tồn kho',
    value: '4.820',
    unit: 'tấn',
    trend: '+5,2%',
    trendDirection: 'up',
    trendSentiment: 'positive',
    trendLabel: 'so với tháng trước',
    icon: Package,
  },
  {
    title: 'Dự báo nhu cầu tháng tới',
    value: '5.340',
    unit: 'tấn',
    trend: '+10,7%',
    trendDirection: 'up',
    trendSentiment: 'neutral',
    trendLabel: 'vs tháng này',
    icon: BarChart3,
  },
  {
    title: 'Yêu cầu bổ sung',
    value: '12',
    unit: 'yêu cầu',
    trend: '-3',
    trendDirection: 'down',
    trendSentiment: 'positive',
    trendLabel: 'vs tuần trước',
    icon: ArrowDownToLine,
  },
  {
    title: 'Tỉ lệ giao hàng đúng hạn',
    value: '94,3',
    unit: '%',
    trend: '-1,8%',
    trendDirection: 'down',
    trendSentiment: 'negative',
    trendLabel: 'vs tháng trước',
    icon: ClipboardCheck,
  },
] as const

const STATUS_DEMO: Array<{
  label: string
  variant: 'neutral' | 'info' | 'success' | 'warning' | 'critical'
}> = [
  { label: 'Bình thường', variant: 'neutral' },
  { label: 'Đang xử lý', variant: 'info' },
  { label: 'Hoàn thành', variant: 'success' },
  { label: 'Cần chú ý', variant: 'warning' },
  { label: 'Khẩn cấp', variant: 'critical' },
]

export function DealerDashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Tổng quan đại lý"
        description="Cập nhật lúc 08:42 SA, 01/10/2026"
        actions={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
          >
            Xuất báo cáo
          </button>
        }
      />

      {/* Warning alert */}
      <AlertBanner
        variant="warning"
        title="Tồn kho phân bón DAP dưới ngưỡng an toàn"
        description="Kho An Giang còn 120 tấn – thấp hơn 35% so với mức tối thiểu. Đề nghị gửi yêu cầu bổ sung trong hôm nay."
        dismissible
        className="mb-6"
      />

      {/* Metrics row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {METRICS.map((m) => (
          <MetricCard
            key={m.title}
            title={m.title}
            value={m.value}
            unit={m.unit}
            trend={m.trend}
            trendDirection={m.trendDirection}
            trendSentiment={m.trendSentiment}
            trendLabel={m.trendLabel}
            icon={m.icon}
          />
        ))}
      </div>

      {/* Section card demo */}
      <SectionCard
        title="Trạng thái hệ thống thiết kế"
        description="Xác nhận các thành phần hoạt động đúng – không phải dữ liệu nghiệp vụ thực"
        actions={
          <span className="text-xs text-[var(--color-muted)]">
            Giai đoạn 1 – Nền tảng
          </span>
        }
        className="mb-6"
      >
        {/* StatusBadge showcase */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Các trạng thái huy hiệu
          </h3>
          <div className="flex flex-wrap gap-2">
            {STATUS_DEMO.map((s) => (
              <StatusBadge key={s.variant} variant={s.variant}>
                {s.label}
              </StatusBadge>
            ))}
          </div>
        </div>

        {/* Alert variants */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Các loại cảnh báo
          </h3>
          <div className="space-y-2">
            <AlertBanner
              variant="info"
              title="Dữ liệu dự báo đã được cập nhật"
              description="Mô hình dự báo Q4/2026 đã chạy xong và sẵn sàng xem xét."
            />
            <AlertBanner
              variant="success"
              title="Đơn hàng #ĐH-20241001 đã giao thành công"
            />
            <AlertBanner
              variant="critical"
              title="Lỗi đồng bộ hệ thống"
              description="Không thể kết nối tới kho trung tâm. IT đang xử lý."
            />
          </div>
        </div>
      </SectionCard>

      {/* Empty state demo */}
      <SectionCard
        title="Cảnh báo tồn kho (demo trạng thái rỗng)"
        className="mb-6"
      >
        <EmptyState
          icon={AlertTriangle}
          title="Không có cảnh báo nào"
          description="Tất cả sản phẩm đang ở mức tồn kho an toàn."
        />
      </SectionCard>
    </PageContainer>
  )
}