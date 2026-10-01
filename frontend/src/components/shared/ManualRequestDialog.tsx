import * as React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import { useCreateManualRequest } from '@/services/dealerQueries'
import type { RequestUrgency } from '@/types/dealer'

interface ManualRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultSku?: string
  onSuccess?: (requestId: string) => void
}

const AVAILABLE_SKUS = [
  { sku: 'PB-URE-01', name: 'Phân bón Ure Hạt Trong Cà Mau (Tấn)' },
  { sku: 'PB-NPK-02', name: 'Phân bón NPK Đầu Trâu 16-16-8+TE (Tấn)' },
  { sku: 'PB-DAP-03', name: 'Phân bón DAP Đình Vũ 18-46 (Tấn)' },
  { sku: 'PB-KALI-04', name: 'Phân Kali Clorua Bột (Israel) (Tấn)' },
  { sku: 'BVTV-FILIA-05', name: 'Thuốc trừ bệnh Filia 525SE (Lít)' },
  { sku: 'BVTV-ANVIL-06', name: 'Thuốc trừ nấm Anvil 5SC (Lít)' },
  { sku: 'PB-HUUCO-07', name: 'Phân bón hữu cơ sinh học Komix (Tấn)' },
  { sku: 'BVTV-REGENT-08', name: 'Thuốc trừ sâu Regent 800WG (Gói)' },
  { sku: 'PB-SA-09', name: 'Phân đạm SA (Ammonium Sulphate) (Tấn)' },
]

interface InnerFormProps {
  defaultSku?: string
  onClose: () => void
  onSuccess?: (requestId: string) => void
}

function ManualRequestForm({ defaultSku = '', onClose, onSuccess }: InnerFormProps) {
  const [sku, setSku] = React.useState(() => defaultSku || AVAILABLE_SKUS[0].sku)
  const [requestedQty, setRequestedQty] = React.useState<number | ''>('')
  const [urgency, setUrgency] = React.useState<RequestUrgency>('normal')
  const [needByDate, setNeedByDate] = React.useState(() => {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 5)
    return targetDate.toISOString().slice(0, 10)
  })
  const [reason, setReason] = React.useState('')
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  const createMutation = useCreateManualRequest()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!sku) {
      setErrorMsg('Vui lòng chọn mã sản phẩm (SKU).')
      return
    }

    const qty = Number(requestedQty)
    if (!requestedQty || isNaN(qty) || qty <= 0) {
      setErrorMsg('Số lượng yêu cầu phải lớn hơn 0.')
      return
    }

    if (!needByDate) {
      setErrorMsg('Vui lòng chọn ngày cần hàng.')
      return
    }

    if (!reason.trim()) {
      setErrorMsg('Vui lòng nhập lý do yêu cầu bổ sung hàng ngoài kế hoạch.')
      return
    }

    try {
      const created = await createMutation.mutateAsync({
        sku,
        requestedQty: qty,
        urgency,
        needByDate,
        reason: reason.trim(),
      })

      setSuccessMsg(`Tạo yêu cầu thành công! Mã: #${created.id}`)
      if (onSuccess) {
        onSuccess(created.id)
      }

      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo yêu cầu.')
    }
  }

  return (
    <>
      {errorMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-status-critical-bg)] p-3 text-xs font-medium text-[var(--color-status-critical-fg)] border border-[var(--color-border)]">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-status-success-bg)] p-3 text-xs font-medium text-[var(--color-status-success-fg)] border border-[var(--color-border)]">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="req-sku"
            className="block text-xs font-medium text-[var(--color-ink)] mb-1.5"
          >
            Sản phẩm / SKU <span className="text-[var(--color-critical)]">*</span>
          </label>
          <select
            id="req-sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
            required
          >
            {AVAILABLE_SKUS.map((item) => (
              <option key={item.sku} value={item.sku}>
                [{item.sku}] {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="req-qty"
              className="block text-xs font-medium text-[var(--color-ink)] mb-1.5"
            >
              Số lượng yêu cầu <span className="text-[var(--color-critical)]">*</span>
            </label>
            <input
              id="req-qty"
              type="number"
              min="1"
              step="any"
              value={requestedQty}
              onChange={(e) =>
                setRequestedQty(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="Nhập số lượng..."
              className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="req-urgency"
              className="block text-xs font-medium text-[var(--color-ink)] mb-1.5"
            >
              Mức độ khẩn cấp
            </label>
            <select
              id="req-urgency"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as RequestUrgency)}
              className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              <option value="normal">Bình thường</option>
              <option value="high">Cao</option>
              <option value="critical">Khẩn cấp</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="req-date"
            className="block text-xs font-medium text-[var(--color-ink)] mb-1.5"
          >
            Ngày cần hàng (Need-by date) <span className="text-[var(--color-critical)]">*</span>
          </label>
          <input
            id="req-date"
            type="date"
            value={needByDate}
            onChange={(e) => setNeedByDate(e.target.value)}
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
            required
          />
        </div>

        <div>
          <label
            htmlFor="req-reason"
            className="block text-xs font-medium text-[var(--color-ink)] mb-1.5"
          >
            Lý do yêu cầu <span className="text-[var(--color-critical)]">*</span>
          </label>
          <textarea
            id="req-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Giải trình lý do nhu cầu phát sinh ngoài kế hoạch (đột xuất vụ mùa, hợp đồng mới, tồn kho thấp...)"
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none resize-none"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-canvas)] transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || Boolean(successMsg)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
          >
            {createMutation.isPending && (
              <Loader2 size={16} className="animate-spin" />
            )}
            Gửi yêu cầu
          </button>
        </div>
      </form>
    </>
  )
}

export function ManualRequestDialog({
  open,
  onOpenChange,
  defaultSku = '',
  onSuccess,
}: ManualRequestDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl focus:outline-none animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-[var(--color-ink)]">
                Tạo yêu cầu bổ sung hàng hóa
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-[var(--color-muted)]">
                Yêu cầu phát sinh ngoài kế hoạch dự báo nhu cầu định kỳ.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-[var(--radius-control)] p-1 text-[var(--color-muted)] hover:bg-[var(--color-canvas)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Đóng hộp thoại"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {open && (
            <ManualRequestForm
              key={`${open}-${defaultSku}`}
              defaultSku={defaultSku}
              onClose={() => onOpenChange(false)}
              onSuccess={onSuccess}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}