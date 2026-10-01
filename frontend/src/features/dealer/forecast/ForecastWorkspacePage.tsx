import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  Filter,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { PageContainer } from '@/components/shared/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useDealerForecasts } from '@/services/dealerQueries'
import type { ForecastStatus } from '@/types/dealer'

type SortColumn = 'skuName' | 'systemForecast' | 'dealerAdjusted' | 'finalPlanning' | 'variance' | 'status'
type SortOrder = 'asc' | 'desc'

function getForecastStatusBadge(status: ForecastStatus) {
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

export function ForecastWorkspacePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const statusFilter = searchParams.get('status') || 'all'
  const [periodFilter, setPeriodFilter] = React.useState<string>('2026-10')
  const [productGroupFilter, setProductGroupFilter] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [sortColumn, setSortColumn] = React.useState<SortColumn>('variance')
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc')

  const { data: forecasts = [], isLoading } = useDealerForecasts({
    periodKey: periodFilter,
  })

  const handleStatusChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (val === 'all') {
      newParams.delete('status')
    } else {
      newParams.set('status', val)
    }
    setSearchParams(newParams)
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortOrder('desc')
    }
  }

  // Filter & sort forecasts
  const processedData = React.useMemo(() => {
    const filtered = forecasts.filter((item) => {
      const matchStatus = statusFilter === 'all' || item.status === statusFilter
      const matchGroup =
        productGroupFilter === 'all' || item.productGroup === productGroupFilter
      const matchSearch =
        !searchQuery ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.skuName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchStatus && matchGroup && matchSearch
    })

    return filtered.sort((a, b) => {
      let valA: string | number = a[sortColumn] ?? 0
      let valB: string | number = b[sortColumn] ?? 0

      if (sortColumn === 'dealerAdjusted') {
        valA = a.dealerAdjusted ?? -1
        valB = b.dealerAdjusted ?? -1
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB, 'vi')
          : valB.localeCompare(valA, 'vi')
      }

      const numA = Number(valA)
      const numB = Number(valB)
      return sortOrder === 'asc' ? numA - numB : numB - numA
    })
  }, [forecasts, statusFilter, productGroupFilter, searchQuery, sortColumn, sortOrder])

  // Summary calculations
  const totalCount = forecasts.length
  const needsReviewCount = forecasts.filter((f) => f.status === 'needs_review').length
  const adjustedCount = forecasts.filter((f) => f.status === 'adjusted').length
  const confirmedCount = forecasts.filter((f) => f.status === 'confirmed').length

  const renderSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown size={12} className="opacity-40" />
    }
    return sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dự báo nhu cầu"
        description="Xem xét số liệu dự báo tự động của hệ thống, tín hiệu mùa vụ và thực hiện điều chỉnh nếu có biến động tại đại lý."
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleStatusChange('all')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStatusChange('all') } }}
          className={`cursor-pointer rounded-[var(--radius-card)] border p-4 transition-colors ${
            statusFilter === 'all'
              ? 'border-[var(--color-primary)] bg-[var(--color-canvas)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'
          } focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]`}
        >
          <p className="text-xs font-medium text-[var(--color-muted)]">Tổng SKU dự báo</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-ink)]">{totalCount}</p>
          <span className="text-xs text-[var(--color-muted)]">Kỳ Tháng 10/2026</span>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => handleStatusChange('needs_review')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStatusChange('needs_review') } }}
          className={`cursor-pointer rounded-[var(--radius-card)] border p-4 transition-colors ${
            statusFilter === 'needs_review'
              ? 'border-[var(--color-warning)] bg-[var(--color-status-warning-bg)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-warning)]'
          } focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--color-warning)]">Cần review xác nhận</p>
            <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-warning)]">{needsReviewCount}</p>
          <span className="text-xs text-[var(--color-muted)]">Biến động trên 15%</span>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => handleStatusChange('adjusted')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStatusChange('adjusted') } }}
          className={`cursor-pointer rounded-[var(--radius-card)] border p-4 transition-colors ${
            statusFilter === 'adjusted'
              ? 'border-[var(--color-accent)] bg-[var(--color-status-info-bg)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]'
          } focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--color-accent)]">Đại lý đã điều chỉnh</p>
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-accent)]">{adjustedCount}</p>
          <span className="text-xs text-[var(--color-muted)]">Kèm giải trình lý do</span>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => handleStatusChange('confirmed')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStatusChange('confirmed') } }}
          className={`cursor-pointer rounded-[var(--radius-card)] border p-4 transition-colors ${
            statusFilter === 'confirmed'
              ? 'border-[var(--color-success)] bg-[var(--color-status-success-bg)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-success)]'
          } focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--color-success)]">Đã xác nhận chốt</p>
            <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-success)]">{confirmedCount}</p>
          <span className="text-xs text-[var(--color-muted)]">Sẵn sàng lập kế hoạch SCM</span>
        </div>
      </div>

      {/* Workspace Table Section */}
      <SectionCard
        title="Danh sách kế hoạch dự báo theo sản phẩm"
        description="Nhấp vào từng dòng để mở màn hình phân tích tín hiệu mùa vụ và điều chỉnh số lượng"
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search SKU / Name */}
            <div className="relative min-w-[240px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              />
              <input
                type="text"
                placeholder="Tìm mã SKU, tên phân bón..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 py-1.5 text-xs text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 text-xs">
              <Filter size={14} className="text-[var(--color-muted)]" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="needs_review">Cần review</option>
                <option value="adjusted">Đã điều chỉnh</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="normal">Bình thường</option>
              </select>
            </div>

            {/* Product Group Filter */}
            <div className="flex items-center gap-1 text-xs">
              <select
                value={productGroupFilter}
                onChange={(e) => setProductGroupFilter(e.target.value)}
                className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
              >
                <option value="all">Tất cả ngành hàng</option>
                <option value="Phân bón vô cơ">Phân bón vô cơ</option>
                <option value="Phân bón NPK">Phân bón NPK</option>
                <option value="Thuốc bảo vệ thực vật">Thuốc bảo vệ thực vật</option>
                <option value="Phân bón hữu cơ">Phân bón hữu cơ</option>
              </select>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-muted)]">Kỳ dự báo:</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              <option value="2026-10">Tháng 10/2026 (Hiện tại)</option>
              <option value="2026-11">Tháng 11/2026 (Sắp tới)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="space-y-3 py-4">
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-12 w-full" />
            <LoadingSkeleton className="h-12 w-full" />
            <LoadingSkeleton className="h-12 w-full" />
          </div>
        ) : processedData.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Không tìm thấy SKU phù hợp"
              description="Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc trạng thái để xem đầy đủ danh sách."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-muted)] font-medium">
                  <th
                    className="py-3 pr-4 cursor-pointer hover:text-[var(--color-ink)] select-none"
                    onClick={() => handleSort('skuName')}
                  >
                    <div className="inline-flex items-center gap-1">
                      Mã SKU & Tên sản phẩm
                      {renderSortIndicator('skuName')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:text-[var(--color-ink)] select-none"
                    onClick={() => handleSort('systemForecast')}
                  >
                    <div className="inline-flex items-center justify-end gap-1 w-full">
                      System Forecast
                      {renderSortIndicator('systemForecast')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:text-[var(--color-ink)] select-none"
                    onClick={() => handleSort('dealerAdjusted')}
                  >
                    <div className="inline-flex items-center justify-end gap-1 w-full">
                      Dealer Adjusted
                      {renderSortIndicator('dealerAdjusted')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:text-[var(--color-ink)] select-none"
                    onClick={() => handleSort('finalPlanning')}
                  >
                    <div className="inline-flex items-center justify-end gap-1 w-full">
                      Final Planning
                      {renderSortIndicator('finalPlanning')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:text-[var(--color-ink)] select-none"
                    onClick={() => handleSort('variance')}
                  >
                    <div className="inline-flex items-center justify-end gap-1 w-full">
                      Biến động (%)
                      {renderSortIndicator('variance')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:text-[var(--color-ink)] select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="inline-flex items-center justify-end gap-1 w-full">
                      Trạng thái
                      {renderSortIndicator('status')}
                    </div>
                  </th>
                  <th className="py-3 pl-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {processedData.map((item) => {
                  const v = item.variance
                  const isPos = v > 0
                  return (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/dealer/forecast/${item.id}`)}
                      className="group cursor-pointer hover:bg-[var(--color-canvas)] transition-colors"
                    >
                      <td className="py-3.5 pr-4">
                        <div className="font-medium text-[var(--color-ink)] group-hover:text-[var(--color-primary)] transition-colors">
                          {item.skuName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                          <span className="font-mono">{item.sku}</span>
                          <span>•</span>
                          <span>{item.productGroup}</span>
                          <span>•</span>
                          <span>ĐVT: {item.unit}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium text-[var(--color-ink)]">
                        {item.systemForecast.toLocaleString('vi-VN')} {item.unit}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {item.dealerAdjusted !== null ? (
                          <span className="font-semibold text-[var(--color-accent)]">
                            {item.dealerAdjusted.toLocaleString('vi-VN')} {item.unit}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--color-muted)] italic">
                            Chưa chỉnh
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-semibold text-[var(--color-primary)]">
                        {item.finalPlanning.toLocaleString('vi-VN')} {item.unit}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div
                          className={`inline-flex items-center justify-end gap-1 text-xs font-semibold ${
                            Math.abs(v) > 20
                              ? 'text-[var(--color-critical)]'
                              : isPos
                                ? 'text-[var(--color-success)]'
                                : 'text-[var(--color-muted)]'
                          }`}
                        >
                          {isPos ? (
                            <TrendingUp size={13} />
                          ) : (
                            <TrendingDown size={13} />
                          )}
                          <span>
                            {isPos ? '+' : ''}
                            {v}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {getForecastStatusBadge(item.status)}
                      </td>
                      <td className="py-3.5 pl-3 text-right text-[var(--color-muted)]">
                        <ChevronRight size={18} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </PageContainer>
  )
}