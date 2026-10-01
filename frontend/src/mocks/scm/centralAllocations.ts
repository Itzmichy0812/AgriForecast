import type { CentralAllocationLine } from '@/types/scm'

/**
 * Central Allocation lines — quantities after cross-region rebalancing.
 *
 * remainingAfterRebalancing = remainingNeed - rebalancingAllocated
 * suggestedAllocation = min(remainingAfterRebalancing, centralAvailable)
 * scmFinalAllocation = actual SCM decision
 * remainingAfterCentral = remainingAfterRebalancing - scmFinalAllocation
 *
 * Reconciliation:
 *   URE MDL:   130-70=60 remain → central 40 → 20 to procurement ✓
 *   NPK MDL:   100-60=40 remain → central 30 → 10 to procurement ✓
 *   FILIA MDL: 80-50=30 remain  → central 20 → 10 to procurement ✓
 *   FILIA SE:  100-50=50 remain → central 40 → 10 to procurement ✓
 *   KALI CH:   70-40=30 remain  → central 20 → 10 to procurement ✓
 *   DAP SE:    80-0=80 remain   → central 70 → 10 to procurement ✓
 */
export const INITIAL_CENTRAL_ALLOCATIONS: CentralAllocationLine[] = [
  {
    id: 'CA-MDL-URE-001',
    requirementId: 'REQ-SCM-MDL-URE-001',
    region: 'MEKONG_DELTA',
    sku: 'PB-URE-01',
    skuName: 'Phân bón Ure Hạt Trong Cà Mau',
    unit: 'Tấn',

    remainingAfterRebalancing: 60,
    centralAvailable: 80,
    suggestedAllocation: 60,
    scmFinalAllocation: 40,
    scmAllocationReason: 'Dự trữ 20 tấn tại kho trung tâm cho nhu cầu khẩn cấp tháng 10 chưa phát sinh. Phần còn lại chuyển sang kế hoạch mua ngoài.',

    remainingAfterCentral: 20,

    period: '2026-10',
    needByDate: '2026-10-08',
    priority: 'critical',
    updatedAt: '2026-10-01T14:30:00Z',
  },
  {
    id: 'CA-MDL-NPK-002',
    requirementId: 'REQ-SCM-MDL-NPK-002',
    region: 'MEKONG_DELTA',
    sku: 'PB-NPK-02',
    skuName: 'Phân bón NPK Đầu Trâu 16-16-8+TE',
    unit: 'Tấn',

    remainingAfterRebalancing: 40,
    centralAvailable: 70,
    suggestedAllocation: 40,
    scmFinalAllocation: 30,
    scmAllocationReason: 'Giữ lại 10 tấn NPK tại kho trung tâm cho phát sinh ngoài kế hoạch Đông Nam Bộ.',

    remainingAfterCentral: 10,

    period: '2026-10',
    needByDate: '2026-10-10',
    priority: 'high',
    updatedAt: '2026-10-01T15:00:00Z',
  },
  {
    id: 'CA-MDL-FILIA-003',
    requirementId: 'REQ-SCM-MDL-FILIA-003',
    region: 'MEKONG_DELTA',
    sku: 'BVTV-FILIA-05',
    skuName: 'Thuốc trừ bệnh Filia 525SE',
    unit: 'Lít',

    remainingAfterRebalancing: 30,
    centralAvailable: 200,
    suggestedAllocation: 30,
    scmFinalAllocation: 20,
    scmAllocationReason: 'Nhu cầu ĐBSCL sau kiểm kê điều chỉnh còn 80 lít. Sau điều chuyển 50 lít còn 30 lít: cấp 20 lít từ kho trung tâm, giữ 10 lít dự phòng và chuyển 10 lít sang mua ngoài lô chung ĐNB.',

    remainingAfterCentral: 10,

    period: '2026-10',
    needByDate: '2026-10-07',
    priority: 'critical',
    updatedAt: '2026-10-01T16:00:00Z',
  },
  {
    id: 'CA-SE-FILIA-004',
    requirementId: 'REQ-SCM-SE-FILIA-004',
    region: 'SOUTHEAST',
    sku: 'BVTV-FILIA-05',
    skuName: 'Thuốc trừ bệnh Filia 525SE',
    unit: 'Lít',

    remainingAfterRebalancing: 50,
    centralAvailable: 180,   // 200 - 20 already allocated above
    suggestedAllocation: 50,
    scmFinalAllocation: 40,
    scmAllocationReason: 'Cấp 40 lít từ kho trung tâm. 10 lít còn lại đặt mua chung lô với ĐBSCL (MOQ 100 lít).',

    remainingAfterCentral: 10,

    period: '2026-10',
    needByDate: '2026-10-09',
    priority: 'high',
    updatedAt: '2026-10-01T16:00:00Z',
  },
  {
    id: 'CA-SE-DAP-005',
    requirementId: 'REQ-SCM-SE-DAP-005',
    region: 'SOUTHEAST',
    sku: 'PB-DAP-03',
    skuName: 'Phân bón DAP Đình Vũ 18-46',
    unit: 'Tấn',

    remainingAfterRebalancing: 80,
    centralAvailable: 100,
    suggestedAllocation: 80,
    scmFinalAllocation: 70,
    scmAllocationReason: 'Cấp 70 tấn từ kho trung tâm. Giữ lại 10 tấn cho yêu cầu ưu tiên cao hơn trong cùng kỳ.',

    remainingAfterCentral: 10,

    period: '2026-10',
    needByDate: '2026-10-15',
    priority: 'normal',
    updatedAt: '2026-10-01T13:00:00Z',
  },
  {
    id: 'CA-CH-KALI-006',
    requirementId: 'REQ-SCM-CH-KALI-006',
    region: 'CENTRAL_HIGHLANDS',
    sku: 'PB-KALI-04',
    skuName: 'Phân Kali Clorua Bột (Israel)',
    unit: 'Tấn',

    remainingAfterRebalancing: 30,
    centralAvailable: 35,
    suggestedAllocation: 30,
    scmFinalAllocation: 20,
    scmAllocationReason: 'Kho trung tâm tồn Kali thấp (35 tấn). Cấp 20 tấn, giữ 15 tấn dự phòng. Phần còn lại đặt nhập khẩu ICL.',

    remainingAfterCentral: 10,

    period: '2026-10',
    needByDate: '2026-10-12',
    priority: 'high',
    updatedAt: '2026-10-01T13:30:00Z',
  },
]
