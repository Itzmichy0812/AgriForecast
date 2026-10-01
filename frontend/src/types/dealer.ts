/**
 * Dealer Domain Models
 * Phase 2 - AgriForecast
 */

export type ForecastStatus = 'normal' | 'needs_review' | 'adjusted' | 'confirmed'

export interface ForecastSignal {
  id: string
  type: 'weather' | 'season' | 'historical'
  label: string
  title: string
  description: string
  impact: 'positive' | 'negative' | 'neutral'
  confidence: number // e.g. 0.85 (85%)
}

export interface WeeklyTrendPoint {
  week: string // e.g. 'W35', 'W36', ...
  weekLabel: string // e.g. 'Tuần 35'
  actual?: number
  systemForecast?: number
  dealerForecast?: number
}

export interface DealerForecast {
  id: string
  sku: string
  skuName: string
  productGroup: string
  period: string // e.g. 'Tháng 10/2026'
  periodKey: string // e.g. '2026-10'
  unit: string
  systemForecast: number
  dealerAdjusted: number | null
  finalPlanning: number // Computed: dealerAdjusted ?? systemForecast
  variance: number // Percentage variance vs baseline / previous period
  status: ForecastStatus
  previousPeriodError?: number // e.g. -4.8 (%)
  adjustmentReason?: string
  lastUpdated: string
  signals: ForecastSignal[]
  weeklyTrend: WeeklyTrendPoint[]
  notes?: string
}

export type InventoryStatus = 'normal' | 'caution' | 'critical'

export interface DealerInventoryItem {
  id: string
  sku: string
  skuName: string
  productGroup: string
  unit: string
  onHand: number
  incoming: number
  allocated: number
  available: number // Computed: onHand - allocated
  rop: number // Reorder Point
  coverageDays: number // Estimated days of supply
  status: InventoryStatus
  warehouseLocation: string
  expiryDate?: string
  lastRestocked?: string
}

export type RequestUrgency = 'normal' | 'high' | 'critical'
export type RequestState = 'sent' | 'acknowledged'
export type FulfillmentState = 'pending' | 'partial' | 'fulfilled' | 'unable'

export interface RequestHistoryEvent {
  id: string
  eventType: 'sent' | 'acknowledged' | 'allocated' | 'rejected' | 'note'
  title: string
  timestamp: string
  actor: string
  note?: string
}

export interface ManualRequest {
  id: string // e.g. 'REQ-20261001-001'
  dealerId: string
  dealerName: string
  sku: string
  skuName: string
  unit: string
  requestedQty: number
  allocatedQty: number
  remainingQty: number // Computed: requestedQty - allocatedQty
  urgency: RequestUrgency
  needByDate: string // YYYY-MM-DD
  reason: string
  requestState: RequestState
  fulfillmentState: FulfillmentState
  createdAt: string
  updatedAt: string
  history: RequestHistoryEvent[]
}

export interface CreateManualRequestInput {
  sku: string
  requestedQty: number
  urgency: RequestUrgency
  needByDate: string
  reason: string
}

export interface AdjustForecastInput {
  forecastId: string
  proposedQty: number
  reason: string
}

export interface PriorityActionItem {
  id: string
  type: 'forecast' | 'inventory' | 'request'
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  targetUrl: string
  badgeText: string
  timestamp: string
}