import type { PurchaseRecommendation } from '@/types/scm'

/**
 * Purchase recommendations — only for shortage AFTER:
 *   regional processing + cross-region rebalancing + central allocation
 *
 * Quantity reconciliation (matches regionalRequirements.ts):
 *   URE MDL:   remainingNeed=130 - rebalancing=70 - central=40 = 20 → PR=20 → MOQ=20 ✓
 *   NPK MDL:   remainingNeed=100 - rebalancing=60 - central=30 = 10 → PR=20 (MOQ=20 applies)
 *   FILIA MDL: remainingNeed=80(adj140) - rebalancing=50 - central=20 = 10 → PR=100 (MOQ=100 combined with SE)
 *   FILIA SE:  remainingNeed=100 - rebalancing=50 - central=40 = 10 → PR=50 (MOQ=50, combined with MDL)
 *   KALI CH:   remainingNeed=70 - rebalancing=40 - central=20 = 10 → PR=20 (MOQ=20)
 *   DAP SE:    remainingNeed=80 - rebalancing=0 - central=70 = 10 → PR=20 (MOQ=20)
 */
export const INITIAL_PURCHASE_RECOMMENDATIONS: PurchaseRecommendation[] = [
  {
    id: 'PR-20261001-001',
    requirementId: 'REQ-SCM-MDL-URE-001',
    region: 'MEKONG_DELTA',
    sku: 'PB-URE-01',
    skuName: 'Phân bón Ure Hạt Trong Cà Mau',
    productGroup: 'Phân bón vô cơ',
    unit: 'Tấn',

    remainingShortage: 20,
    needByDate: '2026-10-08',
    priority: 'critical',

    recommendedQty: 20,   // = remainingShortage (MOQ=20 exactly matches)
    moq: 20,
    leadTimeDays: 7,
    referenceUnitCost: 8_200_000,
    estimatedTotalCost: 164_000_000,

    reason: 'Sau điều chuyển 70 tấn từ ĐNB và cấp trung tâm 40 tấn, còn thiếu 20 tấn Ure cho ĐBSCL.',
    status: 'pending',
    scmQty: null,
    period: '2026-10',
    createdAt: '2026-10-01T14:00:00Z',
    updatedAt: '2026-10-01T14:00:00Z',
  },
  {
    id: 'PR-20261001-002',
    requirementId: 'REQ-SCM-MDL-NPK-002',
    region: 'MEKONG_DELTA',
    sku: 'PB-NPK-02',
    skuName: 'Phân bón NPK Đầu Trâu 16-16-8+TE',
    productGroup: 'Phân bón NPK',
    unit: 'Tấn',

    remainingShortage: 10,
    needByDate: '2026-10-10',
    priority: 'high',

    recommendedQty: 20,   // MOQ-adjusted from 10 → 20 (minimum order)
    moq: 20,
    leadTimeDays: 5,
    referenceUnitCost: 11_500_000,
    estimatedTotalCost: 230_000_000,

    reason: 'Sau điều chuyển 60 tấn từ Tây Nguyên và cấp trung tâm 30 tấn, còn thiếu 10 tấn. Đặt theo MOQ tối thiểu 20 tấn.',
    status: 'pending',
    scmQty: null,
    period: '2026-10',
    createdAt: '2026-10-01T15:00:00Z',
    updatedAt: '2026-10-01T15:00:00Z',
  },
  {
    id: 'PR-20261001-003',
    requirementId: 'REQ-SCM-MDL-FILIA-003',
    region: 'MEKONG_DELTA',
    sku: 'BVTV-FILIA-05',
    skuName: 'Thuốc trừ bệnh Filia 525SE',
    productGroup: 'Thuốc bảo vệ thực vật',
    unit: 'Lít',

    remainingShortage: 10,
    needByDate: '2026-10-07',
    priority: 'critical',

    recommendedQty: 100,  // MOQ=100L; combined with SE region order for efficiency
    moq: 100,
    leadTimeDays: 14,
    referenceUnitCost: 185_000,
    estimatedTotalCost: 18_500_000,

    reason: 'ĐBSCL còn thiếu 10 lít Filia sau điều chuyển 50 lít và cấp trung tâm 20 lít. Đặt chung với ĐNB để đủ MOQ 100 lít và tối ưu chi phí.',
    status: 'accepted',
    scmQty: 100,
    scmQtyReason: 'Kết hợp đơn hàng ĐBSCL và ĐNB thành 100 lít để đạt MOQ nhà cung cấp. Chia nhận hàng theo tỷ lệ sau khi giao.',
    selectedSupplierId: 'SUP-004',
    period: '2026-10',
    createdAt: '2026-10-01T16:00:00Z',
    updatedAt: '2026-10-01T17:00:00Z',
  },
  {
    id: 'PR-20261001-004',
    requirementId: 'REQ-SCM-CH-KALI-006',
    region: 'CENTRAL_HIGHLANDS',
    sku: 'PB-KALI-04',
    skuName: 'Phân Kali Clorua Bột (Israel)',
    productGroup: 'Phân bón vô cơ',
    unit: 'Tấn',

    remainingShortage: 10,
    needByDate: '2026-10-12',
    priority: 'high',

    recommendedQty: 20,   // MOQ-adjusted
    moq: 20,
    leadTimeDays: 21,     // imported, long lead time
    referenceUnitCost: 9_800_000,
    estimatedTotalCost: 196_000_000,

    reason: 'Sau điều chuyển 40 tấn từ Nam Trung Bộ và cấp trung tâm 20 tấn, còn thiếu 10 tấn Kali cho Tây Nguyên. Lead time 21 ngày — cần đặt ngay.',
    status: 'po_created',
    scmQty: 20,
    scmQtyReason: 'MOQ tối thiểu nhà cung cấp Israel là 20 tấn.',
    selectedSupplierId: 'SUP-003',
    period: '2026-10',
    createdAt: '2026-09-30T10:00:00Z',
    updatedAt: '2026-10-01T09:00:00Z',
  },
  {
    id: 'PR-20261001-005',
    requirementId: 'REQ-SCM-SE-DAP-005',
    region: 'SOUTHEAST',
    sku: 'PB-DAP-03',
    skuName: 'Phân bón DAP Đình Vũ 18-46',
    productGroup: 'Phân bón vô cơ',
    unit: 'Tấn',

    remainingShortage: 10,
    needByDate: '2026-10-15',
    priority: 'normal',

    recommendedQty: 20,
    moq: 20,
    leadTimeDays: 10,
    referenceUnitCost: 8_200_000,
    estimatedTotalCost: 164_000_000,

    reason: 'Kho vùng ĐNB không có tồn DAP. Central cấp 70 tấn, còn thiếu 10 tấn.',
    status: 'pending',
    scmQty: null,
    period: '2026-10',
    createdAt: '2026-10-01T13:00:00Z',
    updatedAt: '2026-10-01T13:00:00Z',
  },
  {
    id: 'PR-20261001-006',
    requirementId: 'REQ-SCM-SE-FILIA-004',
    region: 'SOUTHEAST',
    sku: 'BVTV-FILIA-05',
    skuName: 'Thuốc trừ bệnh Filia 525SE',
    productGroup: 'Thuốc bảo vệ thực vật',
    unit: 'Lít',

    remainingShortage: 10,
    needByDate: '2026-10-09',
    priority: 'high',

    recommendedQty: 50,
    moq: 50,
    leadTimeDays: 7,
    referenceUnitCost: 175_000,
    estimatedTotalCost: 8_750_000,

    reason: 'Sau điều chuyển 50 lít từ Bắc Trung Bộ và cấp trung tâm 40 lít, ĐNB còn thiếu 10 lít Filia. Đặt theo MOQ tối thiểu 50 lít.',
    status: 'pending',
    scmQty: null,
    period: '2026-10',
    createdAt: '2026-10-01T16:00:00Z',
    updatedAt: '2026-10-01T16:00:00Z',
  },
]
