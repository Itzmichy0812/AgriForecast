import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  Plus,
  TrendingUp,
  Truck,
} from 'lucide-react'
import { AlertBanner } from '@/components/shared/AlertBanner'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { MetricCard } from '@/components/shared/MetricCard'
import { PageContainer } from '@/components/shared/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ManualRequestDialog } from '@/components/shared/ManualRequestDialog'
import { useDealerDashboard } from '@/services/dealerQueries'
import type { FulfillmentState, ForecastStatus } from '@/types/dealer'

function getFulfillmentBadge(state: FulfillmentState) {
  switch (state) {
    case 'fulfilled':
      return <StatusBadge variant="success">Đã cấp đủ</StatusBadge>
    case 'partial':
      return <StatusBadge variant="warning">Cấp một phần</StatusBadge>
    case 'pending':
      return <StatusBadge variant="info">Chờ cấp</StatusBadge>
    case 'unable':
      return <StatusBadge variant="critical">Không thể cấp</StatusBadge>
  }
}

function getForecastBadge(status: ForecastStatus) {
  switch (status) {
    case 'confirmed':
      return <StatusBadge variant="success">Đã xác nhận</StatusBadge>
    case 'adjusted':
      return <StatusBadge variant="info">Đã điều chỉnh</StatusBadge>
    case 'needs_review':
      return <StatusBadge variant="warning">Cần review</StatusBadge>
    case 'normal':
      return <StatusBadge variant="neutral">Bình thường</StatusBadge>
  }
}

