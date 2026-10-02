# UC Gap Analysis — Prototype v0.1 vs 34 Use Cases gốc

Tài liệu này đối chiếu prototype AgriForecast v0.1 với bộ **34 Use Case gốc** trong tài liệu dự án.

Mục tiêu của bảng này là tránh hiểu nhầm rằng prototype đã thay thế toàn bộ thiết kế UC.

## 1. Quy ước trạng thái

### UNCHANGED

Ý tưởng nghiệp vụ được giữ gần như nguyên vẹn.

### ADAPTED FOR PROTOTYPE

Use Case vẫn còn về mặt nghiệp vụ nhưng:

- actor được gộp,
- flow được rút gọn,
- approval được đơn giản hóa,
- hoặc UI đặt ở workspace khác.

### PARTIALLY IMPLEMENTED

Prototype có một phần của UC nhưng chưa đầy đủ.

### EXTENDED

Prototype bổ sung nghiệp vụ chưa có UC riêng trong bộ gốc.

### NOT IMPLEMENTED YET

UC vẫn thuộc roadmap nhưng v0.1 chưa code.

### PENDING TEAM DECISION

Quyết định hiện tại là quyết định khi dựng prototype, cần cả nhóm xác nhận.

---

## 2. Tổng quan 8 nhóm UC

| Nhóm | UC | Trạng thái v0.1 | Ghi chú |
|---|---|---|---|
| 1. Dữ liệu nền | UC01–UC04 | NOT IMPLEMENTED YET | Mock data thay cho master-data UI |
| 2. Đồng bộ / Import | UC05–UC08 | NOT IMPLEMENTED YET | Chưa có ERP/POS/file/API integration |
| 3. Forecast | UC09–UC13 | PARTIAL / ADAPTED | Dealer Workspace đã hiện thực phần lớn UX |
| 4. Tồn kho | UC14–UC17 | PARTIAL | Có inventory/ROP/expiry, chưa có safety stock động/FEFO đầy đủ |
| 5. Thu mua | UC18–UC21 | ADAPTED | Chuyển trách nhiệm vào SCM |
| 6. Allocation / Transfer | UC22–UC25 | ADAPTED / PARTIAL | Có rebalancing + central allocation, chưa có transport constraints đầy đủ |
| 7. Dashboard / Analytics | UC26–UC30 | PARTIAL | Dashboard/risk/explanation có; scenario/bullwhip chưa có |
| 8. Admin | UC31–UC34 | NOT IMPLEMENTED YET | Đã có hướng thiết kế nhưng chưa code |

---

## 3. Đối chiếu chi tiết UC01–UC34

### Nhóm 1 — Dữ liệu nền

| UC | Nội dung gốc | Prototype v0.1 | Trạng thái |
|---|---|---|---|
| UC01 | Quản lý danh mục vật tư | SKU nằm trong mock data, chưa có CRUD | NOT IMPLEMENTED YET |
| UC02 | Quản lý mạng lưới kho/node | Có khái niệm Dealer / Region / Central trong mock nhưng chưa có UI quản trị mạng lưới | PARTIALLY IMPLEMENTED |
| UC03 | Quản lý nhà cung cấp | Có supplier mock và supplier comparison, chưa có Supplier Master CRUD | PARTIALLY IMPLEMENTED |
| UC04 | Quản lý mùa vụ/khu vực/crop-livestock | Forecast có period/season signal ở mức mock, chưa có master configuration | PARTIALLY IMPLEMENTED |

### Nhóm 2 — Đồng bộ và nhập dữ liệu

| UC | Nội dung gốc | Prototype v0.1 | Trạng thái |
|---|---|---|---|
| UC05 | Import lịch sử tiêu thụ | Dùng mock historical signal | NOT IMPLEMENTED YET |
| UC06 | Import tồn kho / giao dịch kho | Dùng mock inventory | NOT IMPLEMENTED YET |
| UC07 | Import lead time / hiệu suất NCC | Supplier data là mock | NOT IMPLEMENTED YET |
| UC08 | Cập nhật dữ liệu ngoại sinh | Weather / seasonal signal được mock | NOT IMPLEMENTED YET |

### Nhóm 3 — Forecast / Demand Planning

| UC | Nội dung gốc | Prototype v0.1 | Trạng thái |
|---|---|---|---|
| UC09 | Xem forecast theo SKU / khu vực / mùa vụ | Dealer Forecast Workspace + filter + detail | PARTIALLY IMPLEMENTED |
| UC10 | Chạy lại mô hình forecast | Không có model execution thật | NOT IMPLEMENTED YET |
| UC11 | Manual override forecast | Dealer có thể điều chỉnh, lưu lý do và giữ System Forecast riêng | ADAPTED FOR PROTOTYPE |
| UC12 | Đánh giá sai số forecast | Có previous-period error / MAPE demo | PARTIALLY IMPLEMENTED |
| UC13 | Attribution nguyên nhân biến động | Có weather / season / historical signals ở mức mock | PARTIALLY IMPLEMENTED |

Khác biệt chính:

