import type { Supplier } from '@/types/scm'

export const SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Công ty CP Phân bón Cà Mau',
    country: 'Việt Nam',
    contactPerson: 'Nguyễn Trọng Phúc',
    email: 'procurement@phanbon-camau.com.vn',
    categories: ['Phân bón vô cơ'],

    unitPrice: 8_200_000,   // VND/tấn
    moq: 20,
    leadTimeDays: 7,
    availableCapacity: 500,
    paymentTerms: 'Trả trước 30%, còn lại khi giao hàng',

    onTimeDeliveryRate: 0.94,
    qualityTier: 'A',
  },
  {
    id: 'SUP-002',
    name: 'Tổng Công ty Phân bón và Hóa chất Dầu khí (PVFCCo)',
    country: 'Việt Nam',
    contactPerson: 'Trần Văn Hùng',
    email: 'sales@pvfcco.com.vn',
    categories: ['Phân bón vô cơ'],

    unitPrice: 8_050_000,
    moq: 50,
    leadTimeDays: 10,
    availableCapacity: 1000,
    paymentTerms: 'L/C 30 ngày',

    onTimeDeliveryRate: 0.91,
    qualityTier: 'A',
  },
  {
    id: 'SUP-003',
    name: 'ICL Specialty Fertilizers (Israel)',
    country: 'Israel',
    contactPerson: 'David Levi',
    email: 'd.levi@icl-group.com',
    categories: ['Phân bón vô cơ'],

    unitPrice: 9_800_000,   // imported, higher price
    moq: 20,
    leadTimeDays: 21,
    availableCapacity: 200,
    paymentTerms: 'LC at sight',

    onTimeDeliveryRate: 0.97,
    qualityTier: 'A',
    qualityAlerts: undefined,
  },
  {
    id: 'SUP-004',
    name: 'Công ty TNHH Bayer Việt Nam',
    country: 'Việt Nam (Germany origin)',
    contactPerson: 'Phạm Thanh Tâm',
    email: 'agro.vn@bayer.com',
    categories: ['Thuốc bảo vệ thực vật'],

    unitPrice: 185_000,   // VND/lít (Filia 525SE)
    moq: 100,
    leadTimeDays: 14,
    availableCapacity: 5000,
    paymentTerms: 'Trả sau 45 ngày',

    onTimeDeliveryRate: 0.96,
    qualityTier: 'A',
  },
  {
    id: 'SUP-005',
    name: 'Công ty CP BVTV An Giang (Agpps)',
    country: 'Việt Nam',
    contactPerson: 'Lê Minh Quân',
    email: 'export@agpps.com.vn',
    categories: ['Thuốc bảo vệ thực vật'],

    unitPrice: 175_000,
    moq: 50,
    leadTimeDays: 7,
    availableCapacity: 3000,
    paymentTerms: 'Trả trước toàn bộ',

    onTimeDeliveryRate: 0.88,
    qualityTier: 'B',
    qualityAlerts: 'Lô tháng 9 bị phàn nàn nồng độ hoạt chất thấp hơn 2%.',
  },
  {
    id: 'SUP-006',
    name: 'Công ty CP Phân bón Bình Điền',
    country: 'Việt Nam',
    contactPerson: 'Đỗ Thị Hồng',
    email: 'kinhdoanh@binhdien.com',
    categories: ['Phân bón NPK'],

    unitPrice: 11_500_000,  // VND/tấn (NPK 16-16-8)
    moq: 20,
    leadTimeDays: 5,
    availableCapacity: 800,
    paymentTerms: 'Trả ngay khi nhận hàng',

    onTimeDeliveryRate: 0.93,
    qualityTier: 'A',
  },
]
