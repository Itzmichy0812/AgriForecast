/**
 * SCM Service — in-memory mock state for the SCM Workspace.
 * Follows the same pattern as dealerService.ts.
 *
 * All mutations operate on in-memory stores (initialized from mock data).
 * History is append-only — existing events are never modified.
 */

import type {
  RegionalRequirement,
  RegionalTransfer,
  TransferHistoryEvent,
  TransferStatus,
  CentralInventoryItem,
  CentralAllocationLine,
  Supplier,
  PurchaseRecommendation,
  PurchaseRecommendationStatus,
  PurchaseOrder,
  POLine,
  ScmDashboardSummary,
  RegionHealthSummary,
  RegionHealthStatus,
  NetworkActionItem,
  SupplyPeriod,
} from '@/types/scm'
import { REGION_LABELS } from '@/types/scm'
import { INITIAL_REGIONAL_REQUIREMENTS } from '@/mocks/scm/regionalRequirements'
import { INITIAL_TRANSFERS } from '@/mocks/scm/transfers'
import { CENTRAL_INVENTORY } from '@/mocks/scm/centralInventory'
import { INITIAL_CENTRAL_ALLOCATIONS } from '@/mocks/scm/centralAllocations'
import { SUPPLIERS } from '@/mocks/scm/suppliers'
import { INITIAL_PURCHASE_RECOMMENDATIONS } from '@/mocks/scm/purchaseRecommendations'
import { INITIAL_PURCHASE_ORDERS } from '@/mocks/scm/purchaseOrders'

// ─── In-memory stores ───────────────────────────────────────────────────────

let requirementsStore: RegionalRequirement[] = structuredClone(INITIAL_REGIONAL_REQUIREMENTS)
let transfersStore: RegionalTransfer[] = structuredClone(INITIAL_TRANSFERS)
const centralInventoryStore: CentralInventoryItem[] = structuredClone(CENTRAL_INVENTORY)
let centralAllocationsStore: CentralAllocationLine[] = structuredClone(INITIAL_CENTRAL_ALLOCATIONS)
const suppliersStore: Supplier[] = structuredClone(SUPPLIERS)
let purchaseRecommendationsStore: PurchaseRecommendation[] = structuredClone(INITIAL_PURCHASE_RECOMMENDATIONS)
let purchaseOrdersStore: PurchaseOrder[] = structuredClone(INITIAL_PURCHASE_ORDERS)

