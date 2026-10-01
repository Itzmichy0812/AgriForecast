import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CloudRain,
  History,
  Info,
  Loader2,
  Lock,
  RotateCcw,
  Save,
  Sprout,
} from 'lucide-react'
import { AlertBanner } from '@/components/shared/AlertBanner'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { PageContainer } from '@/components/shared/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  useAdjustForecast,
  useDealerForecast,
  useRevertForecast,
} from '@/services/dealerQueries'
import type { DealerForecast, ForecastSignal, WeeklyTrendPoint } from '@/types/dealer'

function SignalIcon({ type }: { type: ForecastSignal['type'] }) {
  switch (type) {
    case 'weather':
      return <CloudRain size={16} className="text-blue-500" />
    case 'season':
      return <Sprout size={16} className="text-emerald-500" />
    case 'historical':
      return <History size={16} className="text-purple-500" />
  }
}

/** Lightweight SVG 8-Week Trend Visualization */
function WeeklyTrendChart({ data, unit }: { data: WeeklyTrendPoint[]; unit: string }) {
  if (!data || data.length === 0) return null

  const maxVal = Math.max(
    ...data.map((d) =>
      Math.max(d.actual ?? 0, d.systemForecast ?? 0, d.dealerForecast ?? 0)
    ),
    100
  )
  const chartHeight = 160
  const chartWidth = 560
  const paddingX = 40
  const paddingY = 25
  const innerWidth = chartWidth - paddingX * 2
  const innerHeight = chartHeight - paddingY * 2

  const getX = (index: number) =>
    paddingX + (index / (data.length - 1)) * innerWidth
  const getY = (val: number) =>
    chartHeight - paddingY - (val / (maxVal * 1.15)) * innerHeight

  const systemPoints = data
    .filter((d) => d.systemForecast !== undefined)
    .map((d, i) => `${getX(i)},${getY(d.systemForecast!)}`)
    .join(' ')

  const actualPoints = data
    .filter((d) => d.actual !== undefined)
    .map((d, i) => `${getX(i)},${getY(d.actual!)}`)
    .join(' ')

  const dealerPoints = data
    .filter((d) => d.dealerForecast !== undefined)
    .map((d, i) => `${getX(i)},${getY(d.dealerForecast!)}`)
    .join(' ')

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[500px]">
        {/* Legend */}
        <div className="flex items-center justify-end gap-5 mb-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-emerald-600 rounded-full" />
            <span className="text-[var(--color-muted)]">Thực tế đã bán</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-blue-500 stroke-dashed rounded-full" />
            <span className="text-[var(--color-muted)]">Hệ thống dự báo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-amber-500 rounded-full" />
            <span className="text-[var(--color-muted)]">Đại lý đề xuất</span>
          </div>
        </div>

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 overflow-visible"
        >
          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={getY(0)}
            x2={chartWidth - paddingX}
            y2={getY(0)}
            stroke="var(--color-border)"
            strokeDasharray="2 2"
          />
          <line
            x1={paddingX}
            y1={getY(maxVal / 2)}
            x2={chartWidth - paddingX}
            y2={getY(maxVal / 2)}
            stroke="var(--color-border)"
            strokeDasharray="2 2"
          />
          <line
            x1={paddingX}
            y1={getY(maxVal)}
            x2={chartWidth - paddingX}
            y2={getY(maxVal)}
            stroke="var(--color-border)"
            strokeDasharray="2 2"
          />

          {/* Actual line */}
          {actualPoints && (
            <polyline
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={actualPoints}
            />
          )}

          {/* System Forecast line */}
          {systemPoints && (
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={systemPoints}
            />
          )}

          {/* Dealer Forecast line if present */}
          {dealerPoints && (
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={dealerPoints}
            />
          )}

          {/* Data dots & labels */}
          {data.map((d, i) => {
            const x = getX(i)
            const val = d.dealerForecast ?? d.systemForecast ?? d.actual ?? 0
            const y = getY(val)
            return (
              <g key={d.week}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#ffffff"
                  stroke={d.dealerForecast ? '#f59e0b' : d.actual ? '#059669' : '#3b82f6'}
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  className="text-[10px] fill-[var(--color-muted)] font-mono"
                >
                  {d.week}
                </text>
                <text
                  x={x}
                  y={y - 8}
                  textAnchor="middle"
                  className="text-[10px] font-semibold fill-[var(--color-ink)]"
                >
                  {val}
                </text>
              </g>
            )
          })}
        </svg>
        <p className="text-right text-[11px] text-[var(--color-muted)] mt-1">
          Đơn vị: {unit} • Chuỗi 8 tuần (4 tuần thực tế gần nhất + 4 tuần kế hoạch tiếp theo)
        </p>
      </div>
    </div>
  )
}

