import * as React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Filter,
  Package,
  Plus,
  Search,
  Truck,
} from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { ManualRequestDialog } from '@/components/shared/ManualRequestDialog'
import { PageContainer } from '@/components/shared/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useDealerInventory } from '@/services/dealerQueries'
import type { InventoryStatus } from '@/types/dealer'

type SortColumn = 'skuName' | 'onHand' | 'incoming' | 'allocated' | 'available' | 'coverageDays' | 'rop' | 'status'
type SortOrder = 'asc' | 'desc'

function getInventoryStatusBadge(status: InventoryStatus) {
  switch (status) {
    case 'normal':
      return <StatusBadge variant="success">Bình thường</StatusBadge>
    case 'caution':
      return <StatusBadge variant="warning">Cần chú ý</StatusBadge>
    case 'critical':
      return <StatusBadge variant="critical">Nguy cơ thiếu</StatusBadge>
  }
}

export function InventoryPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const statusFilter = searchParams.get('status') || 'all'
  const expiryFilter = searchParams.get('expiry') || 'all'
  const incomingFilter = searchParams.get('incoming') || 'all'
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [sortColumn, setSortColumn] = React.useState<SortColumn>('coverageDays')
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('asc')

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedSku, setSelectedSku] = React.useState<string>('')

  const { data: inventory = [], isLoading } = useDealerInventory()

  const handleStatusChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (val === 'all') {
      newParams.delete('status')
    } else {
      newParams.set('status', val)
    }
    newParams.delete('expiry')
    newParams.delete('incoming')
    setSearchParams(newParams)
  }

  const handleExpiryFilter = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('status')
    newParams.delete('incoming')
    if (expiryFilter === 'soon') {
      newParams.delete('expiry')
    } else {
      newParams.set('expiry', 'soon')
    }
    setSearchParams(newParams)
  }

  const handleIncomingFilter = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('status')
    newParams.delete('expiry')
    if (incomingFilter === 'yes') {
      newParams.delete('incoming')
    } else {
      newParams.set('incoming', 'yes')
    }
    setSearchParams(newParams)
  }

  const handleClearFilter = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('status')
    newParams.delete('expiry')
    newParams.delete('incoming')
    setSearchParams(newParams)
  }

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortOrder('asc')
    }
  }

  const handleOpenRequestDialog = (sku: string = '') => {
    setSelectedSku(sku)
    setDialogOpen(true)
  }

  // Filter & sort inventory
  const processedData = React.useMemo(() => {
    const filtered = inventory.filter((item) => {
      const matchStatus = statusFilter === 'all' || item.status === statusFilter
      const matchSearch =
        !searchQuery ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.skuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.warehouseLocation.toLowerCase().includes(searchQuery.toLowerCase())
      const matchExpiry =
        expiryFilter !== 'soon' ||
        (() => {
          if (!item.expiryDate) return false
          const exp = new Date(item.expiryDate).getTime()
          const now = new Date('2026-10-01').getTime()
          return exp - now < 90 * 24 * 60 * 60 * 1000
        })()
      const matchIncoming = incomingFilter !== 'yes' || item.incoming > 0
      return matchStatus && matchSearch && matchExpiry && matchIncoming
    })

    return filtered.sort((a, b) => {
      const valA: string | number = a[sortColumn] ?? 0
      const valB: string | number = b[sortColumn] ?? 0

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB, 'vi')
          : valB.localeCompare(valA, 'vi')
      }

      const numA = Number(valA)
      const numB = Number(valB)
      return sortOrder === 'asc' ? numA - numB : numB - numA
    })
  }, [inventory, statusFilter, expiryFilter, incomingFilter, searchQuery, sortColumn, sortOrder])

  // Derived KPI metrics
  const totalSkuCount = inventory.length
  const criticalCount = inventory.filter((i) => i.status === 'critical').length
  const cautionCount = inventory.filter((i) => i.status === 'caution').length
  const incomingSkuCount = inventory.filter((i) => i.incoming > 0).length
  const expiringSoonCount = inventory.filter((i) => {
    if (!i.expiryDate) return false
    const exp = new Date(i.expiryDate).getTime()
    const now = new Date('2026-10-01').getTime()
    // Within 90 days
    return exp - now < 90 * 24 * 60 * 60 * 1000
  }).length

  const renderSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown size={12} className="opacity-40" />
    }
    return sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
  }

  return (
    <PageContainer>
      <PageHeader
        title="Quản lý tồn kho Đại lý"
        description="Theo dõi lượng tồn thực tế, khả dụng, tiến độ hàng đang về và điểm đặt hàng lại (ROP) tại kho đại lý."
        actions={
          <button
            type="button"
            onClick={() => handleOpenRequestDialog('')}
            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
          >
            <Plus size={16} aria-hidden="true" />
            Tạo yêu cầu mới
          </button>
        }
      />

      {/* Summary KPI Cards (4 Cards) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        {/* SKU đang quản lý — clears all filters */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleClearFilter}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClearFilter() } }}
          className={`cursor-pointer rounded-[var(--radius-card)] border p-4 transition-colors ${
            statusFilter === 'all' && expiryFilter === 'all' && incomingFilter === 'all'
              ? 'border-[var(--color-primary)] bg-[var(--color-canvas)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'
          } focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--color-muted)]">SKU đang quản lý</p>
            <Package size={16} className="text-[var(--color-muted)]" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-ink)]">{totalSkuCount}</p>
          <span className="text-xs text-[var(--color-muted)]">Tại kho Thoại Sơn</span>
        </div>

        {/* Nguy cơ thiếu — critical filter */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleStatusChange('critical')}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStatusChange('critical') } }}
          className={`cursor-pointer rounded-[var(--radius-card)] border p-4 transition-colors ${
            statusFilter === 'critical'
              ? 'border-[var(--color-critical)] bg-[var(--color-status-critical-bg)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-critical)]'
          } focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--color-critical)]">Nguy cơ thiếu</p>
            <AlertTriangle size={16} className="text-[var(--color-critical)]" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-critical)]">{criticalCount}</p>
          <span className="text-xs text-[var(--color-muted)]">Tồn khả dụng &lt; ROP</span>
        </div>

        {/* Sắp hết hạn — expiry filter */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleExpiryFilter}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleExpiryFilter() } }}
          className={`cursor-pointer rounded-[var(--radius-card)] border p-4 transition-colors ${
            expiryFilter === 'soon'
              ? 'border-[var(--color-warning)] bg-[var(--color-status-warning-bg)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-warning)]'
          } focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--color-warning)]">Sắp hết hạn</p>
            <Calendar size={16} className="text-[var(--color-warning)]" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-warning)]">{expiringSoonCount}</p>
          <span className="text-xs text-[var(--color-muted)]">Hạn dùng &lt; 90 ngày</span>
        </div>

        {/* Hàng đang về — incoming filter */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleIncomingFilter}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleIncomingFilter() } }}
          className={`cursor-pointer rounded-[var(--radius-card)] border p-4 transition-colors ${
            incomingFilter === 'yes'
              ? 'border-[var(--color-primary)] bg-[var(--color-canvas)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'
          } focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--color-primary)]">Hàng đang về</p>
            <Truck size={16} className="text-[var(--color-primary)]" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-primary)]">{incomingSkuCount}</p>
          <span className="text-xs text-[var(--color-muted)]">SKU có lịch vận chuyển</span>
        </div>
      </div>

      {/* Main Inventory Table Section */}
      <SectionCard
        title="Danh mục tồn kho chi tiết"
        description="Quy tắc cân bằng tồn: Khả dụng (Available) = Tồn thực tế (On-hand) - Đã giữ chỗ (Allocated). Hàng đang về không cộng vào khả dụng."
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[260px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              />
              <input
                type="text"
                placeholder="Tìm mã SKU, tên phân bón, vị trí kho..."
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
                <option value="all">Tất cả tình trạng</option>
                <option value="normal">Bình thường</option>
                <option value="caution">Cần chú ý ({cautionCount})</option>
                <option value="critical">Nguy cơ thiếu ({criticalCount})</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-[var(--color-muted)]">
            Hiển thị <strong className="text-[var(--color-ink)]">{processedData.length}</strong> / {totalSkuCount} SKU
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
              title="Không tìm thấy mặt hàng nào"
              description="Thử điều chỉnh lại bộ lọc trạng thái hoặc từ khóa tìm kiếm."
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
                      SKU & Mặt hàng
                      {renderSortIndicator('skuName')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-2 text-right cursor-pointer hover:text-[var(--color-ink)] select-none"
                    onClick={() => handleSort('onHand')}
                  >
                    <div className="inline-flex items-center justify-end gap-1 w-full">
                      On-hand
                      {renderSortIndicator('onHand')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-2 text-right cursor-pointer hover:text-[var(--color-ink)] select-none"
                    onClick={() => handleSort('incoming')}
                  >
                    <div className="inline-flex items-center justify-end gap-1 w-full">
                      Incoming
                      {renderSortIndicator('incoming')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-2 text-right cursor-pointer hover:text-[var(--color-ink)] select-none"
                    onClick={() => handleSort('allocated')}
                  >
                    <div className="inline-flex items-center justify-end gap-1 w-full">
                      Allocated
                      {renderSortIndicator('allocated')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-2 text-right cursor-pointer hover:text-[var(--color-ink)] select-none"
                    onClick={() => handleSort('available')}
                  >
                    <div className="inline-flex items-center justify-end gap-1 w-full">
                      Available
                      {renderSortIndicator('available')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-2 text-right cursor-pointer hover:text-[var(--color-ink)] select-none"
                    onClick={() => handleSort('coverageDays')}
                  >
                    <div className="inline-flex items-center justify-end gap-1 w-full">
                      Coverage
                      {renderSortIndicator('coverageDays')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-2 text-right cursor-pointer hover:text-[var(--color-ink)] select-none"
                    onClick={() => handleSort('rop')}
                  >
                    <div className="inline-flex items-center justify-end gap-1 w-full">
                      ROP
                      {renderSortIndicator('rop')}
                    </div>
                  </th>
                  <th
                    className="py-3 px-2 text-right cursor-pointer hover:text-[var(--color-ink)] select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="inline-flex items-center justify-end gap-1 w-full">
                      Trạng thái
                      {renderSortIndicator('status')}
                    </div>
                  </th>
                  <th className="py-3 pl-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {processedData.map((item) => {
                  const isLow = item.available <= item.rop
                  return (
                    <tr
                      key={item.id}
                      className="group hover:bg-[var(--color-canvas)] transition-colors"
                    >
                      <td className="py-3.5 pr-4">
                        <div className="font-medium text-[var(--color-ink)]">
                          {item.skuName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                          <span className="font-mono">{item.sku}</span>
                          <span>•</span>
                          <span>{item.warehouseLocation}</span>
                          <span>•</span>
                          <span>ĐVT: {item.unit}</span>
                        </div>
                      </td>

                      {/* On-hand */}
                      <td className="py-3.5 px-2 text-right font-medium text-[var(--color-ink)]">
                        {item.onHand.toLocaleString('vi-VN')}
                      </td>

                      {/* Incoming */}
                      <td className="py-3.5 px-2 text-right font-medium text-blue-600">
                        {item.incoming > 0 ? (
                          `+${item.incoming.toLocaleString('vi-VN')}`
                        ) : (
                          <span className="text-[var(--color-muted)] font-normal">0</span>
                        )}
                      </td>

                      {/* Allocated */}
                      <td className="py-3.5 px-2 text-right text-[var(--color-muted)]">
                        {item.allocated.toLocaleString('vi-VN')}
                      </td>

                      {/* Available = onHand - allocated */}
                      <td
                        className={`py-3.5 px-2 text-right font-bold ${
                          isLow
                            ? 'text-[var(--color-critical)]'
                            : 'text-[var(--color-ink)]'
                        }`}
                      >
                        {item.available.toLocaleString('vi-VN')}
                      </td>

                      {/* Coverage (days) */}
                      <td className="py-3.5 px-2 text-right font-medium">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs ${
                            item.coverageDays <= 5
                              ? 'bg-[var(--color-status-critical-bg)] text-[var(--color-status-critical-fg)]'
                              : item.coverageDays <= 10
                                ? 'bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-fg)]'
                                : 'text-[var(--color-muted)]'
                          }`}
                        >
                          {item.coverageDays} ngày
                        </span>
                      </td>

                      {/* ROP */}
                      <td className="py-3.5 px-2 text-right font-mono text-xs text-[var(--color-muted)]">
                        {item.rop.toLocaleString('vi-VN')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-2 text-right">
                        {getInventoryStatusBadge(item.status)}
                      </td>

                      {/* CTA: Preselected manual request */}
                      <td className="py-3.5 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenRequestDialog(item.sku)}
                          className="inline-flex items-center gap-1 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-canvas)] hover:border-[var(--color-primary)] transition-colors"
                        >
                          <Plus size={12} />
                          Yêu cầu
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Manual Request Dialog with preselected SKU */}
      <ManualRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultSku={selectedSku}
        onSuccess={(id) => {
          navigate(`/dealer/requests/${id}`)
        }}
      />
    </PageContainer>
  )
}