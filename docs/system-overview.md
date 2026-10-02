# System Overview

Tài liệu này mô tả kiến trúc nghiệp vụ và phạm vi của **AgriForecast prototype-v0.1**.

## 1. Mục tiêu hệ thống

AgriForecast hướng tới việc hỗ trợ doanh nghiệp vật tư nông nghiệp:

- Dự báo nhu cầu theo SKU / khu vực / kỳ thời gian.
- Theo dõi tồn kho và rủi ro thiếu hàng.
- Điều phối nhu cầu qua nhiều tầng phân phối.
- Cân đối hàng nội bộ.
- Hỗ trợ ra quyết định mua ngoài khi nguồn nội bộ không đủ.
- Theo dõi nguồn gốc quyết định và các lần override.

Bộ 34 Use Case gốc chia hệ thống thành 8 nhóm chức năng: dữ liệu nền; đồng bộ dữ liệu; forecast; tồn kho; thu mua; phân bổ/điều chuyển; dashboard/phân tích; quản trị hệ thống.

## 2. Phạm vi prototype-v0.1

Prototype hiện tập trung vào hai workspace đã code hoàn chỉnh:

### Dealer Workspace

Dealer có thể:

- Xem dashboard exception-first.
- Xem forecast theo SKU.
- Điều chỉnh forecast và ghi lý do.
- Xem tồn kho.
- Tạo Manual Request cho nhu cầu ngoài kế hoạch.
- Theo dõi tiến độ fulfillment của request.

### SCM Workspace

SCM có thể:

- Xem tình trạng mạng lưới.
- Xem nhu cầu được RM gửi lên.
- Điều chỉnh nhu cầu ở cấp SCM.
- Lập / theo dõi điều chuyển liên vùng.
- Phân bổ từ Kho Trung tâm.
- Xem Purchase Recommendation.
- So sánh nhà cung cấp.
- Tạo PO Draft.
- Approve PO.

## 3. Các workspace chưa hoàn thiện

### Regional Manager (RM)

RM đã tồn tại trong business flow nhưng chưa có UI riêng ở prototype-v0.1.

RM dự kiến chịu trách nhiệm:

- Nhận forecast / manual request từ Dealer.
- Tổng hợp Effective Demand trong vùng.
- Phân bổ từ kho vùng.
- Xử lý shortage tại cấp vùng.
- Điều chuyển nội vùng nếu hợp lệ.
- Gửi Remaining Need lên SCM.
- Xác nhận điều chuyển liên vùng khi SCM đề xuất.

### Admin

Admin chưa code, nhưng phạm vi dự kiến gồm:

- Quản lý user/account.
- Quản lý role/permission.
- Quản lý Dealer / node / warehouse / network mapping.
- Quản lý master data.
- Quản lý system configuration.
- Audit log.
- Hỗ trợ xem dữ liệu nghiệp vụ ở chế độ read-only khi troubleshooting.

## 4. Kiến trúc frontend hiện tại

Prototype dùng cấu trúc feature-oriented:

```text
src/
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
└── types/
```

Các nguyên tắc đang áp dụng:

- **Domain types** tách khỏi page/component.
- **Mock data** tách khỏi UI.
- **Service layer** chịu trách nhiệm thao tác dữ liệu.
- **TanStack Query** quản lý read/mutation state ở UI.
- Router được tách theo workspace.
- Shared UI dùng chung giữa Dealer và SCM.

## 5. Dữ liệu hiện tại

Prototype chưa có backend và database.

Dữ liệu hiện tại được giữ trong:

- `src/mocks/dealer/*`
- `src/mocks/scm/*`

Các service giữ state in-memory:

- `dealerService`
- `scmService`

Do đó:

- Refresh trang sẽ reset về mock data ban đầu.
- Chưa có persistence.
- Chưa có concurrency control.
- Chưa có transaction database.
- Chưa có authentication thật.

## 6. Nguyên tắc traceability

Prototype cố gắng không overwrite các giá trị quyết định gốc.

Ví dụ forecast:

```text
System Forecast
→ Dealer Adjusted
→ Final Planning
```

Ví dụ SCM:

```text
Dealer Effective Demand
→ RM Requested
→ SCM Override
→ Rebalancing
→ Central Allocation
→ Procurement
```

Điều này giúp truy vết vì sao con số cuối khác với con số đầu.

## 7. Thiết kế role hiện tại và khả năng mở rộng

Prototype hiện đơn giản hóa role thành:

- Dealer
- RM
- SCM
- Admin

Trong 34 UC gốc, trách nhiệm được chia thành nhiều role hơn như:

- Demand/Supply Planner
- Procurement Manager
- Inventory/Warehouse Manager
- Sales/Regional Manager
- Distribution/Logistics Manager
- Business/Supply Chain Manager
- System Administrator

### Có mở rộng lại được không?

Có.

Kiến trúc hiện tại chưa khóa hệ thống vào chỉ 3–4 role. Tuy nhiên khi mở rộng sẽ cần refactor ở ba lớp:

1. **Routing / navigation**
   - Thêm workspace hoặc view theo role.
   - Đây là phần tương đối nhẹ.

2. **Authorization / permission**
   - Hiện chưa có RBAC thật.
   - Đây là phần thay đổi lớn nhất.

3. **Ownership của business action**
   - Hiện SCM đang kiêm nhiều hành động vốn thuộc Procurement / Logistics / Supply Planner.
   - Khi tách role cần chuyển ownership mà không đổi domain entity.

### Khuyến nghị cho giai đoạn tiếp theo

Không nên hard-code rule dạng:

```text
if role === "scm" => được làm mọi việc
```

Nên chuyển dần sang permission theo capability:

```text
forecast.view
forecast.adjust
forecast.run

inventory.view
inventory.manage

requirement.aggregate
requirement.override

transfer.propose
transfer.confirm
transfer.approve

allocation.plan
allocation.approve

procurement.recommend
procurement.select_supplier

po.create
po.approve

admin.manage_users
admin.manage_config
```

Khi đó cùng một nghiệp vụ có thể được gán cho role khác nhau mà không cần viết lại domain logic.

## 8. Hai quyết định prototype đang chờ nhóm xác nhận

### 8.1 Điều chuyển nội bộ trước mua ngoài

Prototype hiện dùng:

```text
Regional shortage
→ Internal / Cross-region Rebalancing
→ Central Allocation
→ External Procurement
```

Đây là quyết định thiết kế của người xây prototype, **chưa phải quyết định chung của nhóm**.

Bộ UC gốc trình bày nhóm Thu mua trước nhóm Phân bổ/Điều chuyển. Vì vậy nhóm cần xác nhận flow cuối cùng.

### 8.2 Dealer là user trực tiếp

Prototype tạo Dealer Workspace để:

- Xem / điều chỉnh forecast.
- Xem tồn kho.
- Tạo Manual Request.

Trong tài liệu gốc, Dealer được mô tả như external market actor và không bắt buộc là user trực tiếp của MVP.

Vì vậy đây cũng là **prototype design decision – pending team validation**.

## 9. Định hướng kiến trúc tiếp theo

Ưu tiên đề xuất:

1. Hoàn thiện RM Workspace.
2. Hoàn thiện Admin.
3. Tách role khỏi permission.
4. Thiết kế backend API contract.
5. Thay mock service bằng API client.
6. Thêm persistence / audit.
7. Tích hợp forecast model.
8. Triển khai các UC chưa có như import data, safety stock động, scenario, bullwhip.
