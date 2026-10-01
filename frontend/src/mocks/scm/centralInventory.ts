import type { CentralInventoryItem } from '@/types/scm'

/**
 * Central Warehouse Inventory mock data.
 * Quantities must support central allocations in centralInventory.ts:
 *   URE:   40 tons  → available ≥ 40
 *   NPK:   30 tons  → available ≥ 30
 *   FILIA: 20+40=60 liters → available ≥ 60
 *   DAP:   70 tons  → available ≥ 70
 *   KALI:  20 tons  → available ≥ 20
 */
export const CENTRAL_INVENTORY: CentralInventoryItem[] = [
  {
    id: 'CI-URE-01',
    sku: 'PB-URE-01',
    skuName: 'Phân bón Ure Hạt Trong Cà Mau',
    productGroup: 'Phân bón vô cơ',
    unit: 'Tấn',
    onHand: 420,
    reserved: 340,
    available: 80,
    rop: 100,
    incomingFromProduction: 200,
    warehouseLocation: 'Kho Trung tâm Thủ Đức — Khu A',
    lastRestocked: '2026-09-25',
  },
  {
    id: 'CI-NPK-02',
    sku: 'PB-NPK-02',
    skuName: 'Phân bón NPK Đầu Trâu 16-16-8+TE',
    productGroup: 'Phân bón NPK',
    unit: 'Tấn',
    onHand: 310,
    reserved: 240,
    available: 70,
    rop: 80,
    incomingFromProduction: 150,
    warehouseLocation: 'Kho Trung tâm Thủ Đức — Khu A',
    lastRestocked: '2026-09-28',
  },
  {
    id: 'CI-FILIA-05',
    sku: 'BVTV-FILIA-05',
    skuName: 'Thuốc trừ bệnh Filia 525SE',
    productGroup: 'Thuốc bảo vệ thực vật',
    unit: 'Lít',
    onHand: 2400,
    reserved: 2200,
    available: 200,
    rop: 300,
    incomingFromProduction: 0,
    warehouseLocation: 'Kho Trung tâm Thủ Đức — Khu B (BVTV)',
    lastRestocked: '2026-09-20',
  },
  {
    id: 'CI-DAP-03',
    sku: 'PB-DAP-03',
    skuName: 'Phân bón DAP Đình Vũ 18-46',
    productGroup: 'Phân bón vô cơ',
    unit: 'Tấn',
    onHand: 580,
    reserved: 480,
    available: 100,
    rop: 80,
    incomingFromProduction: 300,
    warehouseLocation: 'Kho Trung tâm Thủ Đức — Khu A',
    lastRestocked: '2026-09-30',
  },
  {
    id: 'CI-KALI-04',
    sku: 'PB-KALI-04',
    skuName: 'Phân Kali Clorua Bột (Israel)',
    productGroup: 'Phân bón vô cơ',
    unit: 'Tấn',
    onHand: 280,
    reserved: 245,
    available: 35,
    rop: 60,
    incomingFromProduction: 100,
    warehouseLocation: 'Kho Trung tâm Thủ Đức — Khu C',
    lastRestocked: '2026-09-22',
  },
  {
    id: 'CI-REGENT-08',
    sku: 'BVTV-REGENT-08',
    skuName: 'Thuốc trừ sâu Regent 800WG',
    productGroup: 'Thuốc bảo vệ thực vật',
    unit: 'Gói (1g)',
    onHand: 45000,
    reserved: 38000,
    available: 7000,
    rop: 10000,
    incomingFromProduction: 0,
    warehouseLocation: 'Kho Trung tâm Thủ Đức — Khu B (BVTV)',
    lastRestocked: '2026-09-15',
  },
]
