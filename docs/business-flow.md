# Business Flow

Tài liệu này mô tả flow nghiệp vụ của prototype AgriForecast v0.1 và chỉ rõ các điểm đang khác với bộ 34 Use Case gốc.

## 1. Flow tổng thể của prototype

```text
Dealer
  ↓
Forecast Adjustment / Manual Request
  ↓
Regional Manager (planned UI, currently represented by mock data)
  ↓
Regional allocation / regional shortage handling
  ↓
Remaining Need
  ↓
SCM
  ↓
Cross-region Rebalancing
  ↓
Central Allocation
  ↓
External Procurement
  ↓
Supplier Selection
  ↓
PO Draft
  ↓
PO Approval
```

## 2. Dealer flow

### 2.1 Forecast flow

```text
System Forecast
  ↓
Dealer review
  ├─ Keep System Forecast
  └─ Dealer Adjusted Forecast + Reason
          ↓
      Final Planning Value
```

Rules:

- System Forecast không bị overwrite.
- Nếu Dealer không điều chỉnh:
  - `Final Planning = System Forecast`
- Nếu Dealer điều chỉnh:
  - `Final Planning = Dealer Adjusted`
- Khi điều chỉnh khác System Forecast phải có lý do.

### 2.2 Manual Request flow

Manual Request đại diện cho **nhu cầu phát sinh ngoài forecast**, không phải forecast adjustment.

```text
Dealer creates Manual Request
  ↓
Sent
  ↓
Regional Manager / Regional Warehouse acknowledges
  ↓
Regional allocation
  ├─ Fulfilled
  ├─ Partial
  └─ Unable
  ↓
Remaining quantity, nếu còn
  ↓
Escalate to SCM
```

Dealer luôn thấy riêng:

- Requested Qty
- Allocated Qty
- Remaining Qty

Prototype không overwrite Requested Qty sau khi RM/SCM xử lý.

## 3. Regional Manager flow

RM chưa có UI riêng trong v0.1, nhưng flow nghiệp vụ đã được dùng để tạo dữ liệu đầu vào cho SCM.

Dự kiến:

```text
Dealer Final Planning
+ Dealer Manual Request
  ↓
Regional Effective Demand
  ↓
Compare with regional available stock
  ↓
Regional Allocation
  ↓
Check eligible internal rebalancing
  ↓
Remaining Need
  ↓
Send to SCM
```

Các rule đã bàn:

- RM không sửa Requested Qty của Dealer.
- RM ghi Allocated Qty riêng.
- Remaining = Requested - Allocated.
- Nếu Dealer/node nội bộ dư hàng và policy cho phép, RM có thể tạo transfer.
- Nếu Dealer độc lập sở hữu hàng riêng, lượng hàng đó không được tự động coi là nguồn hàng của doanh nghiệp.
- Transfer từ nguồn cần consent phải có bước xác nhận phù hợp.

## 4. SCM flow

### 4.1 Regional Demand

SCM nhận **Remaining Need** sau xử lý cấp vùng.

```text
Dealer Effective Demand
→ RM Requested
→ SCM Override (optional)
→ Effective Remaining Need
```

Rules:

- RM Requested được giữ nguyên.
- SCM Override lưu riêng.
- Nếu SCM Override khác RM Requested thì lý do là bắt buộc.

### 4.2 Cross-region Rebalancing

Prototype ưu tiên kiểm tra nguồn dư giữa các vùng trước khi dùng Kho Trung tâm.

```text
SCM creates transfer proposal
  ↓
Source RM confirms
  ↓
Destination RM confirms
  ↓
Ready for Transfer
```

Nếu một RM không đồng ý:

```text
Revision Requested
→ alternative quantity/date
→ SCM reviews again
```

Một proposal chưa được cả hai phía xác nhận không nên được hiểu là inventory movement đã hoàn tất.

### 4.3 Central Allocation

Sau cross-region:

```text
Remaining After Rebalancing
  ↓
Check Central Available
  ↓
Suggested Allocation
  ↓
SCM Final Allocation
  ↓
Remaining After Central
```

SCM không được phân bổ vượt quá Central Available.

### 4.4 Procurement

Chỉ phần thiếu sau internal balancing và central allocation mới đi sang purchase recommendation.

```text
Remaining After Central
  ↓
Purchase Recommendation
  ↓
SCM reviews recommended quantity
  ↓
Supplier Comparison
  ↓
Supplier Selected
  ↓
PO Draft
  ↓
Approve PO
```

Prototype cho SCM vừa tạo vừa approve PO.

Đây là simplification của v0.1, không phải kết luận rằng bản cuối cùng sẽ không tách Procurement Manager / Approver.

## 5. Prototype flow khác bộ UC gốc ở đâu?

### 5.1 Thứ tự Rebalancing và Procurement

Bộ 34 UC gốc trình bày:

```text
Forecast
→ Inventory
→ Procurement
→ Allocation / Transfer
→ Dashboard
```

Prototype hiện dùng:

```text
Forecast / Demand
→ Regional Allocation
→ Internal / Cross-region Rebalancing
→ Central Allocation
→ External Procurement
```

Lý do của prototype:

- Tận dụng hàng có sẵn trong mạng lưới trước.
- Chỉ mua ngoài phần shortage cuối cùng.
- Giảm nguy cơ mua thêm trong khi một vùng/node khác đang dư.

**Trạng thái quyết định:** Pending Team Decision.

Đây là quyết định cá nhân khi dựng prototype, cần nhóm xem và quyết định giữ hay quay về orchestration khác.

## 6. Dealer Direct User là một thay đổi prototype

Tài liệu gốc không bắt buộc Dealer là user trực tiếp.

Prototype tạo Dealer Workspace vì cần biểu diễn rõ:

- tín hiệu nhu cầu ở đầu mạng lưới,
- forecast adjustment,
- tồn kho tại Dealer,
- nhu cầu phát sinh ngoài forecast.

**Trạng thái quyết định:** Pending Team Decision.

Nhóm cần quyết định:

- giữ Dealer là direct user,
- hay Dealer chỉ là node/market actor và dữ liệu được nhập qua RM/Sales/POS/API.

## 7. Luồng approval hiện tại

### Prototype

```text
Cross-region:
SCM propose
→ Source RM confirm
→ Destination RM confirm

PO:
SCM create
→ SCM approve
```

### Hướng mở rộng

Khi tách role gần 34 UC gốc:

```text
Purchase Recommendation
→ Procurement Manager prepares PO
→ Business / Supply Chain Manager approves
```

Tương tự, allocation/transfer approval có thể tách khỏi người lập phương án.

## 8. Luồng dữ liệu cần giữ khi backend hóa

Không nên chỉ lưu trạng thái cuối.

Nên giữ decision trace như:

```text
System Forecast
Dealer Adjusted
Final Planning

Dealer Requested
RM Allocated
Dealer Remaining

RM Requested
SCM Override

Cross-region proposed / confirmed
Central suggested / final
Purchase shortage / recommended / ordered
```

Điều này cần cho:

- audit,
- explainability,
- đánh giá forecast,
- phân tích override,
- xác định trách nhiệm khi số liệu thay đổi.