interface ForecastAdjustmentFormProps {
  forecast: DealerForecast
  onSuccess: (msg: string) => void
}

function ForecastAdjustmentForm({ forecast, onSuccess }: ForecastAdjustmentFormProps) {
  const adjustMutation = useAdjustForecast()
  const revertMutation = useRevertForecast()

  const [proposedQty, setProposedQty] = React.useState<number | ''>(
    forecast.dealerAdjusted !== null ? forecast.dealerAdjusted : forecast.systemForecast
  )
  const [reason, setReason] = React.useState(forecast.adjustmentReason || '')
  const [formError, setFormError] = React.useState<string | null>(null)

  const isAdjusted = forecast.dealerAdjusted !== null
  const proposedNum = Number(proposedQty)
  const isDifferentFromSystem =
    proposedQty !== '' && proposedNum !== forecast.systemForecast

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (proposedQty === '' || isNaN(proposedNum) || proposedNum <= 0) {
      setFormError('Vui lòng nhập số lượng dự báo hợp lệ (> 0).')
      return
    }

    if (isDifferentFromSystem && !reason.trim()) {
      setFormError(
        'Quy tắc nghiệp vụ: Khi số lượng đại lý đề xuất khác với System Forecast, bắt buộc phải nêu rõ lý do điều chỉnh.'
      )
      return
    }

    try {
      await adjustMutation.mutateAsync({
        forecastId: forecast.id,
        proposedQty: proposedNum,
        reason: reason.trim(),
      })
      onSuccess(
        `Đã lưu điều chỉnh thành công! Final Planning Value được cập nhật thành ${proposedNum.toLocaleString('vi-VN')} ${forecast.unit}.`
      )
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu điều chỉnh.'
      )
    }
  }

  const handleRevertToSystem = async () => {
    setFormError(null)
    try {
      await revertMutation.mutateAsync(forecast.id)
      setProposedQty(forecast.systemForecast)
      setReason('')
      onSuccess(
        `Đã đưa về dự báo gốc của hệ thống! Final Planning Value = ${forecast.systemForecast.toLocaleString('vi-VN')} ${forecast.unit}.`
      )
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Có lỗi khi khôi phục dự báo hệ thống.'
      )
    }
  }

  return (
    <SectionCard
      title="Phiếu điều chỉnh nhu cầu"
      description="Đại lý đề xuất số lượng khác nếu có thông tin đặc thù tại địa phương"
      className="sticky top-20"
    >
      {formError && (
        <div className="mb-4 flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-status-critical-bg)] p-3 text-xs font-medium text-[var(--color-status-critical-fg)] border border-[var(--color-border)]">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSaveAdjustment} className="space-y-4">
        {/* Readonly System Forecast */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
            System Forecast (Hệ thống tính toán)
          </label>
          <div className="flex items-center justify-between rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm font-semibold text-[var(--color-ink)]">
            <span>
              {forecast.systemForecast.toLocaleString('vi-VN')} {forecast.unit}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-normal text-[var(--color-muted)]">
              <Lock size={12} /> Chỉ đọc
            </span>
          </div>
        </div>

        {/* Dealer Proposed Qty */}
        <div>
          <label
            htmlFor="prop-qty"
            className="block text-xs font-medium text-[var(--color-ink)] mb-1"
          >
            Số lượng đại lý đề xuất ({forecast.unit}){' '}
            <span className="text-[var(--color-critical)]">*</span>
          </label>
          <input
            id="prop-qty"
            type="number"
            min="1"
            step="any"
            value={proposedQty}
            onChange={(e) =>
              setProposedQty(
                e.target.value === '' ? '' : Number(e.target.value)
              )
            }
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-base font-semibold text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
            required
          />
          {isDifferentFromSystem && (
            <p className="mt-1 text-xs text-[var(--color-accent)] font-medium">
              Chênh lệch so với hệ thống:{' '}
              {proposedNum - forecast.systemForecast > 0 ? '+' : ''}
              {(proposedNum - forecast.systemForecast).toLocaleString('vi-VN')}{' '}
              {forecast.unit}
            </p>
          )}
        </div>

        {/* Adjustment Reason */}
        <div>
          <label
            htmlFor="adj-reason"
            className="block text-xs font-medium text-[var(--color-ink)] mb-1"
          >
            Lý do điều chỉnh{' '}
            {isDifferentFromSystem ? (
              <span className="text-[var(--color-critical)]">* (Bắt buộc)</span>
            ) : (
              <span className="text-[var(--color-muted)]">(Không bắt buộc nếu bằng System Forecast)</span>
            )}
          </label>
          <textarea
            id="adj-reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ghi rõ căn cứ (Ví dụ: Ký hợp đồng cung ứng 3 HTX mới, dịch hại gia tăng ngoài vùng dự báo, bà con chuyển đổi giống lúa...)"
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none resize-none"
          />
        </div>

        {/* Rule reminder note */}
        <div className="rounded-[var(--radius-control)] bg-[var(--color-canvas)] p-3 text-[11px] text-[var(--color-muted)] leading-relaxed border border-[var(--color-border)]">
          <strong>Quy tắc hệ thống:</strong>
          <ul className="list-disc pl-4 mt-1 space-y-1">
            <li>System Forecast không bao giờ bị ghi đè.</li>
            <li>Nếu lưu điều chỉnh, Final Planning = Dealer Adjusted.</li>
            <li>Nếu giữ nguyên, Final Planning = System Forecast.</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="submit"
            disabled={adjustMutation.isPending}
            className="w-full inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
          >
            {adjustMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Lưu điều chỉnh
          </button>

          <button
            type="button"
            onClick={handleRevertToSystem}
            disabled={revertMutation.isPending || !isAdjusted}
            className="w-full inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-canvas)] transition-colors disabled:opacity-40"
          >
            {revertMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RotateCcw size={14} />
            )}
            Giữ forecast hệ thống
          </button>
        </div>
      </form>
    </SectionCard>
  )
}

export function ForecastDetailPage() {
  const { forecastId } = useParams<{ forecastId: string }>()
  const { data: forecast, isLoading, error } = useDealerForecast(forecastId || '')
  const [successBanner, setSuccessBanner] = React.useState<string | null>(null)

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <LoadingSkeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <LoadingSkeleton className="h-28" />
            <LoadingSkeleton className="h-28" />
            <LoadingSkeleton className="h-28" />
            <LoadingSkeleton className="h-28" />
          </div>
          <LoadingSkeleton className="h-64 w-full" />
        </div>
      </PageContainer>
    )
  }

  if (error || !forecast) {
    return (
      <PageContainer>
        <div className="mb-4">
          <Link
            to="/dealer/forecast"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <ArrowLeft size={16} />
            Quay lại danh sách dự báo
          </Link>
        </div>
        <AlertBanner
          variant="critical"
          title="Không tìm thấy bản ghi dự báo"
          description="Mã dự báo không tồn tại hoặc đã bị xóa."
        />
      </PageContainer>
    )
  }

  const isAdjusted = forecast.dealerAdjusted !== null

  return (
    <PageContainer>
      {/* Top back navigation */}
      <div className="mb-4">
        <Link
          to="/dealer/forecast"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại Bảng làm việc Dự báo
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        title={forecast.skuName}
        description={`Mã SKU: ${forecast.sku} • Ngành hàng: ${forecast.productGroup} • Kỳ áp dụng: ${forecast.period}`}
        actions={
          <div className="flex items-center gap-2">
            {forecast.status === 'needs_review' && (
              <StatusBadge variant="warning">Cần review</StatusBadge>
            )}
            {forecast.status === 'adjusted' && (
              <StatusBadge variant="info">Đã điều chỉnh</StatusBadge>
            )}
            {forecast.status === 'confirmed' && (
              <StatusBadge variant="success">Đã xác nhận</StatusBadge>
            )}
            {forecast.status === 'normal' && (
              <StatusBadge variant="neutral">Bình thường</StatusBadge>
            )}
          </div>
        }
      />

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="mb-6">
          <AlertBanner
            variant="success"
            title={successBanner}
            dismissible
          />
        </div>
      )}

      {/* Top Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 1. System Forecast */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between text-xs text-[var(--color-muted)] mb-1">
            <span className="font-medium">System Forecast</span>
            <span className="flex items-center gap-1 text-[var(--color-muted)]">
              <Lock size={12} /> Bất biến
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-[var(--color-ink)]">
              {forecast.systemForecast.toLocaleString('vi-VN')}
            </span>
            <span className="text-sm text-[var(--color-muted)]">{forecast.unit}</span>
          </div>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Mô hình AI dự báo tự động
          </p>
        </div>

        {/* 2. Dealer Adjusted */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between text-xs text-[var(--color-muted)] mb-1">
            <span className="font-medium">Dealer Adjusted</span>
            <span className="text-xs text-[var(--color-accent)] font-semibold">
              {isAdjusted ? 'Đã nhập' : 'Chưa chỉnh'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-[var(--color-accent)]">
              {forecast.dealerAdjusted !== null
                ? forecast.dealerAdjusted.toLocaleString('vi-VN')
                : '—'}
            </span>
            {forecast.dealerAdjusted !== null && (
              <span className="text-sm text-[var(--color-muted)]">{forecast.unit}</span>
            )}
          </div>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Lượng điều chỉnh của đại lý
          </p>
        </div>

        {/* 3. Final Planning Value */}
        <div className="rounded-[var(--radius-card)] border-2 border-[var(--color-primary)] bg-[var(--color-surface)] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--color-primary)] mb-1 font-semibold">
            <span>Final Planning Value</span>
            <span>Giá trị chốt</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-[var(--color-primary)]">
              {forecast.finalPlanning.toLocaleString('vi-VN')}
            </span>
            <span className="text-sm text-[var(--color-muted)]">{forecast.unit}</span>
          </div>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            {isAdjusted
              ? 'Lấy theo Dealer Adjusted'
              : 'Lấy theo System Forecast'}
          </p>
        </div>

        {/* 4. Previous Period Error */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between text-xs text-[var(--color-muted)] mb-1">
            <span className="font-medium">Sai số kỳ trước</span>
            <span className="text-xs text-[var(--color-muted)] font-mono">
              Tháng 09/2026
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-bold ${
                (forecast.previousPeriodError ?? 0) < 0
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {forecast.previousPeriodError !== undefined
                ? `${forecast.previousPeriodError > 0 ? '+' : ''}${forecast.previousPeriodError}%`
                : 'N/A'}
            </span>
          </div>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Độ chính xác mô hình: 96.8%
          </p>
        </div>
      </div>

      {/* Main Grid: Signals & Trend on Left, Adjustment Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column (2 spans): Trend & Explanatory Signals */}
        <div className="space-y-6 lg:col-span-2">
          {/* 8-Week Trend Visualization */}
          <SectionCard
            title="Biểu đồ xu hướng 8 tuần"
            description="So sánh lượng tiêu thụ thực tế và dự báo tuần qua chu kỳ canh tác"
          >
            <WeeklyTrendChart
              data={forecast.weeklyTrend}
              unit={forecast.unit}
            />
          </SectionCard>

          {/* Evidence & Explanatory Signals */}
          <SectionCard
            title="Tín hiệu giải trình & Căn cứ dự báo"
            description="Các tín hiệu AI tổng hợp từ dữ liệu thời tiết, lịch thời vụ và lịch sử tiêu thụ tại địa bàn"
            actions={
              <span className="inline-flex items-center gap-1 rounded bg-[var(--color-canvas)] px-2 py-1 text-[11px] font-medium text-[var(--color-muted)]">
                <Info size={12} />
                Dữ liệu mô phỏng nguyên nhân
              </span>
            }
          >
            <div className="space-y-3">
              {forecast.signals && forecast.signals.length > 0 ? (
                forecast.signals.map((sig) => (
                  <div
                    key={sig.id}
                    className="flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-canvas)] p-3.5"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]">
                      <SignalIcon type={sig.type} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <h4 className="text-xs font-semibold text-[var(--color-ink)]">
                          {sig.title}
                        </h4>
                        <span className="text-[11px] font-mono text-[var(--color-muted)]">
                          Độ tin cậy: {Math.round(sig.confidence * 100)}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--color-muted)] leading-relaxed">
                        {sig.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--color-muted)] italic">
                  Không có tín hiệu bất thường nào được ghi nhận cho mặt hàng này.
                </p>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right Column (1 span): Adjustment Panel */}
        <div>
          <ForecastAdjustmentForm
            key={`${forecast.id}-${forecast.dealerAdjusted ?? 'unadjusted'}`}
            forecast={forecast}
            onSuccess={(msg) => setSuccessBanner(msg)}
          />
        </div>
      </div>
    </PageContainer>
  )
}