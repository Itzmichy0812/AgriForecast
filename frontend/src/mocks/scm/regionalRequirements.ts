import type { RegionalRequirement } from '@/types/scm'

export const INITIAL_REGIONAL_REQUIREMENTS: RegionalRequirement[] = [
  // ────────────────────────────────────────────────
  // MEKONG_DELTA — Đồng bằng Sông Cửu Long
  // ────────────────────────────────────────────────
  {
    id: 'REQ-SCM-MDL-URE-001',
    region: 'MEKONG_DELTA',
    sku: 'PB-URE-01',
    skuName: 'Phân bón Ure Hạt Trong Cà Mau',
    unit: 'Tấn',
    productGroup: 'Phân bón vô cơ',
    period: '2026-10',

    dealerEffectiveDemand: 840,
    dealerManualRequests: 130,
    rmRequested: 200,
    scmOverride: null,
    scmOverrideReason: undefined,

    regionalAvailable: 70,
    remainingNeed: 130,

    needByDate: '2026-10-08',
    priority: 'critical',

    rebalancingAllocated: 70,
    centralAllocated: 40,
    procurementOrdered: 20,
    stillUnmet: 0,

    submittedAt: '2026-10-01T06:00:00Z',
    updatedAt: '2026-10-01T14:30:00Z',
  },
  {
    id: 'REQ-SCM-MDL-NPK-002',
    region: 'MEKONG_DELTA',
    sku: 'PB-NPK-02',
    skuName: 'Phân bón NPK Đầu Trâu 16-16-8+TE',
    unit: 'Tấn',
    productGroup: 'Phân bón NPK',
    period: '2026-10',

    dealerEffectiveDemand: 620,
    dealerManualRequests: 80,
    rmRequested: 180,
    scmOverride: null,

    regionalAvailable: 80,
    remainingNeed: 100,

    needByDate: '2026-10-10',
    priority: 'high',

    rebalancingAllocated: 60,
    centralAllocated: 30,
    procurementOrdered: 10,
    stillUnmet: 0,

    submittedAt: '2026-10-01T06:00:00Z',
    updatedAt: '2026-10-01T15:00:00Z',
  },
  {
    id: 'REQ-SCM-MDL-FILIA-003',
    region: 'MEKONG_DELTA',
    sku: 'BVTV-FILIA-05',
    skuName: 'Thuốc trừ bệnh Filia 525SE',
    unit: 'Lít',
    productGroup: 'Thuốc bảo vệ thực vật',
    period: '2026-10',

    dealerEffectiveDemand: 1200,
    dealerManualRequests: 200,
    rmRequested: 160,
    scmOverride: 140,
    scmOverrideReason: 'Kho Vùng ĐBSCL tồn thêm 20 lít phát sinh sau kiểm kê. Điều chỉnh xuống 140 lít.',

    regionalAvailable: 60,
    remainingNeed: 80,

    needByDate: '2026-10-07',
    priority: 'critical',

    rebalancingAllocated: 50,
    centralAllocated: 20,
    procurementOrdered: 10,
    stillUnmet: 0,

    submittedAt: '2026-10-01T06:00:00Z',
    updatedAt: '2026-10-01T16:00:00Z',
  },

  // ────────────────────────────────────────────────
  // SOUTHEAST — Đông Nam Bộ
  // ────────────────────────────────────────────────
  {
    id: 'REQ-SCM-SE-FILIA-004',
    region: 'SOUTHEAST',
    sku: 'BVTV-FILIA-05',
    skuName: 'Thuốc trừ bệnh Filia 525SE',
    unit: 'Lít',
    productGroup: 'Thuốc bảo vệ thực vật',
    period: '2026-10',

    dealerEffectiveDemand: 800,
    dealerManualRequests: 100,
    rmRequested: 150,
    scmOverride: null,

    regionalAvailable: 50,
    remainingNeed: 100,

    needByDate: '2026-10-09',
    priority: 'high',

    rebalancingAllocated: 50,
    centralAllocated: 40,
    procurementOrdered: 10,
    stillUnmet: 0,

    submittedAt: '2026-10-01T07:00:00Z',
    updatedAt: '2026-10-01T14:00:00Z',
  },
  {
    id: 'REQ-SCM-SE-DAP-005',
    region: 'SOUTHEAST',
    sku: 'PB-DAP-03',
    skuName: 'Phân bón DAP Đình Vũ 18-46',
    unit: 'Tấn',
    productGroup: 'Phân bón vô cơ',
    period: '2026-10',

    dealerEffectiveDemand: 310,
    dealerManualRequests: 40,
    rmRequested: 80,
    scmOverride: null,

    regionalAvailable: 0,
    remainingNeed: 80,

    needByDate: '2026-10-15',
    priority: 'normal',

    rebalancingAllocated: 0,
    centralAllocated: 70,
    procurementOrdered: 10,
    stillUnmet: 0,

    submittedAt: '2026-10-01T07:00:00Z',
    updatedAt: '2026-10-01T13:00:00Z',
  },

  // ────────────────────────────────────────────────
  // CENTRAL_HIGHLANDS — Tây Nguyên
  // ────────────────────────────────────────────────
  {
    id: 'REQ-SCM-CH-KALI-006',
    region: 'CENTRAL_HIGHLANDS',
    sku: 'PB-KALI-04',
    skuName: 'Phân Kali Clorua Bột (Israel)',
    unit: 'Tấn',
    productGroup: 'Phân bón vô cơ',
    period: '2026-10',

    dealerEffectiveDemand: 440,
    dealerManualRequests: 0,
    rmRequested: 120,
    scmOverride: null,

    regionalAvailable: 50,
    remainingNeed: 70,

    needByDate: '2026-10-12',
    priority: 'high',

    rebalancingAllocated: 40,
    centralAllocated: 20,
    procurementOrdered: 10,
    stillUnmet: 0,

    submittedAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T13:30:00Z',
  },
]