export function DealerDashboardPage() {
  const navigate = useNavigate()
  const { data: dashboard, isLoading, error } = useDealerDashboard()
  const [isRequestDialogOpen, setIsRequestDialogOpen] = React.useState(false)

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <LoadingSkeleton className="h-16 w-full" />
          <LoadingSkeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <LoadingSkeleton className="h-28" />
            <LoadingSkeleton className="h-28" />
            <LoadingSkeleton className="h-28" />
            <LoadingSkeleton className="h-28" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <LoadingSkeleton className="h-80 lg:col-span-2" />
            <LoadingSkeleton className="h-80" />
          </div>
        </div>
      </PageContainer>
    )
  }

  if (error || !dashboard) {
    return (
      <PageContainer>
        <AlertBanner
          variant="critical"
          title="Không thể tải dữ liệu bảng điều khiển"
          description="Đã xảy ra lỗi khi tải dữ liệu đại lý. Vui lòng thử lại sau."
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title="Tổng quan Đại lý"
        description={`${dashboard.dealerName} — ${dashboard.location} • Cập nhật lúc ${dashboard.lastUpdated}`}
        actions={
          <button
            type="button"
            onClick={() => setIsRequestDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
          >
            <Plus size={16} aria-hidden="true" />
            Tạo yêu cầu mới
          </button>
        }
      />

      {/* Exception-first Top Urgent Alert */}
      {dashboard.metrics.forecastNeedsReviewCount > 0 && (
        <div className="mb-6">
          <AlertBanner
            variant="warning"
            title={dashboard.urgentAlertText}
            description="Kỳ kế hoạch vụ Đông Xuân sắp khóa số liệu. Đại lý cần kiểm tra và xác nhận hoặc điều chỉnh số liệu dự báo trước thời hạn."
            actions={
              <Link
                to="/dealer/forecast?status=needs_review"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-warning)] hover:underline"
              >
                Xem danh sách cần duyệt
                <ArrowRight size={14} />
              </Link>
            }
          />
        </div>
      )}

      {/* 4 Actionable Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <Link
          to="/dealer/forecast?status=needs_review"
          className="group block transition-transform hover:-translate-y-0.5"
        >
          <MetricCard
            title="Forecast cần xem"
            value={String(dashboard.metrics.forecastNeedsReviewCount)}
            unit="SKU"
            trend={dashboard.metrics.forecastNeedsReviewCount > 0 ? 'Cần xử lý' : 'Đã đủ'}
            trendDirection={dashboard.metrics.forecastNeedsReviewCount > 0 ? 'up' : 'neutral'}
            trendSentiment={dashboard.metrics.forecastNeedsReviewCount > 0 ? 'negative' : 'positive'}
            trendLabel="kỳ Tháng 10/2026"
            icon={TrendingUp}
            className="border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors"
          />
        </Link>

        <Link
          to="/dealer/inventory?status=critical"
          className="group block transition-transform hover:-translate-y-0.5"
        >
          <MetricCard
            title="SKU tồn thấp"
            value={String(dashboard.metrics.lowStockCount)}
            unit="SKU"
            trend={dashboard.metrics.lowStockCount > 0 ? 'Cảnh báo' : 'An toàn'}
            trendDirection={dashboard.metrics.lowStockCount > 0 ? 'down' : 'neutral'}
            trendSentiment={dashboard.metrics.lowStockCount > 0 ? 'negative' : 'positive'}
            trendLabel="nguy cơ thiếu hụt"
            icon={AlertTriangle}
            className="border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors"
          />
        </Link>

        <Link
          to="/dealer/requests?fulfillment=partial"
          className="group block transition-transform hover:-translate-y-0.5"
        >
          <MetricCard
            title="Chưa cấp đủ"
            value={String(dashboard.metrics.unfulfilledRequestsCount)}
            unit="yêu cầu"
            trend="Đang theo dõi"
            trendDirection="neutral"
            trendSentiment="neutral"
            trendLabel="chờ RM / Kho Vùng xử lý"
            icon={Clock}
            className="border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors"
          />
        </Link>

        <Link
          to="/dealer/inventory"
          className="group block transition-transform hover:-translate-y-0.5"
        >
          <MetricCard
            title="Hàng sắp về"
            value={String(dashboard.metrics.incomingSkuCount)}
            unit={`SKU (${dashboard.metrics.totalIncomingQty} Tấn)`}
            trend="Đang vận chuyển"
            trendDirection="up"
            trendSentiment="positive"
            trendLabel="dự kiến trong 3 ngày"
            icon={Truck}
            className="border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors"
          />
        </Link>
      </div>

      {/* Main Grid: Exception-first primary area + side widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        {/* Left Column (2 spans): A. VIỆC CẦN XỬ LÝ & C. FORECAST SẮP TỚI */}
        <div className="space-y-6 lg:col-span-2">
          {/* A. VIỆC CẦN XỬ LÝ — PRIMARY AREA */}
          <SectionCard
            title="Việc cần xử lý"
            description="Các vấn đề ưu tiên cao cần quyết định hoặc can thiệp ngay hôm nay"
            actions={
              <span className="text-xs font-semibold text-[var(--color-primary)]">
                {dashboard.actionItems.length} mục ưu tiên
              </span>
            }
          >
            <div className="space-y-3">
              {dashboard.actionItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.targetUrl)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] p-4 transition-all hover:bg-[var(--color-surface)] hover:border-[var(--color-primary)] cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        variant={
                          item.severity === 'critical'
                            ? 'critical'
                            : item.severity === 'warning'
                              ? 'warning'
                              : 'info'
                        }
                      >
                        {item.badgeText}
                      </StatusBadge>
                      <h4 className="text-sm font-semibold text-[var(--color-ink)]">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-[var(--color-muted)]">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-[var(--color-muted)]">
                      {item.timestamp}
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
                    >
                      Xử lý
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* C. FORECAST SẮP TỚI — COMPACT TABLE */}
          <SectionCard
            title="Forecast sắp tới"
            description="Kỳ Tháng 10/2026 — Nhấp vào dòng để xem chi tiết và giải trình tín hiệu"
            actions={
              <Link
                to="/dealer/forecast"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                Xem tất cả ({dashboard.upcomingForecasts.length})
                <ArrowRight size={14} />
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-muted)] font-medium">
                    <th className="py-2.5 pr-4">Mã SKU & Tên sản phẩm</th>
                    <th className="py-2.5 px-3 text-right">System</th>
                    <th className="py-2.5 px-3 text-right">Dealer Adjusted</th>
                    <th className="py-2.5 px-3 text-right">Final Planning</th>
                    <th className="py-2.5 pl-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {dashboard.upcomingForecasts.map((fc) => (
                    <tr
                      key={fc.id}
                      onClick={() => navigate(`/dealer/forecast/${fc.id}`)}
                      className="group cursor-pointer hover:bg-[var(--color-canvas)] transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <div className="font-medium text-[var(--color-ink)] group-hover:text-[var(--color-primary)] transition-colors">
                          {fc.skuName}
                        </div>
                        <div className="text-xs text-[var(--color-muted)]">
                          {fc.sku} • {fc.unit}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-[var(--color-ink)]">
                        {fc.systemForecast}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {fc.dealerAdjusted !== null ? (
                          <span className="font-semibold text-[var(--color-accent)]">
                            {fc.dealerAdjusted}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--color-muted)]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-[var(--color-primary)]">
                        {fc.finalPlanning}
                      </td>
                      <td className="py-3 pl-3 text-right">
                        {getForecastBadge(fc.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* Right Column (1 span): B. TÌNH TRẠNG TỒN KHO & D. YÊU CẦU GẦN ĐÂY */}
        <div className="space-y-6">
          {/* B. TÌNH TRẠNG TỒN KHO */}
          <SectionCard
            title="Tình trạng tồn kho"
            description="Phân loại theo mức độ an toàn cung ứng"
            actions={
              <Link
                to="/dealer/inventory"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                Chi tiết kho
                <ArrowRight size={14} />
              </Link>
            }
          >
            <div className="space-y-3">
              <Link
                to="/dealer/inventory?status=normal"
                className="flex items-center justify-between rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 hover:bg-[var(--color-canvas)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)]" />
                  <span className="text-sm font-medium text-[var(--color-ink)]">
                    Bình thường
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-base font-semibold text-[var(--color-ink)]">
                    {dashboard.inventoryCounts.normal}
                  </span>
                  <span className="text-xs text-[var(--color-muted)]">SKU</span>
                </div>
              </Link>

              <Link
                to="/dealer/inventory?status=caution"
                className="flex items-center justify-between rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 hover:bg-[var(--color-canvas)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-warning)]" />
                  <span className="text-sm font-medium text-[var(--color-ink)]">
                    Cần chú ý
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-base font-semibold text-[var(--color-warning)]">
                    {dashboard.inventoryCounts.caution}
                  </span>
                  <span className="text-xs text-[var(--color-muted)]">SKU</span>
                </div>
              </Link>

              <Link
                to="/dealer/inventory?status=critical"
                className="flex items-center justify-between rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 hover:bg-[var(--color-canvas)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-critical)]" />
                  <span className="text-sm font-medium text-[var(--color-ink)]">
                    Nguy cơ thiếu
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-base font-semibold text-[var(--color-critical)]">
                    {dashboard.inventoryCounts.critical}
                  </span>
                  <span className="text-xs text-[var(--color-muted)]">SKU</span>
                </div>
              </Link>
            </div>
          </SectionCard>

          {/* D. YÊU CẦU GẦN ĐÂY */}
          <SectionCard
            title="Yêu cầu gần đây"
            description="Các đơn yêu cầu bổ sung hàng hóa ngoài kế hoạch"
            actions={
              <Link
                to="/dealer/requests"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                Xem tất cả
                <ArrowRight size={14} />
              </Link>
            }
          >
            <div className="divide-y divide-[var(--color-border)]">
              {dashboard.recentRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => navigate(`/dealer/requests/${req.id}`)}
                  className="py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-[var(--color-canvas)] transition-colors rounded-sm px-1.5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-semibold text-[var(--color-ink)]">
                      #{req.id}
                    </span>
                    {getFulfillmentBadge(req.fulfillmentState)}
                  </div>
                  <div className="text-sm font-medium text-[var(--color-ink)] line-clamp-1">
                    {req.skuName}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-[var(--color-muted)]">
                    <span>
                      Yêu cầu:{' '}
                      <strong className="text-[var(--color-ink)]">
                        {req.requestedQty}
                      </strong>{' '}
                      {req.unit}
                    </span>
                    <span>
                      Đã cấp:{' '}
                      <strong className="text-[var(--color-ink)]">
                        {req.allocatedQty}
                      </strong>
                    </span>
                    <span>
                      Còn lại:{' '}
                      <strong className="text-[var(--color-critical)]">
                        {req.remainingQty}
                      </strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Manual Request Dialog triggered from header button */}
      <ManualRequestDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        onSuccess={(id) => {
          navigate(`/dealer/requests/${id}`)
        }}
      />
    </PageContainer>
  )
}