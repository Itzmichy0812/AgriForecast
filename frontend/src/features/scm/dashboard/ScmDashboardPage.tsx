import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  GitMerge,
  Package,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import { PageContainer } from '@/components/shared/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AlertBanner } from '@/components/shared/AlertBanner'
import { MetricCard } from '@/components/shared/MetricCard'
import { useScmDashboard } from '../scmQueries'
import { REGION_LABELS } from '@/types/scm'
import type { RegionHealthStatus, NetworkActionItem } from '@/types/scm'

function regionHealthVariant(status: RegionHealthStatus) {
  switch (status) {
    case 'stable':         return 'success' as const
    case 'needs_balancing': return 'warning' as const
    case 'shortage':       return 'critical' as const
  }
}

function regionHealthLabel(status: RegionHealthStatus) {
  switch (status) {
    case 'stable':          return 'Ổn định'
    case 'needs_balancing': return 'Cần cân đối'
    case 'shortage':        return 'Thiếu hụt'
  }
}

function actionSeverityVariant(severity: NetworkActionItem['severity']) {
  switch (severity) {
    case 'critical': return 'critical' as const
    case 'warning':  return 'warning' as const
    case 'info':     return 'info' as const
  }
}

function actionTypeIcon(type: NetworkActionItem['type']) {
  switch (type) {
    case 'rebalancing':       return GitMerge
    case 'central_allocation': return Package
    case 'procurement':       return ShoppingCart
    case 'transfer':          return TrendingUp
  }
}

