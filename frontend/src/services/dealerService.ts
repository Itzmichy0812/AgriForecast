import type {
  AdjustForecastInput,
  CreateManualRequestInput,
  DealerForecast,
  DealerInventoryItem,
  ManualRequest,
  PriorityActionItem,
} from '@/types/dealer'
import { INITIAL_DEALER_FORECASTS } from '@/mocks/dealer/forecasts'
import { INITIAL_DEALER_INVENTORY } from '@/mocks/dealer/inventory'
import {
  CURRENT_DEALER_ID,
  CURRENT_DEALER_NAME,
  INITIAL_MANUAL_REQUESTS,
} from '@/mocks/dealer/requests'

// In-memory state holding prototype data
let forecastsStore: DealerForecast[] = JSON.parse(JSON.stringify(INITIAL_DEALER_FORECASTS))
let inventoryStore: DealerInventoryItem[] = JSON.parse(JSON.stringify(INITIAL_DEALER_INVENTORY))
let requestsStore: ManualRequest[] = JSON.parse(JSON.stringify(INITIAL_MANUAL_REQUESTS))

let requestCounter = 6

export const dealerService = {
  // ==========================================
  // FORECASTS
  // ==========================================

  async getForecasts(params?: {
    search?: string
    status?: string
    productGroup?: string
    periodKey?: string
  }): Promise<DealerForecast[]> {
    let list = [...forecastsStore]

    if (params?.search) {
      const q = params.search.toLowerCase().trim()
      list = list.filter(
        (item) =>
          item.sku.toLowerCase().includes(q) ||
          item.skuName.toLowerCase().includes(q)
      )
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter((item) => item.status === params.status)
    }

    if (params?.productGroup && params.productGroup !== 'all') {
      list = list.filter((item) => item.productGroup === params.productGroup)
    }

    if (params?.periodKey && params.periodKey !== 'all') {
      list = list.filter((item) => item.periodKey === params.periodKey)
    }

    return list
  },

  async getForecastById(id: string): Promise<DealerForecast | undefined> {
    return forecastsStore.find((item) => item.id === id)
  },

  async adjustForecast(input: AdjustForecastInput): Promise<DealerForecast> {
    const index = forecastsStore.findIndex((item) => item.id === input.forecastId)
    if (index === -1) {
      throw new Error(`Forecast with id ${input.forecastId} not found`)
    }

    const current = forecastsStore[index]
    const updated: DealerForecast = {
      ...current,
      dealerAdjusted: input.proposedQty,
      finalPlanning: input.proposedQty, // Rule: If adjusted, final = dealer adjusted
      adjustmentReason: input.reason.trim(),
      status: 'adjusted',
      lastUpdated: new Date().toISOString(),
      notes: current.notes
        ? `${current.notes} (Đã cập nhật điều chỉnh)`
        : 'Đại lý đã cập nhật điều chỉnh số lượng.',
    }

    forecastsStore = [
      ...forecastsStore.slice(0, index),
      updated,
      ...forecastsStore.slice(index + 1),
    ]

    return updated
  },

  async revertForecast(forecastId: string): Promise<DealerForecast> {
    const index = forecastsStore.findIndex((item) => item.id === forecastId)
    if (index === -1) {
      throw new Error(`Forecast with id ${forecastId} not found`)
    }

    const current = forecastsStore[index]
    const updated: DealerForecast = {
      ...current,
      dealerAdjusted: null,
      finalPlanning: current.systemForecast, // Rule: If reverted, final = system forecast
      adjustmentReason: undefined,
      status: 'confirmed',
      lastUpdated: new Date().toISOString(),
    }

    forecastsStore = [
      ...forecastsStore.slice(0, index),
      updated,
      ...forecastsStore.slice(index + 1),
    ]

    return updated
  },

  // ==========================================
  // INVENTORY
  // ==========================================

  async getInventory(params?: {
    search?: string
    status?: string
  }): Promise<DealerInventoryItem[]> {
    let list = [...inventoryStore]

    if (params?.search) {
      const q = params.search.toLowerCase().trim()
      list = list.filter(
        (item) =>
          item.sku.toLowerCase().includes(q) ||
          item.skuName.toLowerCase().includes(q)
      )
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter((item) => item.status === params.status)
    }

    return list
  },

  async getInventoryBySku(sku: string): Promise<DealerInventoryItem | undefined> {
    return inventoryStore.find((item) => item.sku === sku)
  },

  // ==========================================
  // MANUAL REQUESTS
  // ==========================================

  async getRequests(params?: {
    search?: string
    urgency?: string
    fulfillment?: string
  }): Promise<ManualRequest[]> {
    let list = [...requestsStore]

    if (params?.search) {
      const q = params.search.toLowerCase().trim()
      list = list.filter(
        (item) =>
          item.id.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.skuName.toLowerCase().includes(q) ||
          item.reason.toLowerCase().includes(q)
      )
    }

    if (params?.urgency && params.urgency !== 'all') {
      list = list.filter((item) => item.urgency === params.urgency)
    }

    if (params?.fulfillment && params.fulfillment !== 'all') {
      list = list.filter((item) => item.fulfillmentState === params.fulfillment)
    }

    return list
  },

  async getRequestById(id: string): Promise<ManualRequest | undefined> {
    return requestsStore.find((item) => item.id === id)
  },

  async createRequest(input: CreateManualRequestInput): Promise<ManualRequest> {
    const targetInventory = inventoryStore.find((item) => item.sku === input.sku)
    const targetForecast = forecastsStore.find((item) => item.sku === input.sku)

    const skuName =
      targetInventory?.skuName ?? targetForecast?.skuName ?? input.sku
    const unit = targetInventory?.unit ?? targetForecast?.unit ?? 'Tấn'

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const id = `REQ-${dateStr}-${String(requestCounter++).padStart(3, '0')}`

    const newRequest: ManualRequest = {
      id,
      dealerId: CURRENT_DEALER_ID,
      dealerName: CURRENT_DEALER_NAME,
      sku: input.sku,
      skuName,
      unit,
      requestedQty: input.requestedQty,
      allocatedQty: 0,
      remainingQty: input.requestedQty, // Rule: Remaining = Requested - Allocated (0)
      urgency: input.urgency,
      needByDate: input.needByDate,
      reason: input.reason.trim(),
      requestState: 'sent',
      fulfillmentState: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: `hist-${Date.now()}`,
          eventType: 'sent',
          title: 'Đã gửi kho vùng',
          timestamp: new Date().toISOString(),
          actor: `${CURRENT_DEALER_NAME} (Quản lý kho)`,
          note: `Yêu cầu bổ sung gửi đến Regional Manager / Kho Vùng. Lý do: ${input.reason.trim()}`,
        },
      ],
    }

    requestsStore = [newRequest, ...requestsStore]
    return newRequest
  },

  // ==========================================
  // DASHBOARD SUMMARY & METRICS
  // ==========================================

  async getDashboardSummary() {
    const allForecasts = await dealerService.getForecasts()
    const allInventory = await dealerService.getInventory()
    const allRequests = await dealerService.getRequests()

    // 1. Forecast cần xem
    const needsReviewForecasts = allForecasts.filter(
      (f) => f.status === 'needs_review'
    )

    // 2. SKU tồn thấp (critical + caution)
    const lowStockItems = allInventory.filter(
      (item) => item.status === 'critical' || item.status === 'caution'
    )

    // 3. Chưa cấp đủ (pending + partial)
    const unfulfilledRequests = allRequests.filter(
      (r) => r.fulfillmentState === 'pending' || r.fulfillmentState === 'partial'
    )

    // 4. Hàng sắp về (items with incoming > 0)
    const incomingItems = allInventory.filter((item) => item.incoming > 0)
    const totalIncomingQty = incomingItems.reduce((acc, cur) => acc + cur.incoming, 0)

    // Top urgent alert
    const urgentAlertText = `${needsReviewForecasts.length} SKU cần xác nhận forecast trước kỳ kế hoạch tiếp theo`

    // Priority Action Items (3-5 items)
    const actionItems: PriorityActionItem[] = []

    // Add highest variance needs-review forecast
    const topForecast = [...needsReviewForecasts].sort(
      (a, b) => Math.abs(b.variance) - Math.abs(a.variance)
    )[0]
    if (topForecast) {
      actionItems.push({
        id: `action-fc-${topForecast.id}`,
        type: 'forecast',
        title: `Dự báo ${topForecast.skuName} biến động lớn (${topForecast.variance > 0 ? '+' : ''}${topForecast.variance}%)`,
        description: `Hệ thống gợi ý ${topForecast.systemForecast} ${topForecast.unit}. Cần đại lý xác nhận hoặc điều chỉnh theo nhu cầu vụ Đông Xuân.`,
        severity: 'warning',
        targetUrl: `/dealer/forecast/${topForecast.id}`,
        badgeText: 'Cần duyệt',
        timestamp: 'Hôm nay',
      })
    }

    // Add critical inventory shortage
    const criticalInventory = allInventory.find((item) => item.status === 'critical')
    if (criticalInventory) {
      actionItems.push({
        id: `action-inv-${criticalInventory.id}`,
        type: 'inventory',
        title: `Nguy cơ thiếu hụt: ${criticalInventory.skuName}`,
        description: `Tồn kho khả dụng chỉ còn ${criticalInventory.available} ${criticalInventory.unit} (đủ dùng trong ${criticalInventory.coverageDays} ngày). Dưới ngưỡng an toàn ROP.`,
        severity: 'critical',
        targetUrl: `/dealer/inventory?status=critical`,
        badgeText: 'Nguy cơ thiếu',
        timestamp: 'Khẩn cấp',
      })
    }

    // Add partially fulfilled request
    const partialRequest = allRequests.find((r) => r.fulfillmentState === 'partial')
    if (partialRequest) {
      actionItems.push({
        id: `action-req-${partialRequest.id}`,
        type: 'request',
        title: `Yêu cầu #${partialRequest.id} được cấp một phần`,
        description: `Đã cấp ${partialRequest.allocatedQty}/${partialRequest.requestedQty} ${partialRequest.unit} ${partialRequest.skuName}. Còn thiếu ${partialRequest.remainingQty} ${partialRequest.unit}.`,
        severity: 'warning',
        targetUrl: `/dealer/requests/${partialRequest.id}`,
        badgeText: 'Cấp một phần',
        timestamp: 'Đang theo dõi',
      })
    }

    // Inventory status counts
    const inventoryCounts = {
      normal: allInventory.filter((i) => i.status === 'normal').length,
      caution: allInventory.filter((i) => i.status === 'caution').length,
      critical: allInventory.filter((i) => i.status === 'critical').length,
    }

    return {
      dealerName: CURRENT_DEALER_NAME,
      location: 'Huyện Thoại Sơn, Tỉnh An Giang',
      lastUpdated: '09:15 SA, 01/10/2026',
      urgentAlertText,
      metrics: {
        forecastNeedsReviewCount: needsReviewForecasts.length,
        lowStockCount: lowStockItems.length,
        unfulfilledRequestsCount: unfulfilledRequests.length,
        incomingSkuCount: incomingItems.length,
        totalIncomingQty,
      },
      actionItems,
      inventoryCounts,
      upcomingForecasts: allForecasts.slice(0, 5),
      recentRequests: allRequests.slice(0, 5),
    }
  },
}