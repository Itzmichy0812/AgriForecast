import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronRight,
  X,
} from 'lucide-react'
import { PageContainer } from '@/components/shared/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  usePurchaseRecommendations,
  useSuppliers,
  useAcceptRecommendation,
  useDismissRecommendation,
  usePurchaseOrders,
  useCreatePurchaseOrder,
  useApprovePurchaseOrder,
} from '../scmQueries'
import { REGION_LABELS } from '@/types/scm'
import type {
  PurchaseRecommendation,
  PurchaseRecommendationStatus,
  Supplier,
  PurchaseOrder,
  POLine,
} from '@/types/scm'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function recStatusVariant(s: PurchaseRecommendationStatus) {
  switch (s) {
    case 'pending':    return 'warning' as const
    case 'accepted':   return 'info' as const
    case 'po_created': return 'success' as const
    case 'dismissed':  return 'neutral' as const
  }
}
function recStatusLabel(s: PurchaseRecommendationStatus) {
  switch (s) {
    case 'pending':    return 'Chờ duyệt'
    case 'accepted':   return 'Đã chấp nhận'
    case 'po_created': return 'Đã tạo PO'
    case 'dismissed':  return 'Bỏ qua'
  }
}
function poStatusVariant(s: PurchaseOrder['status']) {
  return s === 'approved' ? 'success' as const : s === 'rejected' ? 'critical' as const : 'neutral' as const
}
function poStatusLabel(s: PurchaseOrder['status']) {
  return s === 'approved' ? 'Đã duyệt' : s === 'rejected' ? 'Từ chối' : 'Nháp'
}
function formatVND(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} tỷ`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} triệu`
  return n.toLocaleString('vi-VN')
}
function qualityColor(tier: 'A' | 'B' | 'C') {
  return tier === 'A' ? 'text-[var(--color-status-success-fg)]' : tier === 'B' ? 'text-[var(--color-status-warning-fg)]' : 'text-[var(--color-status-critical-fg)]'
}

// ─── Accept Recommendation Dialog ────────────────────────────────────────────

interface AcceptDialogProps {
  rec: PurchaseRecommendation
  suppliers: Supplier[]
  onClose: () => void
  onSave: (qty: number, reason: string | undefined, supplierId: string) => void
  isPending: boolean
}