export function ScmDashboardPage() {
  const navigate = useNavigate()
  const { data: summary, isLoading } = useScmDashboard()

  if (isLoading || !summary) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center text-[var(--color-muted)]">
          Đang tải dữ liệu mạng lưới...
        </div>
      </PageContainer>
    )
  }

  const hasCriticalShortage = summary.networkShortageTotal > 0

  return (
    <PageContainer>
      <PageHeader
        title="Toàn mạng lưới"
        description={`Tổng quan chuỗi cung ứng · Cập nhật lúc ${new Date(summary.lastUpdated).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
      />

      {/* Top alert */}
      {hasCriticalShortage && (
        <div className="mb-6">
          <AlertBanner
            variant="critical"
            title={`Còn ${summary.networkShortageTotal.toLocaleString('vi-VN')} đơn vị chưa được giải quyết trên toàn mạng lưới`}
            description="Kiểm tra danh sách hành động bên dưới để xử lý các điểm tắc nghẽn theo thứ tự ưu tiên."
          />
        </div>
      )}

      {/* KPI Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          title="Thiếu hụt chưa có phương án"
          value={summary.networkShortageTotal.toLocaleString('vi-VN')}
          unit="đơn vị"
          trend={summary.networkShortageTotal > 0 ? 'Cần xử lý' : 'Đã có phương án'}
          trendDirection={summary.networkShortageTotal > 0 ? 'up' : 'neutral'}
          trendSentiment={summary.networkShortageTotal > 0 ? 'negative' : 'positive'}
          icon={AlertTriangle}
        />
        <MetricCard
          title="Tổng thiếu từ vùng"
          value={summary.regionalShortageTotal.toLocaleString('vi-VN')}
          unit="đơn vị"
          trend="Sau xử lý RM"
          trendDirection="neutral"
          trendSentiment="neutral"
          icon={BarChart3}
        />
        <MetricCard
          title="Kho Trung tâm khả dụng"
          value={summary.centralAvailableTotal.toLocaleString('vi-VN')}
          unit="đơn vị"
          trend="Tổng tồn khả dụng"
          trendDirection="neutral"
          trendSentiment="neutral"
          icon={Package}
        />
        <MetricCard
          title="Điều chuyển đang xử lý"
          value={summary.activeTransferCount.toString()}
          unit="lô"
          trend={`${summary.openProcurementCount} PO chờ duyệt`}
          trendDirection="neutral"
          trendSentiment="neutral"
          icon={GitMerge}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Network Action Center */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Trung tâm hành động mạng lưới"
            description="Các mục cần SCM xử lý theo thứ tự ưu tiên"
            noPadding
          >
            {summary.actionItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center text-[var(--color-muted)]">
                <CheckCircle2 size={32} className="text-[var(--color-status-success-fg)]" />
                <p className="text-sm font-medium text-[var(--color-ink)]">Không có hành động nào cần xử lý</p>
                <p className="text-xs">Tất cả yêu cầu vùng đã được phân bổ đầy đủ.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {summary.actionItems.map((item) => {
                  const Icon = actionTypeIcon(item.type)
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => navigate(item.targetUrl)}
                        className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-[var(--color-canvas)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
                      >
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] ${
                            item.severity === 'critical'
                              ? 'bg-[var(--color-status-critical-bg)]'
                              : item.severity === 'warning'
                                ? 'bg-[var(--color-status-warning-bg)]'
                                : 'bg-[var(--color-status-info-bg)]'
                          }`}
                        >
                          <Icon
                            size={16}
                            className={
                              item.severity === 'critical'
                                ? 'text-[var(--color-status-critical-fg)]'
                                : item.severity === 'warning'
                                  ? 'text-[var(--color-status-warning-fg)]'
                                  : 'text-[var(--color-status-info-fg)]'
                            }
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-[var(--color-ink)]">{item.title}</p>
                            <StatusBadge variant={actionSeverityVariant(item.severity)} dot>
                              {item.badgeText}
                            </StatusBadge>
                          </div>
                          <p className="mt-0.5 text-xs text-[var(--color-muted)]">{item.description}</p>
                        </div>

                        <ArrowRight size={16} className="mt-1 shrink-0 text-[var(--color-muted)]" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </SectionCard>
        </div>

        {/* Region Health Summary */}
        <div>
          <SectionCard
            title="Trạng thái vùng"
            description="Tình trạng cân bằng cung ứng theo vùng"
            noPadding
          >
            <ul className="divide-y divide-[var(--color-border)]">
              {summary.regionHealth.map((rh) => (
                <li key={rh.region} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-[var(--color-ink)]">
                      {REGION_LABELS[rh.region]}
                    </p>
                    {rh.remaining > 0 && (
                      <p className="text-xs text-[var(--color-critical)]">
                        Còn thiếu {rh.remaining.toLocaleString('vi-VN')} đv
                      </p>
                    )}
                  </div>
                  <StatusBadge variant={regionHealthVariant(rh.status)} dot>
                    {regionHealthLabel(rh.status)}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Region demand table */}
          <SectionCard
            title="Bảng tổng hợp vùng"
            description="RM Yêu cầu / SCM điều chỉnh / Còn lại"
            className="mt-4"
            noPadding
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-canvas)]">
                    <th className="px-3 py-2 text-left font-medium text-[var(--color-muted)]">Vùng</th>
                    <th className="px-3 py-2 text-right font-medium text-[var(--color-muted)]">RM Yêu cầu</th>
                    <th className="px-3 py-2 text-right font-medium text-[var(--color-muted)]">Còn thiếu</th>
                    <th className="px-3 py-2 text-center font-medium text-[var(--color-muted)]">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {summary.regionHealth.map((rh) => (
                    <tr key={rh.region} className="hover:bg-[var(--color-canvas)]">
                      <td className="px-3 py-2 font-medium text-[var(--color-ink)]">
                        <span className="line-clamp-1">{REGION_LABELS[rh.region].split(' ').slice(-2).join(' ')}</span>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-[var(--color-text)]">
                        {rh.totalRmRequested.toLocaleString('vi-VN')}
                      </td>
                      <td className={`px-3 py-2 text-right tabular-nums font-medium ${rh.remaining > 0 ? 'text-[var(--color-critical)]' : 'text-[var(--color-status-success-fg)]'}`}>
                        {rh.remaining > 0 ? rh.remaining.toLocaleString('vi-VN') : '0'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <StatusBadge variant={regionHealthVariant(rh.status)} dot={false}>
                          {regionHealthLabel(rh.status)}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Quick nav */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { label: 'Nhu cầu vùng', to: '/scm/regional-demand', icon: BarChart3 },
              { label: 'Điều chuyển', to: '/scm/rebalancing', icon: GitMerge },
              { label: 'Phân bổ TT', to: '/scm/central-allocation', icon: Package },
              { label: 'Mua hàng', to: '/scm/procurement', icon: ShoppingCart },
            ].map(({ label, to, icon: Icon }) => (
              <button
                key={to}
                type="button"
                onClick={() => navigate(to)}
                className="flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-primary)] hover:bg-[var(--color-canvas)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
              >
                <Icon size={14} className="text-[var(--color-primary)]" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top Requirements */}
      {summary.topRequirements.length > 0 && (
        <SectionCard
          title="Yêu cầu ưu tiên cao"
          description="Các SKU cần xử lý khẩn theo thứ tự ưu tiên"
          className="mt-6"
          noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-canvas)]">
                  {['Vùng', 'SKU', 'RM Yêu cầu', 'Điều chuyển', 'Cấp TT', 'Còn thiếu', 'Cần trước', 'Ưu tiên'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {summary.topRequirements.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-[var(--color-canvas)] cursor-pointer"
                    onClick={() => navigate(`/scm/regional-demand?selected=${req.id}`)}
                  >
                    <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
                      {REGION_LABELS[req.region].split(' ').slice(-2).join(' ')}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-[var(--color-ink)]">{req.skuName}</p>
                      <p className="text-xs text-[var(--color-muted)]">{req.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums">{req.rmRequested.toLocaleString('vi-VN')} {req.unit}</td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-[var(--color-status-info-fg)]">{req.rebalancingAllocated.toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-[var(--color-primary)]">{req.centralAllocated.toLocaleString('vi-VN')}</td>
                    <td className={`px-4 py-3 text-right text-xs tabular-nums font-semibold ${req.stillUnmet > 0 ? 'text-[var(--color-critical)]' : 'text-[var(--color-status-success-fg)]'}`}>
                      {req.stillUnmet.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-muted)]">{req.needByDate}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={req.priority === 'critical' ? 'critical' : req.priority === 'high' ? 'warning' : 'neutral'}
                        dot
                      >
                        {req.priority === 'critical' ? 'Khẩn cấp' : req.priority === 'high' ? 'Cao' : 'Bình thường'}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </PageContainer>
  )
}
