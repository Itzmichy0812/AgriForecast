/**
 * SCM Domain Models
 * AgriForecast — Supply Chain Management Workspace
 *
 * Approved supply flow:
 *   Dealer demand
 *   → RM processes allocation / rebalancing
 *   → only Remaining Need escalated to SCM
 *   → SCM cross-region rebalancing (surplus first)
 *   → Central Warehouse allocation
 *   → External procurement (last resort)
 */

// ─── Shared primitives ────────────────────────────────────────────────────

export type RegionId =
  | 'MEKONG_DELTA'
  | 'SOUTHEAST'
  | 'CENTRAL_HIGHLANDS'
  | 'SOUTH_CENTRAL'
  | 'NORTH_CENTRAL'

export const REGION_LABELS: Record<RegionId, string> = {
  MEKONG_DELTA:      'Đồng bằng Sông Cửu Long',
  SOUTHEAST:         'Đông Nam Bộ',
  CENTRAL_HIGHLANDS: 'Tây Nguyên',
  SOUTH_CENTRAL:     'Duyên hải Nam Trung Bộ',
  NORTH_CENTRAL:     'Bắc Trung Bộ',
}

export type PriorityLevel = 'critical' | 'high' | 'normal'
export type SupplyPeriod = '2026-10' | '2026-11'

// ─── 1. Regional Requirements (output from RM) ────────────────────────────

/**
 * A single RM → SCM requirement line.
 * Represents ONE SKU for ONE region after regional processing.
 *
 * Immutable: dealerEffectiveDemand, rmRequested
 * SCM-editable: scmOverride (must provide reason)
 */
export interface RegionalRequirement {
  id: string
  region: RegionId
  sku: string
  skuName: string
  unit: string
  productGroup: string
  period: SupplyPeriod

  /** Aggregated Final Planning from all dealers in this region */
  dealerEffectiveDemand: number
  /** Dealer Manual Request quantities outstanding in this region */
  dealerManualRequests: number
  /** RM assessed required quantity after regional stock check */
  rmRequested: number
  /** SCM override — null means SCM accepts rmRequested */
  scmOverride: number | null
  /** Reason required when scmOverride !== null */
  scmOverrideReason?: string

  /** Stock available in the regional warehouse at submission time */
  regionalAvailable: number
  /** Remaining need sent to SCM = rmRequested - regionalAvailable */
  remainingNeed: number

  needByDate: string
  priority: PriorityLevel

  /** Track allocation progress through SCM flow */
  rebalancingAllocated: number   // from cross-region transfers
  centralAllocated: number       // from Central Warehouse
  procurementOrdered: number     // from approved POs

  /** Computed: remainingNeed - rebalancingAllocated - centralAllocated - procurementOrdered */
  stillUnmet: number

  submittedAt: string
  updatedAt: string
}

// ─── 2. Cross-Region Transfers ────────────────────────────────────────────

export type TransferStatus =
  | 'draft'
  | 'waiting_source_rm'
  | 'waiting_dest_rm'
  | 'revision_requested'
  | 'ready'
  | 'completed'

export interface TransferHistoryEvent {
  id: string
  eventType: 'created' | 'source_confirmed' | 'dest_confirmed' | 'revision' | 'ready' | 'completed' | 'note'
  title: string
  timestamp: string
  actor: string
  note?: string
}

export interface RegionalTransfer {
  id: string
  sku: string
  skuName: string
  unit: string

  sourceRegion: RegionId
  destinationRegion: RegionId

  /** Surplus available at source */
  sourceSurplus: number
  /** Shortfall at destination */
  destinationNeed: number
  /** Quantity SCM proposes to transfer */
  proposedQty: number
  /** Actual confirmed quantity (may differ after revision) */
  confirmedQty: number | null

  transferDate: string
  eta: string

  status: TransferStatus
  proposedByScm: string
  sourceRmComment?: string
  destRmComment?: string

  requirementId: string
  period: SupplyPeriod
  createdAt: string
  updatedAt: string
  history: TransferHistoryEvent[]
}

// ─── 3. Central Warehouse Inventory ───────────────────────────────────────

export interface CentralInventoryItem {
  id: string
  sku: string
  skuName: string
  productGroup: string
  unit: string

  onHand: number
  reserved: number
  available: number

  rop: number
  incomingFromProduction: number

  warehouseLocation: string
  lastRestocked: string
}

// ─── 4. Central Allocation ────────────────────────────────────────────────

export interface CentralAllocationLine {
  id: string
  requirementId: string
  region: RegionId
  sku: string
  skuName: string
  unit: string

  remainingAfterRebalancing: number
  centralAvailable: number
  suggestedAllocation: number
  scmFinalAllocation: number | null
  scmAllocationReason?: string

  remainingAfterCentral: number | null

  period: SupplyPeriod
  needByDate: string
  priority: PriorityLevel
  updatedAt: string
}

// ─── 5. Suppliers ─────────────────────────────────────────────────────────

export interface Supplier {
  id: string
  name: string
  country: string
  contactPerson: string
  email: string
  categories: string[]

  unitPrice: number
  moq: number
  leadTimeDays: number
  availableCapacity: number
  paymentTerms: string

  onTimeDeliveryRate: number
  qualityTier: 'A' | 'B' | 'C'
  qualityAlerts?: string
}

// ─── 6. Purchase Recommendations ─────────────────────────────────────────

export type PurchaseRecommendationStatus =
  | 'pending'
  | 'accepted'
  | 'po_created'
  | 'dismissed'

export interface PurchaseRecommendation {
  id: string
  requirementId: string
  region: RegionId
  sku: string
  skuName: string
  productGroup: string
  unit: string

  remainingShortage: number
  needByDate: string
  priority: PriorityLevel

  recommendedQty: number
  moq: number
  leadTimeDays: number
  referenceUnitCost: number
  estimatedTotalCost: number

  reason: string
  status: PurchaseRecommendationStatus

  scmQty: number | null
  scmQtyReason?: string
  selectedSupplierId?: string

  period: SupplyPeriod
  createdAt: string
  updatedAt: string
}

// ─── 7. Purchase Orders ───────────────────────────────────────────────────

export type POStatus = 'draft' | 'approved' | 'rejected'

export interface POLine {
  id: string
  sku: string
  skuName: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
  deliveryDate: string
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  recommendationId: string

  supplierId: string
  supplierName: string

  lines: POLine[]
  grandTotal: number

  status: POStatus

  createdBy: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string

  notes?: string
  period: SupplyPeriod
}

// ─── 8. Dashboard ─────────────────────────────────────────────────────────

export type RegionHealthStatus = 'stable' | 'needs_balancing' | 'shortage'

export interface RegionHealthSummary {
  region: RegionId
  totalRmRequested: number
  totalScmOverride: number | null
  internalSupply: number
  remaining: number
  status: RegionHealthStatus
}

export interface NetworkActionItem {
  id: string
  type: 'rebalancing' | 'central_allocation' | 'procurement' | 'transfer'
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  badgeText: string
  targetUrl: string
  timestamp: string
}

export interface ScmDashboardSummary {
  networkShortageTotal: number
  regionalShortageTotal: number
  centralAvailableTotal: number
  openProcurementCount: number
  activeTransferCount: number

  regionHealth: RegionHealthSummary[]
  actionItems: NetworkActionItem[]

  recentTransfers: RegionalTransfer[]
  topRequirements: RegionalRequirement[]

  lastUpdated: string
}
