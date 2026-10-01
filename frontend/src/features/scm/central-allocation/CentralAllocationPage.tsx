import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, X } from 'lucide-react'
import { PageContainer } from '@/components/shared/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { AlertBanner } from '@/components/shared/AlertBanner'
import {
  useCentralAllocations,
  useCentralInventory,
  useFinalizeAllocation,
} from '../scmQueries'
import { REGION_LABELS } from '@/types/scm'
import type { CentralAllocationLine, PriorityLevel } from '@/types/scm'

function priorityVariant(p: PriorityLevel) {
  return p === 'critical' ? 'critical' as const : p === 'high' ? 'warning' as const : 'neutral' as const
}
function priorityLabel(p: PriorityLevel) {
  return p === 'critical' ? 'Khẩn cấp' : p === 'high' ? 'Cao' : 'Bình thường'
}

// ─── Edit Allocation Dialog ───────────────────────────────────────────────────

interface EditDialogProps {
  line: CentralAllocationLine
  onClose: () => void
  onSave: (qty: number, reason?: string) => void
  isPending: boolean
}

function EditAllocationDialog({ line, onClose, onSave, isPending }: EditDialogProps) {
  const [qty, setQty] = React.useState((line.scmFinalAllocation ?? line.suggestedAllocation).toString())
  const [reason, setReason] = React.useState(line.scmAllocationReason ?? '')
  const [error, setError] = React.useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(qty)
    if (Number.isNaN(n) || n < 0) { setError('Số lượng không hợp lệ'); return }
    if (n > line.centralAvailable) { setError(`Không thể phân bổ vượt khả dụng kho trung tâm (${line.centralAvailable} ${line.unit})`); return }
    if (n !== line.suggestedAllocation && !reason.trim()) { setError('Vui lòng nhập lý do khi thay đổi số lượng đề xuất'); return }
    setError(null)
    onSave(n, reason || undefined)
  }

  const remaining = line.remainingAfterRebalancing - Number(qty || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Phân bổ từ Kho Trung tâm</h2>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">{line.skuName} · {REGION_LABELS[line.region]}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-[var(--color-canvas)] text-[var(--color-muted)]"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { label: 'Còn cần sau điều chuyển', value: `${line.remainingAfterRebalancing.toLocaleString('vi-VN')} ${line.unit}` },
              { label: 'Kho TT khả dụng', value: `${line.centralAvailable.toLocaleString('vi-VN')} ${line.unit}` },
              { label: 'Gợi ý phân bổ', value: `${line.suggestedAllocation.toLocaleString('vi-VN')} ${line.unit}` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-[var(--radius-control)] bg-[var(--color-canvas)] p-2 text-center">
                <p className="text-[var(--color-muted)]">{label}</p>
                <p className="mt-0.5 font-semibold text-[var(--color-ink)]">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="alloc-qty" className="block text-xs font-medium text-[var(--color-ink)] mb-1">
              SCM Phân bổ cuối ({line.unit}) <span className="text-[var(--color-critical)]">*</span>
            </label>
            <input
              id="alloc-qty"
              type="number"
              min={0}
              max={line.centralAvailable}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required
              className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
            />
            {qty && !Number.isNaN(Number(qty)) && (
              <p className={`mt-1 text-xs ${remaining > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-status-success-fg)]'}`}>
                Còn đưa sang mua ngoài: {remaining.toLocaleString('vi-VN')} {line.unit}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="alloc-reason" className="block text-xs font-medium text-[var(--color-ink)] mb-1">
              Lý do {Number(qty) !== line.suggestedAllocation ? <span className="text-[var(--color-critical)]">*</span> : <span className="text-[var(--color-muted)]">(tùy chọn)</span>}
            </label>
            <textarea
              id="alloc-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Giải thích quyết định phân bổ..."
              className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-xs focus:border-[var(--color-primary)] focus:outline-none resize-none"
            />
          </div>

          {error && <p className="text-xs text-[var(--color-critical)]">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-canvas)] transition-colors">Hủy</button>
            <button type="submit" disabled={isPending} className="rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors">
              {isPending ? 'Đang lưu...' : 'Xác nhận phân bổ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function CentralAllocationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('selected')
  const regionFilter = searchParams.get('region') ?? 'all'

  const [editTarget, setEditTarget] = React.useState<CentralAllocationLine | null>(null)
  const { data: allocations = [], isLoading } = useCentralAllocations({
    region: regionFilter === 'all' ? undefined : regionFilter,
  })
  const { data: inventory = [] } = useCentralInventory()
  const finalizeMutation = useFinalizeAllocation()

  const pendingCount = allocations.filter((a) => a.scmFinalAllocation === null).length
  const totalCentralAllocated = allocations.reduce((s, a) => s + (a.scmFinalAllocation ?? 0), 0)
  const totalRemainingAfterCentral = allocations.reduce((s, a) => s + (a.remainingAfterCentral ?? a.remainingAfterRebalancing), 0)

  function handleSave(qty: number, reason?: string) {
    if (!editTarget) return
    finalizeMutation.mutate(
      { id: editTarget.id, scmFinalAllocation: qty, reason },
      { onSuccess: () => setEditTarget(null) },
    )
  }

  const REGIONS = Object.entries(REGION_LABELS)

  return (
    <PageContainer className="max-w-[1400px]">
      <PageHeader
        title="Phân bổ Kho Trung tâm"
        description="Cấp phát từ kho trung tâm cho phần còn thiếu sau điều chuyển liên vùng"
      />

      {pendingCount > 0 && (
        <div className="mb-6">
          <AlertBanner
            variant="warning"
            title={`${pendingCount} dòng chưa có quyết định phân bổ cuối`}
            description="Các dòng chưa phân bổ sẽ tự động chuyển sang đề xuất mua ngoài."
          />
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Chờ phân bổ', value: pendingCount.toString(), color: 'warning' },
          { label: 'Tổng đã phân bổ', value: totalCentralAllocated.toLocaleString('vi-VN') + ' đv', color: 'success' },
          { label: 'Chuyển sang mua ngoài', value: totalRemainingAfterCentral.toLocaleString('vi-VN') + ' đv', color: 'critical' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-[var(--radius-card)] border p-4 ${
            color === 'warning' ? 'border-[var(--color-status-warning-border)] bg-[var(--color-status-warning-bg)]' :
            color === 'success' ? 'border-[var(--color-status-success-border)] bg-[var(--color-status-success-bg)]' :
            'border-[var(--color-status-critical-border)] bg-[var(--color-status-critical-bg)]'
          }`}>
            <p className={`text-xs font-medium ${
              color === 'warning' ? 'text-[var(--color-status-warning-fg)]' :
              color === 'success' ? 'text-[var(--color-status-success-fg)]' :
              'text-[var(--color-status-critical-fg)]'
            }`}>{label}</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-ink)]">{value}</p>
          </div>
        ))}
      </div>

      {/* Region filter */}
      <div className="mb-4 flex gap-2">
        <select
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
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Allocation table */}
        <div className="lg:col-span-2">
          <SectionCard title={`Kế hoạch phân bổ (${allocations.length} dòng)`} noPadding>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-[var(--color-muted)] text-sm">Đang tải...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-canvas)]">
                      {['Vùng', 'SKU', 'Còn cần', 'KT Khả dụng', 'Gợi ý', 'SCM Phân bổ', 'Sau phân bổ', 'Ưu tiên', ''].map((h) => (
                        <th key={h} className="px-3 py-3 text-left font-medium text-[var(--color-muted)] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {allocations.map((line) => {
                      const isSelected = selectedId === line.id
                      const isPending = line.scmFinalAllocation === null
                      return (
                        <tr
                          key={line.id}
                          className={`hover:bg-[var(--color-canvas)] cursor-pointer ${isSelected ? 'bg-[var(--color-canvas)]' : ''} ${isPending ? 'border-l-2 border-l-[var(--color-warning)]' : ''}`}
                          onClick={() => {
                            const np = new URLSearchParams(searchParams)
                            if (isSelected) np.delete('selected')
                            else np.set('selected', line.id)
                            setSearchParams(np)
                          }}
                        >
                          <td className="px-3 py-3 text-[var(--color-muted)]">{REGION_LABELS[line.region].split(' ').slice(-2).join(' ')}</td>
                          <td className="px-3 py-3">
                            <p className="font-medium text-[var(--color-ink)]">{line.skuName}</p>
                            <p className="text-[var(--color-muted)]">{line.unit}</p>
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums font-medium text-[var(--color-ink)]">{line.remainingAfterRebalancing.toLocaleString('vi-VN')}</td>
                          <td className="px-3 py-3 text-right tabular-nums text-[var(--color-muted)]">{line.centralAvailable.toLocaleString('vi-VN')}</td>
                          <td className="px-3 py-3 text-right tabular-nums text-[var(--color-muted)]">{line.suggestedAllocation.toLocaleString('vi-VN')}</td>
                          <td className="px-3 py-3 text-right tabular-nums">
                            {line.scmFinalAllocation !== null ? (
                              <span className="font-semibold text-[var(--color-primary)]">{line.scmFinalAllocation.toLocaleString('vi-VN')}</span>
                            ) : (
                              <span className="text-[var(--color-warning)] font-medium">—</span>
                            )}
                          </td>
                          <td className={`px-3 py-3 text-right tabular-nums font-medium ${
                            (line.remainingAfterCentral ?? line.remainingAfterRebalancing) > 0
                              ? 'text-[var(--color-critical)]'
                              : 'text-[var(--color-status-success-fg)]'
                          }`}>
                            {(line.remainingAfterCentral ?? '—').toString()}
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge variant={priorityVariant(line.priority)} dot>{priorityLabel(line.priority)}</StatusBadge>
                          </td>
                          <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setEditTarget(line)}
                              className="rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-2 py-1 text-[10px] font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
                            >
                              {line.scmFinalAllocation !== null ? 'Sửa' : 'Phân bổ'}
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
        </div>

        {/* Central inventory snapshot */}
        <div>
          <SectionCard title="Tồn kho Trung tâm" description="Khả dụng để phân bổ" noPadding>
            <ul className="divide-y divide-[var(--color-border)]">
              {inventory.map((item) => {
                const isLow = item.available <= item.rop
                return (
                  <li key={item.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[var(--color-ink)] truncate">{item.skuName}</p>
                        <p className="text-[10px] text-[var(--color-muted)]">{item.warehouseLocation.split('—')[0].trim()}</p>
                      </div>
                      {isLow && (
                        <AlertTriangle size={12} className="mt-0.5 shrink-0 text-[var(--color-warning)]" />
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                      <div>
                        <span className="text-[var(--color-muted)]">Khả dụng: </span>
                        <span className={`font-semibold ${isLow ? 'text-[var(--color-warning)]' : 'text-[var(--color-ink)]'}`}>
                          {item.available.toLocaleString('vi-VN')} {item.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--color-muted)]">ROP: </span>
                        <span>{item.rop.toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </SectionCard>
        </div>
      </div>

      {editTarget && (
        <EditAllocationDialog
          line={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
          isPending={finalizeMutation.isPending}
        />
      )}
    </PageContainer>
  )
}