// ─── Helpers ────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString()
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}`
}

// ─── Regional Requirements ──────────────────────────────────────────────────

export const scmService = {
  // ── Requirements ────────────────────────────────────────────────────────

  getRequirements(opts?: {
    region?: string
    sku?: string
    period?: SupplyPeriod
    hasShortage?: boolean
  }): RegionalRequirement[] {
    let items = [...requirementsStore]
    if (opts?.region && opts.region !== 'all') {
      items = items.filter((r) => r.region === opts.region)
    }
    if (opts?.sku) {
      const q = opts.sku.toLowerCase()
      items = items.filter(
        (r) => r.sku.toLowerCase().includes(q) || r.skuName.toLowerCase().includes(q),
      )
    }
    if (opts?.period) {
      items = items.filter((r) => r.period === opts.period)
    }
    if (opts?.hasShortage) {
      items = items.filter((r) => r.stillUnmet > 0)
    }
    return items
  },

  getRequirementById(id: string): RegionalRequirement | undefined {
    return requirementsStore.find((r) => r.id === id)
  },

  /**
   * SCM override of RM requested quantity.
   * RM requested is immutable. Only scmOverride + reason are written.
   *
   * Approved validation rule:
   *   - If scmOverride === rmRequested: reason may be empty.
   *   - If scmOverride !== rmRequested: reason is REQUIRED.
   */
  overrideRequirement(input: {
    id: string
    scmOverride: number
    reason?: string
  }): RegionalRequirement {
    const idx = requirementsStore.findIndex((r) => r.id === input.id)
    if (idx === -1) throw new Error(`Requirement ${input.id} not found`)

    const req = requirementsStore[idx]
    if (typeof input.scmOverride !== 'number' || Number.isNaN(input.scmOverride) || input.scmOverride < 0) {
      throw new Error('Số lượng điều chỉnh không hợp lệ')
    }

    const trimmedReason = input.reason?.trim() ?? ''
    if (input.scmOverride !== req.rmRequested && !trimmedReason) {
      throw new Error('Bắt buộc nhập lý do khi SCM điều chỉnh khác số lượng RM yêu cầu')
    }

    const effectiveRemaining = Math.max(0, input.scmOverride - req.regionalAvailable)
    const updated: RegionalRequirement = {
      ...req,
      scmOverride: input.scmOverride,
      scmOverrideReason: trimmedReason || undefined,
      remainingNeed: effectiveRemaining,
      stillUnmet: Math.max(
        0,
        effectiveRemaining - req.rebalancingAllocated - req.centralAllocated - req.procurementOrdered,
      ),
      updatedAt: now(),
    }
    requirementsStore[idx] = updated
    return updated
  },

  // ── Transfers ────────────────────────────────────────────────────────────

  getTransfers(opts?: {
    status?: TransferStatus | 'all'
    region?: string
  }): RegionalTransfer[] {
    let items = [...transfersStore]
    if (opts?.status && opts.status !== 'all') {
      items = items.filter((t) => t.status === opts.status)
    }
    if (opts?.region && opts.region !== 'all') {
      items = items.filter(
        (t) => t.sourceRegion === opts.region || t.destinationRegion === opts.region,
      )
    }
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  getTransferById(id: string): RegionalTransfer | undefined {
    return transfersStore.find((t) => t.id === id)
  },

  /**
   * Create a new cross-region transfer proposal (status: draft → waiting_source_rm)
   */
  createTransfer(input: {
    sku: string
    skuName: string
    unit: string
    sourceRegion: string
    destinationRegion: string
    sourceSurplus: number
    destinationNeed: number
    proposedQty: number
    transferDate: string
    eta: string
    requirementId: string
    period: SupplyPeriod
    proposedByScm: string
  }): RegionalTransfer {
    const id = generateId('TF')
    const transfer: RegionalTransfer = {
      id,
      sku: input.sku,
      skuName: input.skuName,
      unit: input.unit,
      sourceRegion: input.sourceRegion as RegionalTransfer['sourceRegion'],
      destinationRegion: input.destinationRegion as RegionalTransfer['destinationRegion'],
      sourceSurplus: input.sourceSurplus,
      destinationNeed: input.destinationNeed,
      proposedQty: input.proposedQty,
      confirmedQty: null,
      transferDate: input.transferDate,
      eta: input.eta,
      status: 'waiting_source_rm',
      proposedByScm: input.proposedByScm,
      requirementId: input.requirementId,
      period: input.period,
      createdAt: now(),
      updatedAt: now(),
      history: [
        {
          id: generateId('tfh'),
          eventType: 'created',
          title: 'SCM tạo đề xuất điều chuyển',
          timestamp: now(),
          actor: input.proposedByScm,
          note: `Đề xuất điều chuyển ${input.proposedQty} ${input.unit} ${input.skuName} từ ${REGION_LABELS[input.sourceRegion as keyof typeof REGION_LABELS]} sang ${REGION_LABELS[input.destinationRegion as keyof typeof REGION_LABELS]}.`,
        },
      ],
    }
    transfersStore = [transfer, ...transfersStore]
    return transfer
  },

  /**
   * Simulate RM confirmation (source or destination).
   * Appends to history, advances status.
   */
  confirmTransfer(input: {
    id: string
    role: 'source_rm' | 'dest_rm'
    comment?: string
  }): RegionalTransfer {
    const idx = transfersStore.findIndex((t) => t.id === input.id)
    if (idx === -1) throw new Error(`Transfer ${input.id} not found`)

    const t = transfersStore[idx]
    let newStatus: TransferStatus = t.status
    let eventType: TransferHistoryEvent['eventType'] = 'note'
    let title = ''
    let actor = ''

    if (input.role === 'source_rm') {
      newStatus = 'waiting_dest_rm'
      eventType = 'source_confirmed'
      title = `RM ${REGION_LABELS[t.sourceRegion]} xác nhận nguồn`
      actor = `RM ${REGION_LABELS[t.sourceRegion]} (mô phỏng)`
    } else {
      newStatus = 'ready'
      eventType = 'dest_confirmed'
      title = `RM ${REGION_LABELS[t.destinationRegion]} xác nhận tiếp nhận`
      actor = `RM ${REGION_LABELS[t.destinationRegion]} (mô phỏng)`
    }

    const histEvent: TransferHistoryEvent = {
      id: generateId('tfh'),
      eventType,
      title,
      timestamp: now(),
      actor,
      note: input.comment,
    }

    const readyEvent: TransferHistoryEvent | null =
      newStatus === 'ready'
        ? {
            id: generateId('tfh'),
            eventType: 'ready',
            title: 'Sẵn sàng vận chuyển',
            timestamp: now(),
            actor: 'Hệ thống',
            note: 'Cả hai RM đã xác nhận. Lô hàng sẵn sàng vận chuyển.',
          }
        : null

    const updated: RegionalTransfer = {
      ...t,
      status: newStatus,
      confirmedQty: newStatus === 'ready' ? t.proposedQty : t.confirmedQty,
      sourceRmComment: input.role === 'source_rm' ? input.comment : t.sourceRmComment,
      destRmComment: input.role === 'dest_rm' ? input.comment : t.destRmComment,
      updatedAt: now(),
      history: [...t.history, histEvent, ...(readyEvent ? [readyEvent] : [])],
    }
    transfersStore[idx] = updated
    return updated
  },

  /**
   * Request revision on a transfer (from either RM)
   */
  requestTransferRevision(input: {
    id: string
    requestedByRole: 'source_rm' | 'dest_rm'
    comment: string
    proposedAlternativeQty?: number
  }): RegionalTransfer {
    const idx = transfersStore.findIndex((t) => t.id === input.id)
    if (idx === -1) throw new Error(`Transfer ${input.id} not found`)

    const t = transfersStore[idx]
    const actor =
      input.requestedByRole === 'source_rm'
        ? `RM ${REGION_LABELS[t.sourceRegion]} (mô phỏng)`
        : `RM ${REGION_LABELS[t.destinationRegion]} (mô phỏng)`

    const histEvent: TransferHistoryEvent = {
      id: generateId('tfh'),
      eventType: 'revision',
      title: 'Yêu cầu điều chỉnh',
      timestamp: now(),
      actor,
      note: input.comment + (input.proposedAlternativeQty ? ` Đề xuất số lượng mới: ${input.proposedAlternativeQty} ${t.unit}.` : ''),
    }

    const updated: RegionalTransfer = {
      ...t,
      status: 'revision_requested',
      updatedAt: now(),
      history: [...t.history, histEvent],
    }
    transfersStore[idx] = updated
    return updated
  },

  // ── Central Inventory ────────────────────────────────────────────────────

  getCentralInventory(): CentralInventoryItem[] {
    return [...centralInventoryStore]
  },

  // ── Central Allocations ──────────────────────────────────────────────────

  getCentralAllocations(opts?: {
    region?: string
    period?: SupplyPeriod
  }): CentralAllocationLine[] {
    let items = [...centralAllocationsStore]
    if (opts?.region && opts.region !== 'all') {
      items = items.filter((a) => a.region === opts.region)
    }
    if (opts?.period) {
      items = items.filter((a) => a.period === opts.period)
    }
    return items
  },

  /**
   * SCM finalizes allocation quantity from Central Warehouse.
   * Cannot allocate above centralAvailable.
   */
  finalizeAllocation(input: {
    id: string
    scmFinalAllocation: number
    reason?: string
  }): CentralAllocationLine {
    const idx = centralAllocationsStore.findIndex((a) => a.id === input.id)
    if (idx === -1) throw new Error(`Allocation ${input.id} not found`)

    const line = centralAllocationsStore[idx]
    if (input.scmFinalAllocation > line.centralAvailable) {
      throw new Error('Không thể phân bổ vượt tồn kho kho trung tâm')
    }

    const updated: CentralAllocationLine = {
      ...line,
      scmFinalAllocation: input.scmFinalAllocation,
      scmAllocationReason: input.reason?.trim(),
      remainingAfterCentral: line.remainingAfterRebalancing - input.scmFinalAllocation,
      updatedAt: now(),
    }
    centralAllocationsStore[idx] = updated

    // Sync back to requirementsStore
    const reqIdx = requirementsStore.findIndex((r) => r.id === line.requirementId)
    if (reqIdx !== -1) {
      requirementsStore[reqIdx] = {
        ...requirementsStore[reqIdx],
        centralAllocated: input.scmFinalAllocation,
        stillUnmet: Math.max(
          0,
          requirementsStore[reqIdx].remainingNeed -
            requirementsStore[reqIdx].rebalancingAllocated -
            input.scmFinalAllocation -
            requirementsStore[reqIdx].procurementOrdered,
        ),
        updatedAt: now(),
      }
    }

    return updated
  },

  // ── Suppliers ────────────────────────────────────────────────────────────

  getSuppliers(opts?: { category?: string }): Supplier[] {
    if (opts?.category) {
      return suppliersStore.filter((s) => s.categories.includes(opts.category!))
    }
    return [...suppliersStore]
  },

  getSupplierById(id: string): Supplier | undefined {
    return suppliersStore.find((s) => s.id === id)
  },

  // ── Purchase Recommendations ─────────────────────────────────────────────

  getPurchaseRecommendations(opts?: {
    status?: PurchaseRecommendationStatus | 'all'
    period?: SupplyPeriod
  }): PurchaseRecommendation[] {
    let items = [...purchaseRecommendationsStore]
    if (opts?.status && opts.status !== 'all') {
      items = items.filter((r) => r.status === opts.status)
    }
    if (opts?.period) {
      items = items.filter((r) => r.period === opts.period)
    }
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  getPurchaseRecommendationById(id: string): PurchaseRecommendation | undefined {
    return purchaseRecommendationsStore.find((r) => r.id === id)
  },

  /**
   * SCM accepts a recommendation, optionally overriding the recommended quantity.
   */
  acceptRecommendation(input: {
    id: string
    scmQty: number
    reason?: string
    selectedSupplierId: string
  }): PurchaseRecommendation {
    const idx = purchaseRecommendationsStore.findIndex((r) => r.id === input.id)
    if (idx === -1) throw new Error(`Recommendation ${input.id} not found`)

    const rec = purchaseRecommendationsStore[idx]
    const updated: PurchaseRecommendation = {
      ...rec,
      status: 'accepted',
      scmQty: input.scmQty,
      scmQtyReason: input.reason?.trim(),
      selectedSupplierId: input.selectedSupplierId,
      updatedAt: now(),
    }
    purchaseRecommendationsStore[idx] = updated
    return updated
  },

  dismissRecommendation(id: string): PurchaseRecommendation {
    const idx = purchaseRecommendationsStore.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error(`Recommendation ${id} not found`)
    const updated: PurchaseRecommendation = {
      ...purchaseRecommendationsStore[idx],
      status: 'dismissed',
      updatedAt: now(),
    }
    purchaseRecommendationsStore[idx] = updated
    return updated
  },

  // ── Purchase Orders ──────────────────────────────────────────────────────

  getPurchaseOrders(opts?: {
    status?: string
    period?: SupplyPeriod
  }): PurchaseOrder[] {
    let items = [...purchaseOrdersStore]
    if (opts?.status && opts.status !== 'all') {
      items = items.filter((p) => p.status === opts.status)
    }
    if (opts?.period) {
      items = items.filter((p) => p.period === opts.period)
    }
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  getPurchaseOrderById(id: string): PurchaseOrder | undefined {
    return purchaseOrdersStore.find((p) => p.id === id)
  },

  /**
   * Create a new PO (status: draft) from an accepted recommendation.
   */
  createPurchaseOrder(input: {
    recommendationId: string
    supplierId: string
    supplierName: string
    lines: Omit<POLine, 'id'>[]
    notes?: string
    createdBy: string
    period: SupplyPeriod
  }): PurchaseOrder {
    const id = generateId('PO')
    const poNumber = `PO-2026-${new Date().getMonth() + 1}${String(new Date().getDate()).padStart(2, '0')}-${purchaseOrdersStore.length + 2}`
    const grandTotal = input.lines.reduce((s, l) => s + l.totalPrice, 0)

    const po: PurchaseOrder = {
      id,
      poNumber,
      recommendationId: input.recommendationId,
      supplierId: input.supplierId,
      supplierName: input.supplierName,
      lines: input.lines.map((l, i) => ({ ...l, id: `${id}-line-${i + 1}` })),
      grandTotal,
      status: 'draft',
      createdBy: input.createdBy,
      createdAt: now(),
      notes: input.notes,
      period: input.period,
    }

    purchaseOrdersStore = [po, ...purchaseOrdersStore]

    // Mark recommendation as po_created
    const recIdx = purchaseRecommendationsStore.findIndex(
      (r) => r.id === input.recommendationId,
    )
    if (recIdx !== -1) {
      purchaseRecommendationsStore[recIdx] = {
        ...purchaseRecommendationsStore[recIdx],
        status: 'po_created',
        updatedAt: now(),
      }
    }

    return po
  },

  /**
   * Approve a draft PO.
   */
  approvePurchaseOrder(input: { id: string; approvedBy: string }): PurchaseOrder {
    const idx = purchaseOrdersStore.findIndex((p) => p.id === input.id)
    if (idx === -1) throw new Error(`PO ${input.id} not found`)

    const updated: PurchaseOrder = {
      ...purchaseOrdersStore[idx],
      status: 'approved',
      approvedBy: input.approvedBy,
      approvedAt: now(),
    }
    purchaseOrdersStore[idx] = updated

    // Sync requirement procurementOrdered
    const rec = purchaseRecommendationsStore.find(
      (r) => r.id === updated.recommendationId,
    )
    if (rec) {
      const qty = updated.lines.reduce((s, l) => s + l.quantity, 0)
      const reqIdx = requirementsStore.findIndex((r) => r.id === rec.requirementId)
      if (reqIdx !== -1) {
        requirementsStore[reqIdx] = {
          ...requirementsStore[reqIdx],
          procurementOrdered: qty,
          stillUnmet: Math.max(
            0,
            requirementsStore[reqIdx].remainingNeed -
              requirementsStore[reqIdx].rebalancingAllocated -
              requirementsStore[reqIdx].centralAllocated -
              qty,
          ),
          updatedAt: now(),
        }
      }
    }

    return updated
  },

  // ── Dashboard ────────────────────────────────────────────────────────────

  getDashboardSummary(): ScmDashboardSummary {
    const requirements = [...requirementsStore]
    const transfers = [...transfersStore]
    const allocations = [...centralAllocationsStore]
    const recommendations = [...purchaseRecommendationsStore]
    const pos = [...purchaseOrdersStore]
    const inventory = [...centralInventoryStore]

    const networkShortageTotal = requirements.reduce((s, r) => s + r.stillUnmet, 0)
    const regionalShortageTotal = requirements.reduce((s, r) => s + r.remainingNeed, 0)
    const centralAvailableTotal = inventory.reduce((s, i) => s + i.available, 0)
    const openProcurementCount = pos.filter((p) => p.status === 'draft').length
    const activeTransferCount = transfers.filter(
      (t) => t.status !== 'completed' && t.status !== 'draft',
    ).length

    // Region health
    const regionIds = [...new Set(requirements.map((r) => r.region))]
    const regionHealth: RegionHealthSummary[] = regionIds.map((region) => {
      const regionReqs = requirements.filter((r) => r.region === region)
      const totalRmRequested = regionReqs.reduce((s, r) => s + r.rmRequested, 0)
      const totalScmOverride = regionReqs.some((r) => r.scmOverride !== null)
        ? regionReqs.reduce((s, r) => s + (r.scmOverride ?? r.rmRequested), 0)
        : null
      const internalSupply = regionReqs.reduce(
        (s, r) => s + r.regionalAvailable + r.rebalancingAllocated,
        0,
      )
      const remaining = regionReqs.reduce((s, r) => s + r.stillUnmet, 0)

      let status: RegionHealthStatus
      if (remaining > 0) status = 'shortage'
      else if (regionReqs.some((r) => r.priority === 'critical')) status = 'needs_balancing'
      else status = 'stable'

      return { region, totalRmRequested, totalScmOverride, internalSupply, remaining, status }
    })

    // Action items
    const actionItems: NetworkActionItem[] = []

    // Critical waiting transfers
    transfers
      .filter((t) => t.status === 'waiting_source_rm' || t.status === 'waiting_dest_rm')
      .forEach((t) => {
        const step = t.status === 'waiting_source_rm' ? 'Chờ RM nguồn' : 'Chờ RM đích'
        actionItems.push({
          id: `ai-tf-${t.id}`,
          type: 'rebalancing',
          title: `${step}: ${t.skuName}`,
          description: `${REGION_LABELS[t.sourceRegion]} → ${REGION_LABELS[t.destinationRegion]} · ${t.proposedQty} ${t.unit}`,
          severity: 'warning',
          badgeText: step,
          targetUrl: `/scm/rebalancing?selected=${t.id}`,
          timestamp: t.updatedAt,
        })
      })

    // Pending allocations
    allocations
      .filter((a) => a.scmFinalAllocation === null)
      .forEach((a) => {
        actionItems.push({
          id: `ai-ca-${a.id}`,
          type: 'central_allocation',
          title: `Chưa phân bổ trung tâm: ${a.skuName}`,
          description: `${REGION_LABELS[a.region]} · còn ${a.remainingAfterRebalancing} ${a.unit} cần phân bổ`,
          severity: a.priority === 'critical' ? 'critical' : 'warning',
          badgeText: 'Cần phân bổ',
          targetUrl: `/scm/central-allocation?selected=${a.id}`,
          timestamp: a.updatedAt,
        })
      })

    // Pending recommendations
    recommendations
      .filter((r) => r.status === 'pending')
      .forEach((r) => {
        actionItems.push({
          id: `ai-pr-${r.id}`,
          type: 'procurement',
          title: `Đề xuất mua hàng chờ duyệt: ${r.skuName}`,
          description: `${REGION_LABELS[r.region]} · ${r.recommendedQty} ${r.unit} · Cần trước ${r.needByDate}`,
          severity: r.priority === 'critical' ? 'critical' : 'info',
          badgeText: 'Chờ SCM duyệt',
          targetUrl: `/scm/procurement?selected=${r.id}`,
          timestamp: r.updatedAt,
        })
      })

    // Sort action items: critical first
    actionItems.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 }
      return order[a.severity] - order[b.severity]
    })

    const recentTransfers = transfers
      .filter((t) => t.status !== 'completed')
      .slice(0, 3)

    const topRequirements = requirements
      .filter((r) => r.priority === 'critical' || r.stillUnmet > 0)
      .slice(0, 5)

    return {
      networkShortageTotal,
      regionalShortageTotal,
      centralAvailableTotal,
      openProcurementCount,
      activeTransferCount,
      regionHealth,
      actionItems,
      recentTransfers,
      topRequirements,
      lastUpdated: now(),
    }
  },
}
