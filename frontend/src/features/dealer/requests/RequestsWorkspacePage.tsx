import * as React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Package,
  Plus,
  Search,
  User,
  XCircle,
} from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { ManualRequestDialog } from '@/components/shared/ManualRequestDialog'
import { PageContainer } from '@/components/shared/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useDealerRequests } from '@/services/dealerQueries'
import type {
  FulfillmentState,
  ManualRequest,
  RequestHistoryEvent,
  RequestState,
  RequestUrgency,
} from '@/types/dealer'

function getUrgencyBadge(urgency: RequestUrgency) {
  switch (urgency) {
    case 'critical':
      return <StatusBadge variant="critical">Khẩn cấp</StatusBadge>
    case 'high':
      return <StatusBadge variant="warning">Cao</StatusBadge>
    case 'normal':
      return <StatusBadge variant="neutral">Bình thường</StatusBadge>
  }
}

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

function getRequestStateBadge(state: RequestState) {
  switch (state) {
    case 'sent':
      return <StatusBadge variant="info">Đã gửi kho vùng</StatusBadge>
    case 'acknowledged':
      return <StatusBadge variant="success">RM đã tiếp nhận</StatusBadge>
  }
}

function HistoryEventIcon({ type }: { type: RequestHistoryEvent['eventType'] }) {
  switch (type) {
    case 'sent':
      return <Clock size={14} className="text-blue-500" />
    case 'acknowledged':
      return <CheckCircle2 size={14} className="text-emerald-500" />
    case 'allocated':
      return <Package size={14} className="text-purple-500" />
    case 'rejected':
      return <XCircle size={14} className="text-red-500" />
    case 'note':
      return <FileText size={14} className="text-gray-500" />
  }
}

