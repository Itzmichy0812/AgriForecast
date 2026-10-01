import type { RegionalTransfer } from '@/types/scm'

/**
 * Cross-region transfers mock data.
 *
 * Quantity reconciliation (matches regionalRequirements.ts):
 * - MDL URE:   70 tons  ← from SOUTHEAST surplus (TF-001)
 * - MDL NPK:   60 tons  ← from CENTRAL_HIGHLANDS surplus (TF-002)
 * - SE FILIA:  50 liters ← from NORTH_CENTRAL surplus (TF-003)
 * - CH KALI:   40 tons  ← from SOUTH_CENTRAL surplus (TF-004)
 * Total rebalanced: 220 units
 */
export const INITIAL_TRANSFERS: RegionalTransfer[] = [
  // ─── TF-001: SE → MDL (Ure Hạt Trong) ──────────────────────────
  {
    id: 'TF-20261001-001',
    sku: 'PB-URE-01',
    skuName: 'Phân bón Ure Hạt Trong Cà Mau',
    unit: 'Tấn',

    sourceRegion: 'SOUTHEAST',
    destinationRegion: 'MEKONG_DELTA',

    sourceSurplus: 90,
    destinationNeed: 130,
    proposedQty: 70,
    confirmedQty: 70,

    transferDate: '2026-10-04',
    eta: '2026-10-06',

    status: 'ready',
    proposedByScm: 'SCM Điều phối (Nguyễn Thị Lan)',
    sourceRmComment: 'Xác nhận xuất 70 tấn từ kho vùng ĐNB. Xe tải khởi hành sáng 04/10.',
    destRmComment: 'Xác nhận tiếp nhận. Kho vùng ĐBSCL chuẩn bị bãi nhận hàng.',

    requirementId: 'REQ-SCM-MDL-URE-001',
    period: '2026-10',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-02T10:00:00Z',
    history: [
      {
        id: 'tfh-001-1',
        eventType: 'created',
        title: 'SCM tạo đề xuất điều chuyển',
        timestamp: '2026-10-01T08:00:00Z',
        actor: 'SCM Điều phối (Nguyễn Thị Lan)',
        note: 'Phân tích tồn kho: Kho vùng ĐNB dư 90 tấn Ure. ĐBSCL thiếu 130 tấn. Đề xuất điều 70 tấn.',
      },
      {
        id: 'tfh-001-2',
        eventType: 'source_confirmed',
        title: 'RM Đông Nam Bộ xác nhận nguồn',
        timestamp: '2026-10-01T14:30:00Z',
        actor: 'RM Đông Nam Bộ (Phạm Văn Hải)',
        note: 'Xác nhận xuất 70 tấn từ kho vùng ĐNB. Xe tải khởi hành sáng 04/10.',
      },
      {
        id: 'tfh-001-3',
        eventType: 'dest_confirmed',
        title: 'RM ĐBSCL xác nhận tiếp nhận',
        timestamp: '2026-10-02T10:00:00Z',
        actor: 'RM Đồng bằng SCL (Trần Minh Tuấn)',
        note: 'Xác nhận tiếp nhận. Kho vùng ĐBSCL chuẩn bị bãi nhận hàng.',
      },
      {
        id: 'tfh-001-4',
        eventType: 'ready',
        title: 'Sẵn sàng vận chuyển',
        timestamp: '2026-10-02T10:05:00Z',
        actor: 'Hệ thống',
        note: 'Cả hai RM đã xác nhận. Lô hàng sẵn sàng vận chuyển ngày 04/10.',
      },
    ],
  },

  // ─── TF-002: CH → MDL (NPK Đầu Trâu) ───────────────────────────
  {
    id: 'TF-20261001-002',
    sku: 'PB-NPK-02',
    skuName: 'Phân bón NPK Đầu Trâu 16-16-8+TE',
    unit: 'Tấn',

    sourceRegion: 'CENTRAL_HIGHLANDS',
    destinationRegion: 'MEKONG_DELTA',

    sourceSurplus: 80,
    destinationNeed: 100,
    proposedQty: 60,
    confirmedQty: null,

    transferDate: '2026-10-05',
    eta: '2026-10-08',

    status: 'waiting_dest_rm',
    proposedByScm: 'SCM Điều phối (Nguyễn Thị Lan)',
    sourceRmComment: 'Đồng ý xuất 60 tấn NPK từ kho vùng Tây Nguyên.',

    requirementId: 'REQ-SCM-MDL-NPK-002',
    period: '2026-10',
    createdAt: '2026-10-01T09:00:00Z',
    updatedAt: '2026-10-01T16:00:00Z',
    history: [
      {
        id: 'tfh-002-1',
        eventType: 'created',
        title: 'SCM tạo đề xuất điều chuyển',
        timestamp: '2026-10-01T09:00:00Z',
        actor: 'SCM Điều phối (Nguyễn Thị Lan)',
        note: 'Tây Nguyên dư NPK 80 tấn (nhu cầu tháng 10 thấp hơn dự báo). ĐBSCL thiếu 100 tấn. Đề xuất điều 60 tấn.',
      },
      {
        id: 'tfh-002-2',
        eventType: 'source_confirmed',
        title: 'RM Tây Nguyên xác nhận nguồn',
        timestamp: '2026-10-01T16:00:00Z',
        actor: 'RM Tây Nguyên (Lê Quốc Bình)',
        note: 'Đồng ý xuất 60 tấn NPK từ kho vùng Tây Nguyên.',
      },
    ],
  },

  // ─── TF-003: NC → SE (Filia 525SE) ─────────────────────────────
  {
    id: 'TF-20261001-003',
    sku: 'BVTV-FILIA-05',
    skuName: 'Thuốc trừ bệnh Filia 525SE',
    unit: 'Lít',

    sourceRegion: 'NORTH_CENTRAL',
    destinationRegion: 'SOUTHEAST',

    sourceSurplus: 70,
    destinationNeed: 100,
    proposedQty: 50,
    confirmedQty: null,

    transferDate: '2026-10-06',
    eta: '2026-10-09',

    status: 'waiting_source_rm',
    proposedByScm: 'SCM Điều phối (Nguyễn Thị Lan)',

    requirementId: 'REQ-SCM-SE-FILIA-004',
    period: '2026-10',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
    history: [
      {
        id: 'tfh-003-1',
        eventType: 'created',
        title: 'SCM tạo đề xuất điều chuyển',
        timestamp: '2026-10-01T10:00:00Z',
        actor: 'SCM Điều phối (Nguyễn Thị Lan)',
        note: 'Bắc Trung Bộ có tồn Filia 70 lít dư do vụ lúa trễ. ĐNB đang thiếu 100 lít. Đề xuất điều 50 lít để tối ưu trước khi mua ngoài.',
      },
    ],
  },

  // ─── TF-004: SC → CH (Kali Clorua) ─────────────────────────────
  {
    id: 'TF-20261001-004',
    sku: 'PB-KALI-04',
    skuName: 'Phân Kali Clorua Bột (Israel)',
    unit: 'Tấn',

    sourceRegion: 'SOUTH_CENTRAL',
    destinationRegion: 'CENTRAL_HIGHLANDS',

    sourceSurplus: 55,
    destinationNeed: 70,
    proposedQty: 40,
    confirmedQty: 40,

    transferDate: '2026-10-03',
    eta: '2026-10-05',

    status: 'completed',
    proposedByScm: 'SCM Điều phối (Nguyễn Thị Lan)',
    sourceRmComment: 'Đồng ý. Xe đã xuất bến 02/10.',
    destRmComment: 'Nhận hàng đủ 40 tấn ngày 05/10. Nhập kho xong.',

    requirementId: 'REQ-SCM-CH-KALI-006',
    period: '2026-10',
    createdAt: '2026-09-30T14:00:00Z',
    updatedAt: '2026-10-05T15:00:00Z',
    history: [
      {
        id: 'tfh-004-1',
        eventType: 'created',
        title: 'SCM tạo đề xuất điều chuyển',
        timestamp: '2026-09-30T14:00:00Z',
        actor: 'SCM Điều phối (Nguyễn Thị Lan)',
        note: 'Nam Trung Bộ tồn dư 55 tấn Kali sau điều chỉnh kế hoạch trồng mía. Tây Nguyên thiếu 70 tấn cho cà phê vụ thu. Đề xuất điều 40 tấn.',
      },
      {
        id: 'tfh-004-2',
        eventType: 'source_confirmed',
        title: 'RM Nam Trung Bộ xác nhận',
        timestamp: '2026-10-01T08:00:00Z',
        actor: 'RM Nam Trung Bộ (Võ Thị Hương)',
        note: 'Đồng ý. Xe đã xuất bến 02/10.',
      },
      {
        id: 'tfh-004-3',
        eventType: 'dest_confirmed',
        title: 'RM Tây Nguyên xác nhận tiếp nhận',
        timestamp: '2026-10-01T10:00:00Z',
        actor: 'RM Tây Nguyên (Lê Quốc Bình)',
        note: 'Xác nhận tiếp nhận 40 tấn.',
      },
      {
        id: 'tfh-004-4',
        eventType: 'completed',
        title: 'Giao nhận hoàn tất',
        timestamp: '2026-10-05T15:00:00Z',
        actor: 'RM Tây Nguyên (Lê Quốc Bình)',
        note: 'Nhận hàng đủ 40 tấn ngày 05/10. Nhập kho xong.',
      },
    ],
  },

  // ─── TF-005: SC → MDL (Filia 525SE) ─────────────────────────────
  {
    id: 'TF-20261001-005',
    sku: 'BVTV-FILIA-05',
    skuName: 'Thuốc trừ bệnh Filia 525SE',
    unit: 'Lít',

    sourceRegion: 'SOUTH_CENTRAL',
    destinationRegion: 'MEKONG_DELTA',

    sourceSurplus: 65,
    destinationNeed: 80,
    proposedQty: 50,
    confirmedQty: null,

    transferDate: '2026-10-06',
    eta: '2026-10-08',

    status: 'waiting_source_rm',
    proposedByScm: 'SCM Điều phối (Nguyễn Thị Lan)',

    requirementId: 'REQ-SCM-MDL-FILIA-003',
    period: '2026-10',
    createdAt: '2026-10-01T11:00:00Z',
    updatedAt: '2026-10-01T11:00:00Z',
    history: [
      {
        id: 'tfh-005-1',
        eventType: 'created',
        title: 'SCM tạo đề xuất điều chuyển',
        timestamp: '2026-10-01T11:00:00Z',
        actor: 'SCM Điều phối (Nguyễn Thị Lan)',
        note: 'Duyên hải Nam Trung Bộ có tồn dư 65 lít Filia do vụ lúa hè thu kết thúc sớm. ĐBSCL thiếu 80 lít sau kiểm kê tồn kho. Đề xuất điều 50 lít.',
      },
    ],
  },
]
