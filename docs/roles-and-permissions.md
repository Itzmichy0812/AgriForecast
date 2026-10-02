# Roles and Permissions

Tài liệu này mô tả role hiện tại của prototype và mapping với role trong bộ 34 Use Case gốc.

## 1. Role của prototype

### Dealer

Chức năng hiện có:

- Xem dashboard đại lý.
- Xem forecast.
- Điều chỉnh forecast.
- Xem tồn kho.
- Tạo Manual Request.
- Theo dõi request và fulfillment.

Dealer là direct user trong prototype.

> Đây là quyết định prototype, chưa phải quyết định cuối cùng của nhóm.

### Regional Manager (RM)

Chưa có UI riêng trong v0.1.

Business responsibility dự kiến:

- Tổng hợp demand trong vùng.
- Phân bổ hàng từ kho vùng.
- Điều chuyển nội vùng.
- Gửi Remaining Need lên SCM.
- Xác nhận transfer liên vùng do SCM đề xuất.

### SCM

SCM hiện là role được gộp nhiều trách nhiệm nhất:

- Network dashboard.
- Xem Regional Requirement.
- Điều chỉnh nhu cầu vùng.
- Cross-region rebalancing.
- Central allocation.
- Procurement recommendation.
- Supplier comparison.
- PO creation.
- PO approval.

### Admin

Chưa code trong v0.1.

Phạm vi dự kiến:

- User/account.
- Role/permission.
- Master data.
- Network / Dealer configuration.
- System settings.
- Audit log.

## 2. Role trong bộ UC gốc

Bộ UC gốc mô tả các actor nghiệp vụ:

- Demand/Supply Planner
- Procurement Manager / Procurement Officer
- Inventory/Warehouse Manager
- Sales/Regional Manager
- Distribution/Logistics Manager
- Business/Supply Chain Manager
- IT/System Administrator

Ngoài ra còn các market/external actor như:

- Supplier
- Dealer / Regional Distributor
- Farm / Plantation / Livestock Operator
- Weather / Pest Data Provider

## 3. Mapping Prototype → UC gốc

| Prototype role | Trách nhiệm đang gộp | Role gốc gần nhất |
|---|---|---|
| Dealer | Forecast review, local inventory, manual request | Dealer / Sales signal source / một phần Planner |
| RM | Regional demand, regional allocation, regional transfer | Sales/Regional Manager + Inventory/Warehouse + một phần Supply Planner |
| SCM | Network planning, transfer, allocation, procurement, approval | Supply Planner + Logistics Manager + Procurement Manager + Business/SCM Manager |
| Admin | Account, role, master, config, audit | System Administrator |

## 4. Vì sao prototype giảm số role?

Mục tiêu của v0.1 là:

- Dựng được flow end-to-end.
- Giảm số workspace cần code.
- Cho nhóm xem logic nghiệp vụ trước khi đầu tư vào RBAC.
- Tránh sinh nhiều actor khi backend và authorization chưa có.

Đây là **prototype simplification**, không phải quyết định loại bỏ các role của tài liệu gốc.

## 5. Có thể mở rộng lại các role gốc không?

Có.

Phần lớn domain object hiện đã tách theo nghiệp vụ:

- Forecast
- Inventory
- Manual Request
- Regional Requirement
- Transfer
- Central Allocation
- Purchase Recommendation
- Supplier
- Purchase Order

Do đó khi tách role, phần thay đổi chính sẽ là:

### 5.1 Navigation / route ownership

Ví dụ:

```text
/scm/procurement
```

có thể về sau chuyển thành:

```text
/procurement/recommendations
/procurement/suppliers
/procurement/purchase-orders
```

Domain data không nhất thiết phải đổi.

### 5.2 Permission

Hiện chưa có RBAC thật.

Đây sẽ là phần cần thiết kế kỹ nhất khi mở rộng.

### 5.3 Approval separation

Hiện SCM có thể tạo và approve PO.

Khi tách role:

```text
Procurement Manager
→ tạo / submit PO

Business / Supply Chain Manager
→ approve / reject PO
```

Tương tự với allocation và transfer.

## 6. Capability model đề xuất

Để tránh hard-code theo role, nên định nghĩa permission theo action.

Ví dụ:

```text
forecast.view
forecast.run
forecast.adjust

inventory.view
inventory.manage

request.create
request.allocate

requirement.view
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

dashboard.view

admin.manage_users
admin.manage_roles
admin.manage_master_data
admin.manage_config
admin.view_audit
```

Role chỉ là tập các capability.

## 7. Mapping capability dự kiến

### Dealer

```text
forecast.view
forecast.adjust
inventory.view
request.create
```

### RM

```text
forecast.view
inventory.view
request.allocate
requirement.aggregate
transfer.confirm
allocation.plan
```

### SCM prototype hiện tại

```text
requirement.view
requirement.override
transfer.propose
allocation.plan
allocation.approve
procurement.recommend
procurement.select_supplier
po.create
po.approve
dashboard.view
```

### Admin

```text
admin.manage_users
admin.manage_roles
admin.manage_master_data
admin.manage_config
admin.view_audit
```

## 8. Mapping khi mở rộng về gần bộ UC gốc

### Demand/Supply Planner

```text
forecast.view
forecast.run
forecast.adjust
requirement.view
allocation.plan
```

### Procurement Manager

```text
procurement.recommend
procurement.select_supplier
po.create
```

### Inventory/Warehouse Manager

```text
inventory.view
inventory.manage
transfer.propose
```

### Distribution/Logistics Manager

```text
transfer.propose
transfer.confirm
allocation.plan
```

### Business/Supply Chain Manager

```text
dashboard.view
requirement.view
allocation.approve
transfer.approve
po.approve
```

## 9. Admin roadmap

Admin nên bao phủ tối thiểu các nhóm chức năng tương ứng UC31–UC34:

- Quản lý account.
- RBAC.
- Audit log.
- System configuration.

Ngoài ra prototype đã bàn thêm:

- Dealer Type.
- Inventory Ownership.
- Rebalancing Policy.
- Dealer → Regional Warehouse mapping.

Các policy này phục vụ bài toán:

- Internal Dealer
- Independent Dealer
- Partner / consent-required Dealer

## 10. Quyết định còn mở

Nhóm cần thống nhất:

1. Dealer có phải direct user ở bản cuối không?
2. RM có là một role độc lập hay chỉ là Sales/Regional Manager?
3. Procurement có tách khỏi SCM không?
4. Logistics có tách khỏi SCM không?
5. PO có yêu cầu separation of duties giữa creator và approver không?
6. Allocation/transfer approval cần role nào phê duyệt?

Các điểm này chưa nên hard-code vào backend trước khi nhóm thống nhất.