function RequestDetailPanel({ request }: { request: ManualRequest }) {
  const fulfillmentPct =
    request.requestedQty > 0
      ? Math.min(
          100,
          Math.round((request.allocatedQty / request.requestedQty) * 100)
        )
      : 0

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-[var(--color-border)] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <span className="font-mono text-sm font-bold text-[var(--color-ink)]">
            #{request.id}
          </span>
          <div className="flex items-center gap-2">
            {getRequestStateBadge(request.requestState)}
            {getFulfillmentBadge(request.fulfillmentState)}
          </div>
        </div>
        <h3 className="text-base font-semibold text-[var(--color-ink)]">
          {request.skuName}
        </h3>
        <p className="text-xs text-[var(--color-muted)] font-mono mt-0.5">
          Mã SKU: {request.sku}
        </p>
      </div>

      {/* Allocation Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-[var(--color-ink)]">Tiến độ cấp phát</span>
          <span className="font-semibold text-[var(--color-primary)]">
            {fulfillmentPct}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--color-canvas)] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              request.fulfillmentState === 'fulfilled'
                ? 'bg-[var(--color-success)]'
                : request.fulfillmentState === 'unable'
                  ? 'bg-[var(--color-critical)]'
                  : 'bg-[var(--color-primary)]'
            }`}
            style={{ width: `${fulfillmentPct}%` }}
          />
        </div>
      </div>

      {/* Quantities breakdown (Requested, Allocated, Remaining) */}
      <div className="grid grid-cols-3 gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] p-3 text-center">
        <div>
          <p className="text-[11px] text-[var(--color-muted)]">Yêu cầu</p>
          <p className="mt-0.5 text-base font-bold text-[var(--color-ink)]">
            {request.requestedQty.toLocaleString('vi-VN')}
          </p>
          <span className="text-[10px] text-[var(--color-muted)]">{request.unit}</span>
        </div>

        <div>
          <p className="text-[11px] text-[var(--color-muted)]">Đã cấp</p>
          <p className="mt-0.5 text-base font-bold text-[var(--color-primary)]">
            {request.allocatedQty.toLocaleString('vi-VN')}
          </p>
          <span className="text-[10px] text-[var(--color-muted)]">{request.unit}</span>
        </div>

        <div>
          <p className="text-[11px] text-[var(--color-muted)]">Còn thiếu</p>
          <p
            className={`mt-0.5 text-base font-bold ${
              request.remainingQty > 0
                ? 'text-[var(--color-critical)]'
                : 'text-[var(--color-success)]'
            }`}
          >
            {request.remainingQty.toLocaleString('vi-VN')}
          </p>
          <span className="text-[10px] text-[var(--color-muted)]">{request.unit}</span>
        </div>
      </div>

      {/* Meta Information */}
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-border)]">
          <span className="text-[var(--color-muted)]">Mức độ khẩn cấp</span>
          <div>{getUrgencyBadge(request.urgency)}</div>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-border)]">
          <span className="text-[var(--color-muted)]">Ngày cần hàng</span>
          <span className="font-semibold text-[var(--color-ink)] flex items-center gap-1">
            <Calendar size={13} className="text-[var(--color-muted)]" />
            {request.needByDate}
          </span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-border)]">
          <span className="text-[var(--color-muted)]">Đơn vị gửi</span>
          <span className="text-[var(--color-ink)] flex items-center gap-1">
            <User size={13} className="text-[var(--color-muted)]" />
            {request.dealerName}
          </span>
        </div>

        <div>
          <span className="block text-[var(--color-muted)] mb-1">Lý do yêu cầu bổ sung</span>
          <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] p-3 text-xs text-[var(--color-ink)] leading-relaxed italic">
            "{request.reason}"
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-3">
          Nhật ký xử lý (Audit Timeline)
        </h4>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-border)]">
          {request.history.map((event) => (
            <div key={event.id} className="relative text-xs">
              {/* Dot */}
              <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]">
                <HistoryEventIcon type={event.eventType} />
              </div>

              <div>
                <p className="font-semibold text-[var(--color-ink)]">{event.title}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--color-muted)]">
                  <span>{event.actor}</span>
                  <span>•</span>
                  <span>{new Date(event.timestamp).toLocaleString('vi-VN')}</span>
                </div>
                {event.note && (
                  <p className="mt-1 rounded bg-[var(--color-canvas)] p-2 text-[11px] text-[var(--color-ink)] border border-[var(--color-border)]">
                    {event.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[var(--radius-control)] bg-[var(--color-canvas)] p-3 text-[11px] text-[var(--color-muted)] leading-relaxed border border-[var(--color-border)]">
        <p className="flex items-center gap-1.5 font-medium text-[var(--color-ink)]">
          <AlertCircle size={13} />
          Quy trình xử lý yêu cầu
        </p>
        <p className="mt-0.5">
          Yêu cầu được gửi đến <strong className="text-[var(--color-ink)]">Regional Manager / Kho Vùng</strong> để phân bổ trước. Phần còn thiếu sau khi kho vùng xử lý mới được chuyển lên SCM trung tâm điều phối.
        </p>
      </div>
    </div>
  )
}

export function RequestsWorkspacePage() {
  const navigate = useNavigate()
  const { requestId } = useParams<{ requestId?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const fulfillmentFilter = searchParams.get('fulfillment') || 'all'
  const urgencyFilter = searchParams.get('urgency') || 'all'
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const { data: requests = [], isLoading } = useDealerRequests()

  const handleFulfillmentChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (val === 'all') {
      newParams.delete('fulfillment')
    } else {
      newParams.set('fulfillment', val)
    }
    setSearchParams(newParams)
  }

  const handleUrgencyChange = (val: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (val === 'all') {
      newParams.delete('urgency')
    } else {
      newParams.set('urgency', val)
    }
    setSearchParams(newParams)
  }

  // Filter requests
  const filteredRequests = React.useMemo(() => {
    return requests.filter((item) => {
      const matchFulfillment =
        fulfillmentFilter === 'all' || item.fulfillmentState === fulfillmentFilter
      const matchUrgency =
        urgencyFilter === 'all' || item.urgency === urgencyFilter
      const matchSearch =
        !searchQuery ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.skuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase())
      return matchFulfillment && matchUrgency && matchSearch
    })
  }, [requests, fulfillmentFilter, urgencyFilter, searchQuery])

  // Selected request: either matches route parameter or default to first filtered item
  const selectedRequest = React.useMemo(() => {
    if (requestId) {
      return requests.find((r) => r.id === requestId)
    }
    return filteredRequests[0] || requests[0]
  }, [requests, requestId, filteredRequests])

  const handleSelectRequest = (id: string) => {
    navigate(`/dealer/requests/${id}`)
  }

  return (
    <PageContainer>
      <PageHeader
        title="Yêu cầu bổ sung hàng hóa"
        description="Gửi và theo dõi các yêu cầu cung ứng đột xuất phát sinh ngoài kế hoạch dự báo nhu cầu định kỳ."
        actions={
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
          >
            <Plus size={16} aria-hidden="true" />
            Tạo yêu cầu mới
          </button>
        }
      />

      {/* Main Split Layout: Desktop LEFT (List) / RIGHT (Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Request Table / List */}
        <div className="lg:col-span-7 space-y-4">
          <SectionCard
            title="Danh sách yêu cầu đã gửi"
            description="Nhấp vào dòng để xem chi tiết tiến trình cấp phát và nhật ký xử lý"
          >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="relative min-w-[200px] flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                />
                <input
                  type="text"
                  placeholder="Tìm mã đơn, SKU, lý do..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 py-1.5 text-xs text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              {/* Fulfillment filter */}
              <div className="flex items-center gap-1 text-xs">
                <Filter size={14} className="text-[var(--color-muted)]" />
                <select
                  value={fulfillmentFilter}
                  onChange={(e) => handleFulfillmentChange(e.target.value)}
                  className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
                >
                  <option value="all">Tất cả tiến độ</option>
                  <option value="pending">Chờ cấp</option>
                  <option value="partial">Cấp một phần</option>
                  <option value="fulfilled">Đã cấp đủ</option>
                  <option value="unable">Không thể cấp</option>
                </select>
              </div>

              {/* Urgency filter */}
              <div className="flex items-center gap-1 text-xs">
                <select
                  value={urgencyFilter}
                  onChange={(e) => handleUrgencyChange(e.target.value)}
                  className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
                >
                  <option value="all">Tất cả độ khẩn</option>
                  <option value="critical">Khẩn cấp</option>
                  <option value="high">Cao</option>
                  <option value="normal">Bình thường</option>
                </select>
              </div>
            </div>

            {/* List / Table */}
            {isLoading ? (
              <div className="space-y-3 py-4">
                <LoadingSkeleton className="h-10 w-full" />
                <LoadingSkeleton className="h-12 w-full" />
                <LoadingSkeleton className="h-12 w-full" />
                <LoadingSkeleton className="h-12 w-full" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="Không tìm thấy yêu cầu nào"
                  description="Thử thay đổi bộ lọc hoặc tạo một yêu cầu bổ sung mới."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-muted)] font-medium">
                      <th className="py-2.5 pr-2">Mã & SKU</th>
                      <th className="py-2.5 px-2 text-right">Requested</th>
                      <th className="py-2.5 px-2 text-right">Allocated</th>
                      <th className="py-2.5 px-2 text-right">Remaining</th>
                      <th className="py-2.5 px-2 text-center">Độ khẩn</th>
                      <th className="py-2.5 pl-2 text-right">Tiến độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {filteredRequests.map((req) => {
                      const isSelected = selectedRequest?.id === req.id
                      return (
                        <tr
                          key={req.id}
                          onClick={() => handleSelectRequest(req.id)}
                          className={`group cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[var(--color-canvas)] border-l-2 border-l-[var(--color-primary)]'
                              : 'hover:bg-[var(--color-canvas)]'
                          }`}
                        >
                          <td className="py-3 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-semibold text-[var(--color-ink)]">
                                #{req.id}
                              </span>
                            </div>
                            <div className="font-medium text-xs text-[var(--color-ink)] line-clamp-1 mt-0.5">
                              {req.skuName}
                            </div>
                            <div className="text-[11px] text-[var(--color-muted)]">
                              Cần ngày: {req.needByDate}
                            </div>
                          </td>

                          <td className="py-3 px-2 text-right font-medium text-[var(--color-ink)]">
                            {req.requestedQty} {req.unit}
                          </td>

                          <td className="py-3 px-2 text-right font-medium text-[var(--color-primary)]">
                            {req.allocatedQty}
                          </td>

                          <td className="py-3 px-2 text-right font-bold text-[var(--color-critical)]">
                            {req.remainingQty}
                          </td>

                          <td className="py-3 px-2 text-center">
                            {getUrgencyBadge(req.urgency)}
                          </td>

                          <td className="py-3 pl-2 text-right">
                            {getFulfillmentBadge(req.fulfillmentState)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column (5 cols): Selected Request Detail Panel */}
        <div className="lg:col-span-5">
          <SectionCard
            title="Chi tiết yêu cầu bổ sung"
            description="Thông tin chi tiết và nhật ký xử lý từ RM / Kho Vùng (và SCM nếu được leo thang)"
            className="sticky top-20"
          >
            {selectedRequest ? (
              <RequestDetailPanel request={selectedRequest} />
            ) : (
              <div className="py-12 text-center">
                <EmptyState
                  title="Chưa chọn yêu cầu nào"
                  description="Nhấp vào một yêu cầu ở bảng bên trái để xem chi tiết."
                />
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Manual Request Dialog */}
      <ManualRequestDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={(id) => {
          navigate(`/dealer/requests/${id}`)
        }}
      />
    </PageContainer>
  )
}