import type { PurchaseOrder } from '@/types/scm'

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-20261001-001',
    poNumber: 'PO-2026-1001-001',
    recommendationId: 'PR-20261001-004',

    supplierId: 'SUP-003',
    supplierName: 'ICL Specialty Fertilizers (Israel)',

    lines: [
      {
        id: 'pol-001-1',
        sku: 'PB-KALI-04',
        skuName: 'Phân Kali Clorua Bột (Israel)',
        unit: 'Tấn',
        quantity: 20,
        unitPrice: 9_800_000,
        totalPrice: 196_000_000,
        deliveryDate: '2026-10-22',
      },
    ],
    grandTotal: 196_000_000,

    status: 'approved',

    createdBy: 'SCM Điều phối (Nguyễn Thị Lan)',
    createdAt: '2026-10-01T09:00:00Z',
    approvedBy: 'SCM Trưởng (Lê Văn Minh)',
    approvedAt: '2026-10-01T11:00:00Z',

    notes: 'Đơn khẩn vì Kali Israel lead time 21 ngày. Cần giao trước 22/10.',
    period: '2026-10',
  },
]
