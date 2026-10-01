import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock, RefreshCw, X } from 'lucide-react'
import { PageContainer } from '@/components/shared/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  useTransfers,
  useConfirmTransfer,
  useRequestTransferRevision,
} from '../scmQueries'
import { REGION_LABELS } from '@/types/scm'
import type { RegionalTransfer, TransferStatus } from '@/types/scm'

function statusVariant(s: TransferStatus) {
  switch (s) {
    case 'draft':              return 'neutral' as const
    case 'waiting_source_rm':  return 'warning' as const
    case 'waiting_dest_rm':    return 'warning' as const
    case 'revision_requested': return 'critical' as const
    case 'ready':              return 'info' as const
    case 'completed':          return 'success' as const
  }
}
function statusLabel(s: TransferStatus) {
  switch (s) {
    case 'draft':              return 'Nháp'
    case 'waiting_source_rm':  return 'Chờ RM nguồn'
    case 'waiting_dest_rm':    return 'Chờ RM đích'
    case 'revision_requested': return 'Yêu cầu sửa'
    case 'ready':              return 'Sẵn sàng'
    case 'completed':          return 'Hoàn tất'
  }
}

// ─── Confirm / Revision Dialog ───────────────────────────────────────────────

interface ActionDialogProps {
  transfer: RegionalTransfer
  action: 'confirm_source' | 'confirm_dest' | 'revision_source' | 'revision_dest'
  onClose: () => void
  onDone: () => void
  isPending: boolean
}

