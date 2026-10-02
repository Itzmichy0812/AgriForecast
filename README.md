# AgriForecast

AgriForecast là prototype hệ thống hỗ trợ **dự báo nhu cầu, theo dõi tồn kho, điều phối phân bổ và hỗ trợ quyết định mua hàng** cho doanh nghiệp vật tư nông nghiệp.

Phiên bản hiện tại: **prototype-v0.1**

## 1. Trạng thái hiện tại

Đã triển khai:

- **Dealer Workspace**
  - Tổng quan đại lý
  - Xem và điều chỉnh forecast
  - Theo dõi tồn kho
  - Tạo Manual Request
  - Theo dõi Requested / Allocated / Remaining
- **SCM Workspace**
  - Tổng quan toàn mạng lưới
  - Nhu cầu vùng
  - SCM điều chỉnh nhu cầu vùng
  - Điều chuyển liên vùng
  - Phân bổ từ Kho Trung tâm
  - Purchase Recommendation
  - So sánh nhà cung cấp
  - Tạo và phê duyệt PO

Chưa triển khai đầy đủ:

- Regional Manager (RM) Workspace
- Admin Workspace
- Backend / database thật
- Authentication / RBAC thật
- Forecast model thật
- Data import/synchronization thật
- Scenario analysis
- Bullwhip dashboard

> Dữ liệu trong prototype hiện dùng **mock data và in-memory service**. Refresh trang sẽ đưa dữ liệu về trạng thái mock ban đầu.

## 2. Tech stack

Frontend hiện tại sử dụng:

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- TanStack Query
- TanStack Table
- Radix UI primitives
- Lucide icons
- oxlint

Xem version cụ thể trong `frontend/package.json`.

## 3. Cách chạy giao diện

### Yêu cầu

Máy cần có:

- Node.js
- npm
- Git

### Clone repository

```bash
git clone https://github.com/Itzmichy0812/AgriForecast.git
cd AgriForecast
```

### Cài dependencies

```bash
cd frontend
npm install
```

### Chạy development server

```bash
npm run dev
```

Sau khi Vite khởi động, mở URL được in trong terminal, thông thường là:

```text
http://localhost:5173
```

Route gốc hiện redirect về:

```text
/dealer/dashboard
```

### Kiểm tra build

```bash
npm run lint
npm run build
```

## 4. Route prototype

### Dealer

```text
/dealer/dashboard
/dealer/forecast
/dealer/forecast/:forecastId
/dealer/inventory
/dealer/requests
/dealer/requests/:requestId
```

### SCM

```text
/scm/dashboard
/scm/regional-demand
/scm/rebalancing
/scm/central-allocation
/scm/procurement
```

## 5. Flow demo đề xuất

### Dealer

1. Mở `/dealer/dashboard`.
2. Xem các cảnh báo cần xử lý.
3. Vào **Dự báo nhu cầu**.
4. Mở một SKU cần review.
5. Điều chỉnh forecast và nhập lý do.
6. Vào **Tồn kho**.
7. Tạo **Yêu cầu bổ sung** cho SKU thiếu hàng.
8. Vào **Yêu cầu bổ sung** để xem Requested / Allocated / Remaining và lịch sử xử lý.

### SCM

1. Chuyển workspace sang **SCM**.
2. Xem `/scm/dashboard`.
3. Vào **Nhu cầu vùng** để xem lượng RM gửi lên.
4. Nếu cần, nhập **SCM điều chỉnh** và lý do.
5. Vào **Điều chuyển liên vùng** để kiểm tra nguồn dư giữa các vùng.
6. Mô phỏng xác nhận RM nguồn và RM đích.
7. Vào **Phân bổ trung tâm** để cấp phần còn thiếu từ Kho Trung tâm.
8. Phần thiếu cuối cùng được chuyển sang **Mua hàng**.
9. Xem Purchase Recommendation, so sánh nhà cung cấp, tạo PO Draft và approve PO.

## 6. Lưu ý quan trọng về prototype

Một số quyết định hiện tại là **prototype design decision**, chưa phải requirement cuối cùng của nhóm:

1. **Ưu tiên điều chuyển/phân bổ nội bộ trước khi mua ngoài.**
   - Đây là quyết định thiết kế của bản prototype hiện tại.
   - Bộ 34 Use Case gốc trình bày nhóm Thu mua trước nhóm Phân bổ/Điều chuyển.
   - Cần nhóm thống nhất xem flow nào sẽ là flow chính thức.

2. **Dealer là user trực tiếp của prototype.**
   - Dealer có workspace riêng để xem forecast, tồn kho và tạo Manual Request.
   - Tài liệu UC gốc mô tả Dealer là external market actor và không bắt buộc là user trực tiếp của MVP.
   - Cần nhóm xác nhận mô hình cuối cùng.

3. **Nhiều role gốc được gộp thành Dealer / RM / SCM / Admin.**
   - Mục tiêu là giảm độ phức tạp khi xây prototype.
   - Không có nghĩa các role như Procurement Manager, Warehouse Manager hay Logistics Manager bị loại bỏ khỏi thiết kế cuối.

Chi tiết xem tại:

- [System Overview](docs/system-overview.md)
- [Business Flow](docs/business-flow.md)
- [Roles & Permissions](docs/roles-and-permissions.md)
- [Glossary & Calculations](docs/glossary-and-calculations.md)
- [UC Gap Analysis](docs/uc-gap-analysis.md)

## 7. Cấu trúc frontend chính

```text
frontend/src/
├── app/
│   ├── providers/
│   └── router/
├── components/
│   ├── layout/
│   └── shared/
├── features/
│   ├── dealer/
│   └── scm/
├── mocks/
│   ├── dealer/
│   └── scm/
├── services/
├── styles/
└── types/
```

Nguyên tắc hiện tại:

- UI không nên chứa trực tiếp mock business data.
- Business data đi qua service/query layer.
- Domain type tách khỏi component.
- Quyết định nghiệp vụ cần có trace rõ giữa các tầng.
- Không overwrite dữ liệu gốc khi có override; lưu giá trị điều chỉnh riêng.

## 8. Tài liệu tham khảo nội bộ

Bộ tài liệu dự án ban đầu mô tả 34 Use Case theo 8 nhóm:

1. Dữ liệu nền
2. Đồng bộ và nhập dữ liệu
3. Forecast / Demand Planning
4. Tồn kho động
5. Thu mua
6. Phân bổ đa cấp và điều chuyển
7. Dashboard và phân tích
8. Quản trị hệ thống

Prototype v0.1 chỉ triển khai một phần của toàn bộ phạm vi này. Bảng đối chiếu chi tiết nằm trong `docs/uc-gap-analysis.md`.