function AcceptDialog({ rec, suppliers, onClose, onSave, isPending }: AcceptDialogProps) {
  const [qty, setQty] = React.useState(rec.scmQty?.toString() ?? rec.recommendedQty.toString())
  const [reason, setReason] = React.useState(rec.scmQtyReason ?? '')
  const [supplierId, setSupplierId] = React.useState(rec.selectedSupplierId ?? '')
  const [error, setError] = React.useState<string | null>(null)

  const filteredSuppliers = suppliers.filter((s) =>
    s.categories.some((c) => rec.productGroup.includes(c.split(' ')[0]) || c.includes(rec.productGroup.split(' ')[0]))
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(qty)
    if (!qty || Number.isNaN(n) || n <= 0) { setError('Số lượng không hợp lệ'); return }
    if (n < rec.moq) { setError(`Số lượng phải ≥ MOQ = ${rec.moq} ${rec.unit}`); return }
    if (!supplierId) { setError('Vui lòng chọn nhà cung cấp'); return }
    if (n !== rec.recommendedQty && !reason.trim()) { setError('Vui lòng nhập lý do khi thay đổi số lượng'); return }
    setError(null)
    onSave(n, reason || undefined, supplierId)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Chấp nhận đề xuất mua hàng</h2>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">{rec.skuName} · {REGION_LABELS[rec.region]}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-[var(--color-canvas)] text-[var(--color-muted)]"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { label: 'Còn thiếu', value: `${rec.remainingShortage.toLocaleString('vi-VN')} ${rec.unit}` },
              { label: 'Đề xuất hệ thống', value: `${rec.recommendedQty.toLocaleString('vi-VN')} ${rec.unit}` },
              { label: 'MOQ', value: `${rec.moq.toLocaleString('vi-VN')} ${rec.unit}` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-[var(--radius-control)] bg-[var(--color-canvas)] p-2 text-center">
                <p className="text-[var(--color-muted)]">{label}</p>
                <p className="mt-0.5 font-semibold text-[var(--color-ink)]">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="accept-qty" className="block text-xs font-medium text-[var(--color-ink)] mb-1">
              Số lượng đặt hàng ({rec.unit}) <span className="text-[var(--color-critical)]">*</span>
            </label>
            <input
              id="accept-qty"
              type="number"
              min={rec.moq}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
              className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-ink)] mb-2">
              Chọn nhà cung cấp <span className="text-[var(--color-critical)]">*</span>
            </label>
            <div className="space-y-2">
              {(filteredSuppliers.length > 0 ? filteredSuppliers : suppliers).map((s) => (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border p-3 transition-colors ${supplierId === s.id ? 'border-[var(--color-primary)] bg-[var(--color-canvas)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}`}
                >
                  <input
                    type="radio"
                    name="supplier"
                    value={s.id}
                    checked={supplierId === s.id}
                    onChange={() => setSupplierId(s.id)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-[var(--color-ink)] truncate">{s.name}</p>
                      <span className={`text-xs font-bold ${qualityColor(s.qualityTier)}`}>Tier {s.qualityTier}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-[var(--color-muted)]">
                      <span>Giá: <strong className="text-[var(--color-ink)]">{formatVND(s.unitPrice)}/{rec.unit}</strong></span>
                      <span>MOQ: {s.moq.toLocaleString('vi-VN')}</span>
                      <span>Lead time: {s.leadTimeDays} ngày</span>
                      <span>Đúng hạn: {Math.round(s.onTimeDeliveryRate * 100)}%</span>
                    </div>
                    {s.qualityAlerts && (
                      <p className="mt-1 text-[10px] text-[var(--color-status-warning-fg)]">⚠ {s.qualityAlerts}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="accept-reason" className="block text-xs font-medium text-[var(--color-ink)] mb-1">
              Lý do {Number(qty) !== rec.recommendedQty ? <span className="text-[var(--color-critical)]">*</span> : <span className="text-[var(--color-muted)]">(tùy chọn)</span>}
            </label>
            <textarea
              id="accept-reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ghi chú về quyết định..."
              className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-xs focus:border-[var(--color-primary)] focus:outline-none resize-none"
            />
          </div>

          {error && <p className="text-xs text-[var(--color-critical)]">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-canvas)] transition-colors">Hủy</button>
            <button type="submit" disabled={isPending} className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors">
              {isPending ? 'Đang xử lý...' : 'Chấp nhận & Chọn NCC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Create PO Dialog ─────────────────────────────────────────────────────────

interface CreatePODialogProps {
  rec: PurchaseRecommendation
  supplier: Supplier
  onClose: () => void
  onSave: (lines: Omit<POLine, 'id'>[], notes: string) => void
  isPending: boolean
}

function CreatePODialog({ rec, supplier, onClose, onSave, isPending }: CreatePODialogProps) {
  const finalQty = rec.scmQty ?? rec.recommendedQty
  const unitPrice = supplier.unitPrice
  const total = finalQty * unitPrice
  const today = new Date('2026-10-01')
  const deliveryDate = new Date(today)
  deliveryDate.setDate(today.getDate() + supplier.leadTimeDays)
  const [notes, setNotes] = React.useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const line: Omit<POLine, 'id'> = {
      sku: rec.sku,
      skuName: rec.skuName,
      unit: rec.unit,
      quantity: finalQty,
      unitPrice,
      totalPrice: total,
      deliveryDate: deliveryDate.toISOString().slice(0, 10),
    }
    onSave([line], notes)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Tạo đơn mua hàng (PO Draft)</h2>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">{supplier.name}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-[var(--color-canvas)] text-[var(--color-muted)]"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* PO line preview */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-canvas)]">
                {['SKU', 'Số lượng', 'Đơn giá', 'Thành tiền', 'Ngày giao'].map((h) => (
                  <th key={h} className="px-2 py-2 text-left font-medium text-[var(--color-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-2 font-medium text-[var(--color-ink)]">{rec.skuName}</td>
                <td className="px-2 py-2 tabular-nums">{finalQty.toLocaleString('vi-VN')} {rec.unit}</td>
                <td className="px-2 py-2 tabular-nums">{formatVND(unitPrice)}</td>
                <td className="px-2 py-2 tabular-nums font-semibold text-[var(--color-ink)]">{formatVND(total)}</td>
                <td className="px-2 py-2">{deliveryDate.toISOString().slice(0, 10)}</td>
              </tr>
            </tbody>
          </table>

          <div className="rounded-[var(--radius-control)] bg-[var(--color-canvas)] p-3 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">Điều khoản thanh toán</span>
              <span className="font-medium text-[var(--color-ink)]">{supplier.paymentTerms}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-[var(--color-muted)]">Tổng đơn hàng</span>
              <span className="font-bold text-[var(--color-ink)]">{formatVND(total)}</span>
            </div>
          </div>

          <div>
            <label htmlFor="po-notes" className="block text-xs font-medium text-[var(--color-ink)] mb-1">Ghi chú PO</label>
            <textarea
              id="po-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú giao hàng, điều kiện đặc biệt..."
              className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-xs focus:border-[var(--color-primary)] focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-canvas)] transition-colors">Hủy</button>
            <button type="submit" disabled={isPending} className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors">
              {isPending ? 'Đang tạo...' : 'Tạo PO Nháp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── PO Detail ────────────────────────────────────────────────────────────────

function PODetail({ po, onApprove, onClose, isApproving }: {
  po: PurchaseOrder
  onApprove: () => void
  onClose: () => void
  isApproving: boolean
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
        <div>
          <p className="text-xs text-[var(--color-muted)]">Đơn mua hàng</p>
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">{po.poNumber}</h3>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge variant={poStatusVariant(po.status)} dot>{poStatusLabel(po.status)}</StatusBadge>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-[var(--color-canvas)] text-[var(--color-muted)]"><X size={14} /></button>
        </div>
      </div>
      <div className="px-5 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><p className="text-[var(--color-muted)]">Nhà cung cấp</p><p className="mt-0.5 font-medium text-[var(--color-ink)]">{po.supplierName}</p></div>
          <div><p className="text-[var(--color-muted)]">Tạo bởi</p><p className="mt-0.5 text-[var(--color-ink)]">{po.createdBy}</p></div>
          <div><p className="text-[var(--color-muted)]">Ngày tạo</p><p className="mt-0.5 text-[var(--color-ink)]">{new Date(po.createdAt).toLocaleDateString('vi-VN')}</p></div>
          {po.approvedBy && <div><p className="text-[var(--color-muted)]">Duyệt bởi</p><p className="mt-0.5 text-[var(--color-ink)]">{po.approvedBy}</p></div>}
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-canvas)]">
              {['SKU', 'Số lượng', 'Đơn giá', 'Thành tiền', 'Ngày giao'].map((h) => (
                <th key={h} className="px-2 py-2 text-left font-medium text-[var(--color-muted)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {po.lines.map((line) => (
              <tr key={line.id} className="border-b border-[var(--color-border)]">
                <td className="px-2 py-2 font-medium text-[var(--color-ink)]">{line.skuName}</td>
                <td className="px-2 py-2 tabular-nums">{line.quantity.toLocaleString('vi-VN')} {line.unit}</td>
                <td className="px-2 py-2 tabular-nums">{formatVND(line.unitPrice)}</td>
                <td className="px-2 py-2 tabular-nums font-semibold">{formatVND(line.totalPrice)}</td>
                <td className="px-2 py-2">{line.deliveryDate}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="px-2 py-2 text-right text-xs font-medium text-[var(--color-muted)]">Tổng cộng</td>
              <td className="px-2 py-2 text-xs font-bold text-[var(--color-ink)]">{formatVND(po.grandTotal)}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        {po.notes && (
          <p className="text-xs text-[var(--color-muted)] rounded-[var(--radius-control)] bg-[var(--color-canvas)] p-2">{po.notes}</p>
        )}

        {po.status === 'draft' && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onApprove}
              disabled={isApproving}
              className="w-full rounded-[var(--radius-control)] bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors"
            >
              {isApproving ? 'Đang duyệt...' : '✓ Phê duyệt PO'}
            </button>
          </div>
        )}

        {po.status === 'approved' && (
          <div className="flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-status-success-bg)] p-3">
            <CheckCircle2 size={16} className="text-[var(--color-status-success-fg)] shrink-0" />
            <p className="text-xs text-[var(--color-status-success-fg)]">PO đã được phê duyệt bởi {po.approvedBy} lúc {po.approvedAt ? new Date(po.approvedAt).toLocaleString('vi-VN') : '—'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const STATUS_TABS: (PurchaseRecommendationStatus | 'all')[] = ['all', 'pending', 'accepted', 'po_created', 'dismissed']

export function ProcurementPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedRecId = searchParams.get('selected')
  const tab = (searchParams.get('tab') ?? 'recommendations') as 'recommendations' | 'pos'
  const statusFilter = (searchParams.get('status') ?? 'all') as PurchaseRecommendationStatus | 'all'

  const [acceptTarget, setAcceptTarget] = React.useState<PurchaseRecommendation | null>(null)
  const [createPOTarget, setCreatePOTarget] = React.useState<{ rec: PurchaseRecommendation; supplier: Supplier } | null>(null)
  const [selectedPOId, setSelectedPOId] = React.useState<string | null>(null)

  const { data: recommendations = [] } = usePurchaseRecommendations({ status: statusFilter === 'all' ? undefined : statusFilter })
  const { data: allSuppliers = [] } = useSuppliers()
  const { data: pos = [] } = usePurchaseOrders()

  const acceptMutation = useAcceptRecommendation()
  const dismissMutation = useDismissRecommendation()
  const createPOMutation = useCreatePurchaseOrder()
  const approvePOMutation = useApprovePurchaseOrder()

  const selectedPO = selectedPOId ? pos.find((p) => p.id === selectedPOId) ?? null : null

  const pendingCount = recommendations.filter((r) => r.status === 'pending').length
  const draftPOCount = pos.filter((p) => p.status === 'draft').length

  function handleAcceptSave(qty: number, reason: string | undefined, supplierId: string) {
    if (!acceptTarget) return
    acceptMutation.mutate(
      { id: acceptTarget.id, scmQty: qty, reason, selectedSupplierId: supplierId },
      {
        onSuccess: (updated) => {
          setAcceptTarget(null)
          // Auto-open create PO dialog
          const supplier = allSuppliers.find((s) => s.id === supplierId)
          if (supplier) setCreatePOTarget({ rec: updated, supplier })
        },
      },
    )
  }

  function handleCreatePO(lines: Omit<POLine, 'id'>[], notes: string) {
    if (!createPOTarget) return
    createPOMutation.mutate(
      {
        recommendationId: createPOTarget.rec.id,
        supplierId: createPOTarget.supplier.id,
        supplierName: createPOTarget.supplier.name,
        lines,
        notes,
        createdBy: 'SCM Điều phối (Nguyễn Thị Lan)',
        period: createPOTarget.rec.period,
      },
      {
        onSuccess: (po) => {
          setCreatePOTarget(null)
          setSelectedPOId(po.id)
          const np = new URLSearchParams(searchParams)
          np.set('tab', 'pos')
          setSearchParams(np)
        },
      },
    )
  }

  return (
    <PageContainer className="max-w-[1400px]">
      <PageHeader
        title="Mua hàng"
        description="Đề xuất mua hàng · So sánh nhà cung cấp · Đơn mua hàng (PO)"
      />

      {/* Tab strip */}
      <div className="mb-6 flex gap-1 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] p-1 w-fit">
        {[
          { key: 'recommendations', label: `Đề xuất mua hàng${pendingCount > 0 ? ` (${pendingCount} chờ)` : ''}` },
          { key: 'pos', label: `Đơn mua hàng (PO)${draftPOCount > 0 ? ` (${draftPOCount} nháp)` : ''}` },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              const np = new URLSearchParams(searchParams)
              np.set('tab', key)
              setSearchParams(np)
            }}
            className={`rounded-[var(--radius-sm)] px-4 py-2 text-xs font-medium transition-colors ${
              tab === key
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'recommendations' && (
        <>
          {/* Status filter */}
          <div className="mb-4 flex gap-2">
            {STATUS_TABS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  const np = new URLSearchParams(searchParams)
                  if (s === 'all') np.delete('status')
                  else np.set('status', s)
                  np.delete('selected')
                  setSearchParams(np)
                }}
                className={`whitespace-nowrap rounded-[var(--radius-control)] border px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-primary)]'
                }`}
              >
                {s === 'all' ? 'Tất cả' : recStatusLabel(s as PurchaseRecommendationStatus)}
              </button>
            ))}
          </div>

          <SectionCard title={`Đề xuất mua hàng (${recommendations.length})`} noPadding>
            {recommendations.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-[var(--color-muted)] text-sm">Không có đề xuất.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-canvas)]">
                      {['SKU', 'Vùng', 'Còn thiếu', 'Đề xuất', 'MOQ', 'Lead time', 'Chi phí ước', 'Cần trước', 'Trạng thái', 'Hành động'].map((h) => (
                        <th key={h} className="px-3 py-3 text-left font-medium text-[var(--color-muted)] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {recommendations.map((rec) => (
                      <tr
                        key={rec.id}
                        className={`hover:bg-[var(--color-canvas)] cursor-pointer ${selectedRecId === rec.id ? 'bg-[var(--color-canvas)]' : ''}`}
                        onClick={() => {
                          const np = new URLSearchParams(searchParams)
                          if (selectedRecId === rec.id) np.delete('selected')
                          else np.set('selected', rec.id)
                          setSearchParams(np)
                        }}
                      >
                        <td className="px-3 py-3">
                          <p className="font-medium text-[var(--color-ink)]">{rec.skuName}</p>
                          <p className="text-[var(--color-muted)]">{rec.sku}</p>
                        </td>
                        <td className="px-3 py-3 text-[var(--color-muted)]">{REGION_LABELS[rec.region].split(' ').slice(-2).join(' ')}</td>
                        <td className="px-3 py-3 text-right tabular-nums font-semibold text-[var(--color-critical)]">{rec.remainingShortage.toLocaleString('vi-VN')} {rec.unit}</td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {rec.scmQty !== null ? (
                            <span className="font-medium text-[var(--color-status-info-fg)]">{rec.scmQty.toLocaleString('vi-VN')}</span>
                          ) : (
                            <span>{rec.recommendedQty.toLocaleString('vi-VN')}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-[var(--color-muted)]">{rec.moq.toLocaleString('vi-VN')}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-[var(--color-muted)]">{rec.leadTimeDays} ngày</td>
                        <td className="px-3 py-3 text-right tabular-nums">{formatVND(rec.estimatedTotalCost)}</td>
                        <td className="px-3 py-3 text-[var(--color-muted)]">{rec.needByDate}</td>
                        <td className="px-3 py-3">
                          <StatusBadge variant={recStatusVariant(rec.status)} dot>{recStatusLabel(rec.status)}</StatusBadge>
                        </td>
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1">
                            {rec.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setAcceptTarget(rec)}
                                  className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-2 py-1 text-[10px] font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
                                >
                                  Chấp nhận
                                </button>
                                <button
                                  type="button"
                                  onClick={() => dismissMutation.mutate(rec.id)}
                                  className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[10px] font-medium text-[var(--color-muted)] hover:bg-[var(--color-canvas)] transition-colors"
                                >
                                  Bỏ qua
                                </button>
                              </>
                            )}
                            {rec.status === 'accepted' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const supplier = allSuppliers.find((s) => s.id === rec.selectedSupplierId)
                                  if (supplier) setCreatePOTarget({ rec, supplier })
                                }}
                                className="rounded-[var(--radius-sm)] bg-[var(--color-status-info-fg)] px-2 py-1 text-[10px] font-medium text-white hover:opacity-90 transition-colors"
                              >
                                Tạo PO
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </>
      )}

      {tab === 'pos' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* PO List */}
          <SectionCard title={`Đơn mua hàng (${pos.length})`} noPadding>
            {pos.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-[var(--color-muted)] text-sm">Chưa có PO nào.</div>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {pos.map((po) => (
                  <li key={po.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedPOId(selectedPOId === po.id ? null : po.id)}
                      className={`flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-[var(--color-canvas)] transition-colors ${selectedPOId === po.id ? 'bg-[var(--color-canvas)]' : ''}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-[var(--color-ink)]">{po.poNumber}</p>
                          <StatusBadge variant={poStatusVariant(po.status)} dot>{poStatusLabel(po.status)}</StatusBadge>
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--color-muted)]">{po.supplierName}</p>
                        <p className="mt-0.5 text-xs font-medium text-[var(--color-ink)]">{formatVND(po.grandTotal)}</p>
                      </div>
                      <ChevronRight size={14} className="mt-1 shrink-0 text-[var(--color-muted)]" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* PO Detail */}
          {selectedPO && (
            <PODetail
              po={selectedPO}
              onApprove={() => approvePOMutation.mutate({ id: selectedPO.id, approvedBy: 'SCM Trưởng (Lê Văn Minh)' })}
              onClose={() => setSelectedPOId(null)}
              isApproving={approvePOMutation.isPending}
            />
          )}
        </div>
      )}

      {acceptTarget && (
        <AcceptDialog
          rec={acceptTarget}
          suppliers={allSuppliers}
          onClose={() => setAcceptTarget(null)}
          onSave={handleAcceptSave}
          isPending={acceptMutation.isPending}
        />
      )}

      {createPOTarget && (
        <CreatePODialog
          rec={createPOTarget.rec}
          supplier={createPOTarget.supplier}
          onClose={() => setCreatePOTarget(null)}
          onSave={handleCreatePO}
          isPending={createPOMutation.isPending}
        />
      )}
    </PageContainer>
  )
}