- Actor gốc thiên về Demand/Supply Planner / Sales-Regional Manager.
- Prototype cho Dealer trực tiếp review/adjust forecast.

**PENDING TEAM DECISION:** Dealer có tiếp tục là actor trực tiếp của forecast ở bản cuối hay không.

### Nhóm 4 — Tồn kho động

| UC | Nội dung gốc | Prototype v0.1 | Trạng thái |
|---|---|---|---|
| UC14 | Inventory Position / capacity | Có On-hand, Incoming, Allocated, Available; chưa có capacity engine | PARTIALLY IMPLEMENTED |
| UC15 | Dynamic Safety Stock | Chưa có calculation engine | NOT IMPLEMENTED YET |
| UC16 | ROP | Có ROP mock + cảnh báo tồn thấp | PARTIALLY IMPLEMENTED |
| UC17 | Lot / Expiry / FEFO | Có expiryDate; chưa có lot-level và FEFO execution | PARTIALLY IMPLEMENTED |

Prototype formula hiện tại:

```text
Available = On-hand - Allocated
```

Incoming được hiển thị riêng.

Đây là implementation rule của v0.1, chưa phải công thức Inventory Position cuối cùng.

### Nhóm 5 — Thu mua

| UC | Nội dung gốc | Prototype v0.1 | Trạng thái |
|---|---|---|---|
| UC18 | Cảnh báo cần bổ sung hàng | Dealer/SCM dashboard có shortage alert | ADAPTED FOR PROTOTYPE |
| UC19 | Xem đề xuất mua hàng | SCM Purchase Recommendation | ADAPTED FOR PROTOTYPE |
| UC20 | So sánh NCC | SCM Supplier Comparison | ADAPTED FOR PROTOTYPE |
| UC21 | Tạo / theo dõi PO | SCM tạo PO Draft và approve | ADAPTED FOR PROTOTYPE |

Khác biệt actor:

- Gốc: Procurement Manager thực hiện nghiệp vụ mua hàng.
- Prototype: SCM đang kiêm Procurement.

Khác biệt approval:

- Gốc có định hướng creator / approver tách trách nhiệm.
- Prototype cho SCM vừa tạo vừa approve PO.

Đây là simplification để giảm role trong v0.1.

### Nhóm 6 — Phân bổ đa cấp và điều chuyển

| UC | Nội dung gốc | Prototype v0.1 | Trạng thái |
|---|---|---|---|
| UC22 | Net Requirement + transport constraints | SCM Regional Demand có requirement; chưa có route capacity / transport cost | PARTIALLY IMPLEMENTED |
| UC23 | Đề xuất allocation đa cấp | Có Central Allocation và regional/cross-region logic | ADAPTED FOR PROTOTYPE |
| UC24 | Internal Transfer | Có Cross-region Rebalancing | ADAPTED FOR PROTOTYPE |
| UC25 | Approval allocation / transfer | Có RM nguồn + RM đích confirmation; chưa có role approval tách riêng | ADAPTED FOR PROTOTYPE |

Điểm khác biệt lớn:

Bộ UC gốc trình bày Thu mua trước Allocation / Transfer.

Prototype hiện chọn:

```text
Shortage
→ internal / cross-region rebalancing
→ central allocation
→ external procurement
```

Mục tiêu là dùng nguồn nội bộ trước khi mua ngoài.

**PENDING TEAM DECISION:** Flow này do người dựng prototype chủ động chọn, chưa phải quyết định chính thức của nhóm.

### Nhóm 7 — Dashboard và phân tích

| UC | Nội dung gốc | Prototype v0.1 | Trạng thái |
|---|---|---|---|
| UC26 | Dashboard KPI | Dealer Dashboard + SCM Network Dashboard | PARTIALLY IMPLEMENTED |
| UC27 | Risk alerts | Có shortage / review / action center | PARTIALLY IMPLEMENTED |
| UC28 | Demand cause analysis | Forecast detail có explanatory signals | PARTIALLY IMPLEMENTED |
| UC29 | Scenario analysis | Chưa có | NOT IMPLEMENTED YET |
| UC30 | Bullwhip dashboard | Chưa có | NOT IMPLEMENTED YET |

Dashboard hiện thiên về **exception-first operational dashboard**, chưa phải toàn bộ analytics scope của UC gốc.

### Nhóm 8 — Admin

| UC | Nội dung gốc | Prototype v0.1 | Trạng thái |
|---|---|---|---|
| UC31 | Quản lý account | Chưa code | NOT IMPLEMENTED YET |
| UC32 | RBAC | Chưa có authorization thật | NOT IMPLEMENTED YET |
| UC33 | Audit log | Có trace/history trong một số domain nhưng chưa có centralized audit log | PARTIALLY IMPLEMENTED |
| UC34 | System configuration | Chưa code | NOT IMPLEMENTED YET |

Admin vẫn nằm trong roadmap và không bị loại khỏi thiết kế.

---

## 4. Nghiệp vụ prototype bổ sung ngoài UC gốc

### Manual Request của Dealer

Prototype thêm một object rõ ràng:

```text
Manual Request
```

Mục đích:

- biểu diễn nhu cầu ngoài forecast,
- không làm sai lệch forecast model,
- giữ Requested / Allocated / Remaining riêng.

Flow:

```text
Dealer Request
→ RM / Regional Warehouse
→ allocation
→ remaining shortage
→ SCM
```

Đây là **EXTENDED** functionality.

### Dealer Ownership / Rebalancing Policy

Trong quá trình thiết kế prototype đã bàn thêm các khái niệm:

- Internal Dealer
- Independent Dealer
- Partner Dealer
- Inventory Ownership
- Auto Transfer
- Consent Required
- Not Eligible

Những khái niệm này chưa được code đầy đủ trong v0.1 và cũng không phải UC riêng trong bộ gốc.

Chúng có thể trở thành extension cho UC02 / UC24 / UC25 khi nhóm thống nhất.

---

## 5. Khác biệt về actor model

### Actor model gốc

Tài liệu gốc tách:

```text
Demand/Supply Planner
Procurement Manager
Inventory/Warehouse Manager
Sales/Regional Manager
Distribution/Logistics Manager
Business/Supply Chain Manager
System Administrator
```

### Prototype

Prototype rút thành:

```text
Dealer
RM
SCM
Admin
```

Trong v0.1 chỉ Dealer và SCM có UI hoàn chỉnh.

### Ý nghĩa

Không phải các role gốc bị xóa.

Nhiều trách nhiệm hiện chỉ đang **được gộp tạm thời**.

Ví dụ SCM hiện bao gồm:

```text
Supply planning
+ Logistics/rebalancing
+ Procurement
+ Business approval
```

---

## 6. Khả năng mở rộng lại role gốc

### Đánh giá

Có thể mở rộng mà không cần viết lại toàn bộ UI/domain.

Lý do:

- Forecast, Inventory, Requirement, Transfer, Allocation, Recommendation, Supplier, PO đã là các domain object riêng.
- Router đã tách workspace.
- UI dùng component chung.
- Data access nằm sau service/query layer.

### Phần sẽ phải thay đổi nhiều hơn

1. Authentication.
2. RBAC.
3. Approval workflow.
4. Route ownership.
5. Action authorization trong service/backend.
6. Audit log tập trung.

### Ví dụ tách SCM

Hiện tại:

```text
SCM
├── Regional Demand
├── Rebalancing
├── Central Allocation
├── Procurement
├── Supplier
└── PO Approval
```

Tương lai:

```text
Demand/Supply Planner
├── Regional Demand
└── Allocation Planning

Distribution/Logistics Manager
└── Rebalancing

Procurement Manager
├── Purchase Recommendation
├── Supplier Comparison
└── PO Creation

Business/Supply Chain Manager
├── Network Dashboard
├── Allocation Approval
└── PO Approval
```

Phần lớn màn hình có thể tái sử dụng; chủ yếu đổi permission, route và ownership.

---

## 7. Những điểm nhóm cần quyết định

### Decision 1 — Supply orchestration

Chọn:

```text
A. Procurement trước Allocation
```

hay:

```text
B. Rebalancing / Central Allocation trước Procurement
```

Prototype hiện dùng B.

### Decision 2 — Dealer direct user

Chọn:

```text
A. Dealer đăng nhập và thao tác trực tiếp
```

hoặc:

```text
B. Dealer chỉ là node/market actor; dữ liệu đi qua Sales/RM/API/POS
```

Prototype hiện dùng A.

### Decision 3 — Role granularity

Chọn:

- tiếp tục Dealer/RM/SCM/Admin,
- hoặc tách dần về gần role model của 34 UC.

### Decision 4 — Approval model

Cần quyết định:

- SCM có được tự approve PO không?
- Procurement Manager và Approver có phải tách?
- Allocation/transfer có cần approver độc lập?

---

## 8. Khuyến nghị trước khi backend hóa

Không nên backend hóa role simplification như một assumption cố định.

Nên:

1. Giữ entity theo nghiệp vụ.
2. Tạo capability/permission riêng.
3. Role chỉ map vào capability.
4. Approval giữ creator/approver tách field.
5. Audit mọi override.
6. Không overwrite giá trị upstream.
7. Chốt 4 Pending Team Decisions ở trên trước khi thiết kế authorization/schema cuối.

---

## 9. Kết luận

Prototype-v0.1 **không đi ra ngoài đề tài**, nhưng không phải implementation 1:1 của 34 UC.

Nó là:

- một **subset** của UC gốc,
- có **actor simplification**,
- có **flow adaptation**,
- có một số **extension** để demo end-to-end,
- và vẫn còn nhiều UC trong roadmap.

Do đó khi trình bày prototype cần dùng cách diễn đạt:

> “Prototype v0.1 hiện thực một lát cắt nghiệp vụ ưu tiên để kiểm chứng flow Dealer → RM → SCM. Một số actor và approval được gộp để giảm độ phức tạp triển khai. Bộ 34 UC vẫn được giữ làm baseline cho phạm vi hệ thống, và các khác biệt hiện tại được ghi nhận để nhóm xác nhận trước các giai đoạn backend/RBAC tiếp theo.”