function ActionDialog({ transfer, action, onClose, onDone, isPending }: ActionDialogProps) {
  const [comment, setComment] = React.useState('')
  const [altQty, setAltQty] = React.useState('')
  const isRevision = action.startsWith('revision')
  const isSource = action.endsWith('source')

  const roleLabel = isSource
    ? `RM ${REGION_LABELS[transfer.sourceRegion]}`
    : `RM ${REGION_LABELS[transfer.destinationRegion]}`

  const confirmMutation = useConfirmTransfer()
  const revisionMutation = useRequestTransferRevision()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isRevision) {
      if (!comment.trim()) return
      revisionMutation.mutate(
        {
          id: transfer.id,
          requestedByRole: isSource ? 'source_rm' : 'dest_rm',
          comment: comment.trim(),
          proposedAlternativeQty: altQty ? Number(altQty) : undefined,
        },
        { onSuccess: onDone },
      )
    } else {
      confirmMutation.mutate(
        {
          id: transfer.id,
          role: isSource ? 'source_rm' : 'dest_rm',
          comment: comment.trim() || undefined,
        },
        { onSuccess: onDone },
      )
    }
  }

  const mutating = isPending || confirmMutation.isPending || revisionMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">
              {isRevision ? 'Yêu cầu điều chỉnh' : 'Xác nhận'} (mô phỏng {roleLabel})
            </h2>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">
              {transfer.skuName} · {transfer.proposedQty.toLocaleString('vi-VN')} {transfer.unit}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-[var(--color-canvas)] text-[var(--color-muted)]"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-[var(--radius-control)] bg-[var(--color-canvas)] p-3">
              <p className="text-[var(--color-muted)]">Nguồn</p>
              <p className="mt-0.5 font-medium text-[var(--color-ink)]">{REGION_LABELS[transfer.sourceRegion].split(' ').slice(-2).join(' ')}</p>
            </div>
            <div className="rounded-[var(--radius-control)] bg-[var(--color-canvas)] p-3">
              <p className="text-[var(--color-muted)]">Đích</p>
              <p className="mt-0.5 font-medium text-[var(--color-ink)]">{REGION_LABELS[transfer.destinationRegion].split(' ').slice(-2).join(' ')}</p>
            </div>
          </div>

          {isRevision && (
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink)] mb-1">Số lượng đề xuất thay thế ({transfer.unit})</label>
              <input
                type="number"
                min={0}
                value={altQty}
                onChange={(e) => setAltQty(e.target.value)}
                placeholder={`Mặc định: ${transfer.proposedQty}`}
                className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--color-ink)] mb-1">
              Ghi chú {isRevision ? <span className="text-[var(--color-critical)]">*</span> : '(tùy chọn)'}
            </label>
            <textarea
              required={isRevision}
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isRevision ? 'Lý do yêu cầu điều chỉnh...' : 'Nhận xét thêm (không bắt buộc)...'}
              className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-xs focus:border-[var(--color-primary)] focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-canvas)] transition-colors">Hủy</button>
            <button
              type="submit"
              disabled={mutating}
              className={`rounded-[var(--radius-control)] px-4 py-2 text-xs font-medium text-white disabled:opacity-50 transition-colors ${isRevision ? 'bg-[var(--color-warning)] hover:opacity-90' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'}`}
            >
              {mutating ? 'Đang xử lý...' : isRevision ? 'Gửi yêu cầu sửa' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Transfer Detail Panel ────────────────────────────────────────────────────

function TransferDetail({ transfer, onClose }: { transfer: RegionalTransfer; onClose: () => void }) {
  const [dialogAction, setDialogAction] = React.useState<ActionDialogProps['action'] | null>(null)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Chi tiết điều chuyển</h2>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">{transfer.id}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded p-1 hover:bg-[var(--color-canvas)] text-[var(--color-muted)]"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Header info */}
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">{transfer.skuName}</p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="font-medium">{REGION_LABELS[transfer.sourceRegion].split(' ').slice(-2).join(' ')}</span>
            <ArrowRight size={14} className="text-[var(--color-muted)]" />
            <span className="font-medium">{REGION_LABELS[transfer.destinationRegion].split(' ').slice(-2).join(' ')}</span>
          </div>
        </div>

        {/* Quantities */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { label: 'Dư nguồn', value: transfer.sourceSurplus },
            { label: 'Thiếu đích', value: transfer.destinationNeed },
            { label: 'Đề xuất', value: transfer.proposedQty },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-[var(--radius-control)] bg-[var(--color-canvas)] p-2 text-center">
              <p className="text-[var(--color-muted)]">{label}</p>
              <p className="mt-0.5 font-semibold text-[var(--color-ink)]">{value.toLocaleString('vi-VN')} {transfer.unit}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-[var(--radius-control)] bg-[var(--color-canvas)] p-2">
            <p className="text-[var(--color-muted)]">Ngày vận chuyển</p>
            <p className="mt-0.5 font-medium text-[var(--color-ink)]">{transfer.transferDate}</p>
          </div>
          <div className="rounded-[var(--radius-control)] bg-[var(--color-canvas)] p-2">
            <p className="text-[var(--color-muted)]">ETA</p>
            <p className="mt-0.5 font-medium text-[var(--color-ink)]">{transfer.eta}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <StatusBadge variant={statusVariant(transfer.status)} dot>{statusLabel(transfer.status)}</StatusBadge>
        </div>

        {/* RM Actions (simulated) */}
        {transfer.status === 'waiting_source_rm' && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--color-muted)]">Mô phỏng phản hồi RM nguồn</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setDialogAction('confirm_source')}
                className="flex-1 rounded-[var(--radius-control)] bg-[var(--color-primary)] py-2 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors">
                ✓ RM Nguồn Xác nhận
              </button>
              <button type="button" onClick={() => setDialogAction('revision_source')}
                className="flex-1 rounded-[var(--radius-control)] border border-[var(--color-warning)] py-2 text-xs font-medium text-[var(--color-status-warning-fg)] hover:bg-[var(--color-status-warning-bg)] transition-colors">
                Yêu cầu sửa
              </button>
            </div>
          </div>
        )}

        {transfer.status === 'waiting_dest_rm' && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--color-muted)]">Mô phỏng phản hồi RM đích</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setDialogAction('confirm_dest')}
                className="flex-1 rounded-[var(--radius-control)] bg-[var(--color-primary)] py-2 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors">
                ✓ RM Đích Xác nhận
              </button>
              <button type="button" onClick={() => setDialogAction('revision_dest')}
                className="flex-1 rounded-[var(--radius-control)] border border-[var(--color-warning)] py-2 text-xs font-medium text-[var(--color-status-warning-fg)] hover:bg-[var(--color-status-warning-bg)] transition-colors">
                Yêu cầu sửa
              </button>
            </div>
          </div>
        )}

        {/* History */}
        <div>
          <p className="text-xs font-medium text-[var(--color-muted)] mb-3">Lịch sử xử lý</p>
          <div className="space-y-3">
            {transfer.history.map((evt, i) => (
              <div key={evt.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                    evt.eventType === 'completed' ? 'bg-[var(--color-status-success-bg)]' :
                    evt.eventType === 'ready' ? 'bg-[var(--color-status-success-bg)]' :
                    evt.eventType === 'revision' ? 'bg-[var(--color-status-warning-bg)]' :
                    'bg-[var(--color-canvas)]'
                  }`}>
                    {evt.eventType === 'completed' || evt.eventType === 'ready' ? (
                      <CheckCircle2 size={12} className="text-[var(--color-status-success-fg)]" />
                    ) : evt.eventType === 'revision' ? (
                      <RefreshCw size={12} className="text-[var(--color-status-warning-fg)]" />
                    ) : (
                      <Clock size={12} className="text-[var(--color-muted)]" />
                    )}
                  </div>
                  {i < transfer.history.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-[var(--color-border)]" />
                  )}
                </div>
                <div className="pb-3 min-w-0">
                  <p className="text-xs font-medium text-[var(--color-ink)]">{evt.title}</p>
                  <p className="text-xs text-[var(--color-muted)]">{evt.actor}</p>
                  {evt.note && <p className="mt-1 text-xs text-[var(--color-text)]">{evt.note}</p>}
                  <p className="mt-0.5 text-[10px] text-[var(--color-muted)]">
                    {new Date(evt.timestamp).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {dialogAction && (
        <ActionDialog
          transfer={transfer}
          action={dialogAction}
          onClose={() => setDialogAction(null)}
          onDone={() => setDialogAction(null)}
          isPending={false}
        />
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const ALL_STATUSES: (TransferStatus | 'all')[] = [
  'all', 'waiting_source_rm', 'waiting_dest_rm', 'revision_requested', 'ready', 'completed', 'draft',
]

export function RebalancingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('selected')
  const statusFilter = (searchParams.get('status') ?? 'all') as TransferStatus | 'all'

  const { data: transfers = [], isLoading } = useTransfers({ status: statusFilter === 'all' ? undefined : statusFilter })

  const selectedTransfer = selectedId ? transfers.find((t) => t.id === selectedId) ?? null : null

  const pendingCount = transfers.filter((t) => t.status === 'waiting_source_rm' || t.status === 'waiting_dest_rm').length
  const readyCount = transfers.filter((t) => t.status === 'ready').length
  const completedCount = transfers.filter((t) => t.status === 'completed').length

  return (
    <PageContainer className="max-w-[1400px]">
      <PageHeader
        title="Điều chuyển liên vùng"
        description="Cân đối tồn kho giữa các vùng trước khi cấp từ kho trung tâm"
      />

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Đang chờ xác nhận', value: pendingCount, variant: 'warning' as const },
          { label: 'Sẵn sàng vận chuyển', value: readyCount, variant: 'info' as const },
          { label: 'Đã hoàn tất', value: completedCount, variant: 'success' as const },
        ].map(({ label, value, variant }) => (
          <div key={label} className={`rounded-[var(--radius-card)] border p-4 ${
            variant === 'warning' ? 'border-[var(--color-status-warning-border)] bg-[var(--color-status-warning-bg)]' :
            variant === 'info' ? 'border-[var(--color-status-info-border)] bg-[var(--color-status-info-bg)]' :
            'border-[var(--color-status-success-border)] bg-[var(--color-status-success-bg)]'
          }`}>
            <p className={`text-xs font-medium ${
              variant === 'warning' ? 'text-[var(--color-status-warning-fg)]' :
              variant === 'info' ? 'text-[var(--color-status-info-fg)]' :
              'text-[var(--color-status-success-fg)]'
            }`}>{label}</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-ink)]">{value}</p>
          </div>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {ALL_STATUSES.map((s) => (
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
            {s === 'all' ? 'Tất cả' : statusLabel(s as TransferStatus)}
          </button>
        ))}
      </div>

      <div className={`grid gap-6 ${selectedTransfer ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
        {/* Transfer list */}
        <SectionCard title={`Danh sách điều chuyển (${transfers.length})`} noPadding>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-[var(--color-muted)] text-sm">Đang tải...</div>
          ) : transfers.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-[var(--color-muted)] text-sm">Không có lô điều chuyển nào.</div>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {transfers.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      const np = new URLSearchParams(searchParams)
                      if (selectedId === t.id) np.delete('selected')
                      else np.set('selected', t.id)
                      setSearchParams(np)
                    }}
                    className={`flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-[var(--color-canvas)] transition-colors ${selectedId === t.id ? 'bg-[var(--color-canvas)]' : ''}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-[var(--color-ink)]">{t.skuName}</p>
                        <StatusBadge variant={statusVariant(t.status)} dot>{statusLabel(t.status)}</StatusBadge>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
                        <span>{REGION_LABELS[t.sourceRegion].split(' ').slice(-2).join(' ')}</span>
                        <ArrowRight size={12} />
                        <span>{REGION_LABELS[t.destinationRegion].split(' ').slice(-2).join(' ')}</span>
                        <span>·</span>
                        <span className="font-medium text-[var(--color-ink)]">{t.proposedQty.toLocaleString('vi-VN')} {t.unit}</span>
                        <span>·</span>
                        <span>ETA {t.eta}</span>
                      </div>
                    </div>
                    <ArrowRight size={14} className="mt-1 shrink-0 text-[var(--color-muted)]" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Detail panel */}
        {selectedTransfer && (
          <div className="sticky top-20 max-h-[calc(100vh-120px)] overflow-hidden">
            <TransferDetail
              transfer={selectedTransfer}
              onClose={() => {
                const np = new URLSearchParams(searchParams)
                np.delete('selected')
                setSearchParams(np)
              }}
            />
          </div>
        )}
      </div>
    </PageContainer>
  )
}
