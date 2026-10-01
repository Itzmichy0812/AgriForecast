import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { PageContainer } from '@/components/shared/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  useRegionalRequirements,
  useOverrideRequirement,
} from '../scmQueries'
import { REGION_LABELS } from '@/types/scm'
import type { RegionalRequirement, PriorityLevel } from '@/types/scm'

function priorityLabel(p: PriorityLevel) {
  return p === 'critical' ? 'Khẩn cấp' : p === 'high' ? 'Cao' : 'Bình thường'
}
function priorityVariant(p: PriorityLevel) {
  return p === 'critical' ? 'critical' as const : p === 'high' ? 'warning' as const : 'neutral' as const
}

// ─── Override Dialog ─────────────────────────────────────────────────────────

interface OverrideDialogProps {
  req: RegionalRequirement
  onClose: () => void
  onSave: (qty: number, reason: string) => void
  isPending: boolean
}

function OverrideDialog({ req, onClose, onSave, isPending }: OverrideDialogProps) {
  const [qty, setQty] = React.useState<string>(
    (req.scmOverride ?? req.rmRequested).toString(),
  )
  const [reason, setReason] = React.useState(req.scmOverrideReason ?? '')
  const [error, setError] = React.useState<string | null>(null)

  const effectiveQty = req.scmOverride ?? req.rmRequested

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(qty)
    if (!qty || Number.isNaN(n) || n < 0) {
      setError('Số lượng không hợp lệ')
      return
    }
    const trimmedReason = reason.trim()
    if (n !== req.rmRequested && !trimmedReason) {
      setError('Bắt buộc nhập lý do khi SCM điều chỉnh khác số lượng RM yêu cầu')
      return
    }
    setError(null)
    onSave(n, trimmedReason)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">SCM điều chỉnh số lượng</h2>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">{req.skuName} · {REGION_LABELS[req.region]}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-[var(--color-canvas)] text-[var(--color-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Reference info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-[var(--radius-control)] bg-[var(--color-canvas)] p-3">
              <p className="text-[var(--color-muted)]">RM Yêu cầu (bất biến)</p>
              <p className="mt-0.5 font-semibold text-[var(--color-ink)]">{req.rmRequested.toLocaleString('vi-VN')} {req.unit}</p>
            </div>
            <div className="rounded-[var(--radius-control)] bg-[var(--color-canvas)] p-3">
              <p className="text-[var(--color-muted)]">SCM hiện tại</p>
              <p className="mt-0.5 font-semibold text-[var(--color-ink)]">{effectiveQty.toLocaleString('vi-VN')} {req.unit}</p>
            </div>
          </div>

          <div>
            <label htmlFor="override-qty" className="block text-xs font-medium text-[var(--color-ink)] mb-1">
              Số lượng SCM điều chỉnh ({req.unit}) <span className="text-[var(--color-critical)]">*</span>
            </label>
            <input
              id="override-qty"
              type="number"
              min={0}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
              className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="override-reason" className="block text-xs font-medium text-[var(--color-ink)] mb-1">
              Lý do điều chỉnh {Number(qty) !== req.rmRequested ? (
                <span className="text-[var(--color-critical)] font-semibold">* (Bắt buộc)</span>
              ) : (
                <span className="text-[var(--color-muted)]">(tùy chọn)</span>
              )}
            </label>
            <textarea
              id="override-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={Number(qty) !== req.rmRequested ? 'Bắt buộc ghi rõ lý do khi điều chỉnh khác số lượng RM đề xuất...' : 'Ghi chú thêm nếu cần (tùy chọn)...'}
              className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-xs text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-[var(--color-critical)]">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-canvas)] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Đang lưu...' : 'Lưu điều chỉnh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Dealer Traceability Drawer ──────────────────────────────────────────────

function TraceabilityDrawer({
  req,
  onClose,
}: {
  req: RegionalRequirement
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-[var(--color-surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Truy xuất nguồn gốc</h2>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">{req.skuName} · {REGION_LABELS[req.region]}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-[var(--color-canvas)] text-[var(--color-muted)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 px-5 py-4 space-y-4">
          {[
            { label: 'Nhu cầu hiệu lực đại lý', value: `${req.dealerEffectiveDemand.toLocaleString('vi-VN')} ${req.unit}`, sub: 'Tổng Final Planning các đại lý trong vùng' },
            { label: 'Yêu cầu thủ công đại lý', value: `${req.dealerManualRequests.toLocaleString('vi-VN')} ${req.unit}`, sub: 'Manual Request đang tồn đọng' },
            { label: 'RM Yêu cầu lên SCM', value: `${req.rmRequested.toLocaleString('vi-VN')} ${req.unit}`, sub: 'Sau kiểm tra tồn kho vùng — bất biến' },
            { label: 'Tồn kho vùng khả dụng', value: `${req.regionalAvailable.toLocaleString('vi-VN')} ${req.unit}`, sub: 'Tại thời điểm RM gửi' },
            { label: 'Thiếu hụt gửi lên SCM', value: `${req.remainingNeed.toLocaleString('vi-VN')} ${req.unit}`, sub: '= RM Yêu cầu − Tồn vùng', highlight: true },
            { label: 'SCM điều chỉnh', value: req.scmOverride !== null ? `${req.scmOverride.toLocaleString('vi-VN')} ${req.unit}` : '— (giữ theo RM)', sub: req.scmOverrideReason ?? 'Chưa có điều chỉnh' },
            { label: 'Điều chuyển liên vùng', value: `${req.rebalancingAllocated.toLocaleString('vi-VN')} ${req.unit}`, sub: 'Cấp từ điều chuyển cross-region' },
            { label: 'Phân bổ Kho Trung tâm', value: `${req.centralAllocated.toLocaleString('vi-VN')} ${req.unit}`, sub: 'Cấp từ kho trung tâm' },
            { label: 'Đã đặt mua ngoài (PO)', value: `${req.procurementOrdered.toLocaleString('vi-VN')} ${req.unit}`, sub: 'Từ PO đã duyệt' },
            { label: 'Còn chưa giải quyết', value: `${req.stillUnmet.toLocaleString('vi-VN')} ${req.unit}`, sub: 'Sau tất cả các bước SCM', highlight: req.stillUnmet > 0 },
          ].map(({ label, value, sub, highlight }) => (
            <div
              key={label}
              className={`rounded-[var(--radius-control)] p-3 ${highlight ? 'bg-[var(--color-status-critical-bg)] border border-[var(--color-status-critical-border)]' : 'bg-[var(--color-canvas)]'}`}
            >
              <p className="text-xs text-[var(--color-muted)]">{label}</p>
              <p className={`mt-0.5 text-sm font-semibold ${highlight && req.stillUnmet > 0 ? 'text-[var(--color-critical)]' : 'text-[var(--color-ink)]'}`}>{value}</p>
              <p className="text-xs text-[var(--color-muted)]">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const REGIONS = Object.entries(REGION_LABELS)

export function RegionalDemandPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('selected')
  const regionFilter = searchParams.get('region') ?? 'all'
  const skuFilter = searchParams.get('sku') ?? ''
  const shortageOnly = searchParams.get('shortage') === '1'

  const [overrideTarget, setOverrideTarget] = React.useState<RegionalRequirement | null>(null)
  const [traceTarget, setTraceTarget] = React.useState<RegionalRequirement | null>(null)
  const [sortField, setSortField] = React.useState<keyof RegionalRequirement>('priority')
  const [sortAsc, setSortAsc] = React.useState(false)

  const { data: requirements = [], isLoading } = useRegionalRequirements({
    region: regionFilter === 'all' ? undefined : regionFilter,
    sku: skuFilter || undefined,
    hasShortage: shortageOnly || undefined,
  })

  const overrideMutation = useOverrideRequirement()

  function handleSort(field: keyof RegionalRequirement) {
    if (sortField === field) setSortAsc((v) => !v)
    else { setSortField(field); setSortAsc(true) }
  }

  const sorted = React.useMemo(() => {
    return [...requirements].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2 }
      if (sortField === 'priority') {
        const diff = priorityOrder[a.priority] - priorityOrder[b.priority]
        return sortAsc ? diff : -diff
      }
      const va = a[sortField] as string | number
      const vb = b[sortField] as string | number
      if (typeof va === 'number' && typeof vb === 'number') return sortAsc ? va - vb : vb - va
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })
  }, [requirements, sortField, sortAsc])

  function SortIcon({ field }: { field: keyof RegionalRequirement }) {
    if (sortField !== field) return null
    return sortAsc ? <ChevronUp size={12} aria-hidden /> : <ChevronDown size={12} aria-hidden />
  }

  function handleSave(qty: number, reason: string) {
    if (!overrideTarget) return
    overrideMutation.mutate(
      { id: overrideTarget.id, scmOverride: qty, reason },
      { onSuccess: () => setOverrideTarget(null) },
    )
  }

  const totalShortage = requirements.reduce((s, r) => s + r.remainingNeed, 0)
  const criticalCount = requirements.filter((r) => r.priority === 'critical').length
  const withOverride = requirements.filter((r) => r.scmOverride !== null).length

  return (
    <PageContainer>
      <PageHeader
        title="Nhu cầu vùng"
        description="Yêu cầu từ Regional Manager · Tháng 10/2026"
      />

      {/* Summary strip */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng thiếu hụt từ vùng', value: totalShortage.toLocaleString('vi-VN') + ' đv', variant: 'critical' as const },
          { label: 'SKU ưu tiên khẩn', value: criticalCount.toString(), variant: 'warning' as const },
          { label: 'SCM đã điều chỉnh', value: withOverride.toString(), variant: 'info' as const },
        ].map(({ label, value, variant }) => (
          <div
            key={label}
            className={`rounded-[var(--radius-card)] border p-4 ${
              variant === 'critical' ? 'border-[var(--color-status-critical-border)] bg-[var(--color-status-critical-bg)]' :
              variant === 'warning' ? 'border-[var(--color-status-warning-border)] bg-[var(--color-status-warning-bg)]' :
              'border-[var(--color-status-info-border)] bg-[var(--color-status-info-bg)]'
            }`}
          >
            <p className={`text-xs font-medium ${variant === 'critical' ? 'text-[var(--color-status-critical-fg)]' : variant === 'warning' ? 'text-[var(--color-status-warning-fg)]' : 'text-[var(--color-status-info-fg)]'}`}>{label}</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-ink)]">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <SectionCard
        title="Bộ lọc"
        className="mb-4"
        actions={
          (regionFilter !== 'all' || skuFilter || shortageOnly) ? (
            <button
              type="button"
              onClick={() => setSearchParams(new URLSearchParams())}
              className="flex items-center gap-1 rounded-[var(--radius-control)] border border-[var(--color-border)] px-2.5 py-1.5 text-xs text-[var(--color-muted)] hover:bg-[var(--color-canvas)] transition-colors"
            >
              <X size={12} />Xóa lọc
            </button>
          ) : undefined
        }
      >
        <div className="flex flex-wrap gap-3">
          <select
            id="region-filter"
            value={regionFilter}
            onChange={(e) => {
              const np = new URLSearchParams(searchParams)
              if (e.target.value === 'all') np.delete('region')
              else np.set('region', e.target.value)
              setSearchParams(np)
            }}
            className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-1.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value="all">Tất cả vùng</option>
            {REGIONS.map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>

          <input
            type="search"
            placeholder="Tìm SKU..."
            value={skuFilter}
            onChange={(e) => {
              const np = new URLSearchParams(searchParams)
              if (e.target.value) np.set('sku', e.target.value)
              else np.delete('sku')
              setSearchParams(np)
            }}
            className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-1.5 text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)] w-48"
          />

          <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--color-ink)]">
            <input
              type="checkbox"
              checked={shortageOnly}
              onChange={(e) => {
                const np = new URLSearchParams(searchParams)
                if (e.target.checked) np.set('shortage', '1')
                else np.delete('shortage')
                setSearchParams(np)
              }}
              className="rounded"
            />
            Chỉ hiện SKU còn thiếu
          </label>
        </div>
      </SectionCard>

      {/* Requirements Table */}
      <SectionCard title={`Yêu cầu vùng (${sorted.length})`} description="Nhấn &gt; để xem chi tiết · Nhấn Điều chỉnh để thay đổi số lượng" noPadding>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-[var(--color-muted)] text-sm">Đang tải...</div>
        ) : sorted.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-[var(--color-muted)] text-sm">Không có dữ liệu phù hợp bộ lọc.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-canvas)]">
                  {[
                    { label: 'Vùng', field: 'region' },
                    { label: 'SKU', field: 'sku' },
                    { label: 'Nhu cầu ĐL', field: 'dealerEffectiveDemand' },
                    { label: 'RM Yêu cầu', field: 'rmRequested' },
                    { label: 'SCM điều chỉnh', field: 'scmOverride' },
                    { label: 'Tồn vùng', field: 'regionalAvailable' },
                    { label: 'Còn thiếu', field: 'remainingNeed' },
                    { label: 'Cần trước', field: 'needByDate' },
                    { label: 'Ưu tiên', field: 'priority' },
                    { label: 'Hành động', field: null },
                  ].map(({ label, field }) => (
                    <th
                      key={label}
                      onClick={field ? () => handleSort(field as keyof RegionalRequirement) : undefined}
                      className={`px-3 py-3 text-left font-medium text-[var(--color-muted)] whitespace-nowrap ${field ? 'cursor-pointer hover:text-[var(--color-ink)] select-none' : ''}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {label}
                        {field && <SortIcon field={field as keyof RegionalRequirement} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {sorted.map((req) => {
                  const isSelected = selectedId === req.id
                  return (
                    <tr
                      key={req.id}
                      className={`hover:bg-[var(--color-canvas)] cursor-pointer ${isSelected ? 'bg-[var(--color-canvas)]' : ''}`}
                      onClick={() => {
                        const np = new URLSearchParams(searchParams)
                        if (isSelected) np.delete('selected')
                        else np.set('selected', req.id)
                        setSearchParams(np)
                      }}
                    >
                      <td className="px-3 py-3 text-[var(--color-muted)]">
                        <span className="line-clamp-1">{REGION_LABELS[req.region].split(' ').slice(-2).join(' ')}</span>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-[var(--color-ink)]">{req.skuName}</p>
                        <p className="text-[var(--color-muted)]">{req.sku}</p>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{req.dealerEffectiveDemand.toLocaleString('vi-VN')} <span className="text-[var(--color-muted)]">{req.unit}</span></td>
                      <td className="px-3 py-3 text-right tabular-nums font-medium text-[var(--color-ink)]">{req.rmRequested.toLocaleString('vi-VN')}</td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        {req.scmOverride !== null ? (
                          <span className="font-medium text-[var(--color-status-info-fg)]">{req.scmOverride.toLocaleString('vi-VN')}</span>
                        ) : (
                          <span className="text-[var(--color-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-[var(--color-muted)]">{req.regionalAvailable.toLocaleString('vi-VN')}</td>
                      <td className={`px-3 py-3 text-right tabular-nums font-semibold ${req.remainingNeed > 0 ? 'text-[var(--color-critical)]' : 'text-[var(--color-status-success-fg)]'}`}>
                        {req.remainingNeed.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-3 py-3 text-[var(--color-muted)]">{req.needByDate}</td>
                      <td className="px-3 py-3">
                        <StatusBadge variant={priorityVariant(req.priority)} dot>{priorityLabel(req.priority)}</StatusBadge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setOverrideTarget(req)}
                            className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-2 py-1 text-[10px] font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
                          >
                            Điều chỉnh
                          </button>
                          <button
                            type="button"
                            onClick={() => setTraceTarget(req)}
                            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[10px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-canvas)] transition-colors"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Override Dialog */}
      {overrideTarget && (
        <OverrideDialog
          req={overrideTarget}
          onClose={() => setOverrideTarget(null)}
          onSave={handleSave}
          isPending={overrideMutation.isPending}
        />
      )}

      {/* Traceability Drawer */}
      {traceTarget && (
        <TraceabilityDrawer req={traceTarget} onClose={() => setTraceTarget(null)} />
      )}
    </PageContainer>
  )
}
