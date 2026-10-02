# Glossary and Calculations

Tài liệu này giải thích các thuật ngữ, viết tắt và công thức đang xuất hiện trong AgriForecast prototype-v0.1.

> Lưu ý: một số công thức dưới đây là **quy ước hiện tại của prototype**, không phải lúc nào cũng được bộ UC gốc định nghĩa chi tiết.

## 1. Thuật ngữ chung

### SCM

**Supply Chain Management / Supply Chain Manager**

Trong prototype, SCM là workspace cấp mạng lưới chịu trách nhiệm:

- xem nhu cầu vùng,
- điều chỉnh nhu cầu,
- điều chuyển liên vùng,
- phân bổ Kho Trung tâm,
- mua ngoài,
- chọn nhà cung cấp,
- tạo và approve PO.

Trong bản mở rộng tương lai, các trách nhiệm này có thể được tách lại cho Supply Planner, Procurement Manager, Logistics Manager và Business/Supply Chain Manager.

### RM

**Regional Manager**

Role trung gian giữa Dealer và SCM.

RM dự kiến:

- nhận nhu cầu từ Dealer,
- phân bổ cấp vùng,
- xử lý shortage trong vùng,
- gửi Remaining Need lên SCM,
- xác nhận transfer liên vùng.

### Dealer

Đại lý / đơn vị phân phối ở đầu mạng lưới.

Trong prototype, Dealer là user trực tiếp.

### SKU

**Stock Keeping Unit**

Mã nhận diện một mặt hàng/vật tư cụ thể.

### PO

**Purchase Order**

Đơn mua hàng gửi nhà cung cấp.

### MOQ

**Minimum Order Quantity**

Số lượng đặt hàng tối thiểu do nhà cung cấp yêu cầu.

Ví dụ:

```text
Shortage = 10 tấn
MOQ = 20 tấn
Recommended Order Qty = 20 tấn
```

Do đó lượng đặt có thể lớn hơn shortage.

### Lead Time

Thời gian từ khi phát hành/yêu cầu cung ứng đến khi hàng có thể sẵn sàng tại điểm nhận.

### ROP

**Reorder Point**

Ngưỡng kích hoạt nhu cầu bổ sung hàng.

Theo yêu cầu nghiệp vụ gốc, ROP cần được xác định dựa trên nhu cầu trong lead time và Safety Stock.

Mô hình khái niệm:

```text
ROP ≈ Demand During Lead Time + Safety Stock
```

Prototype hiện dùng các giá trị ROP mock; chưa triển khai engine tính ROP động.

### Safety Stock

Tồn kho an toàn nhằm hấp thụ biến động nhu cầu / lead time.

Prototype v0.1 chưa triển khai Dynamic Safety Stock engine.

### FEFO

**First Expired, First Out**

Ưu tiên xuất lô có hạn dùng gần nhất trước.

Prototype hiện có expiry date nhưng chưa triển khai đầy đủ lot-level FEFO.

### OTIF

**On Time In Full**

Tỷ lệ giao hàng đúng thời gian và đủ số lượng.

Có trong phạm vi KPI của UC gốc; prototype hiện chưa triển khai KPI OTIF hoàn chỉnh.

### RBAC

**Role-Based Access Control**

Phân quyền dựa trên vai trò.

Prototype chưa có RBAC thật.

### Bullwhip

Hiện tượng biến động đơn hàng ở cấp trên lớn hơn biến động nhu cầu thực tế ở cấp dưới.

Bộ UC gốc yêu cầu bullwhip index theo ý tưởng:

```text
Bullwhip Index = Var(Order) / Var(Demand)
```

Prototype v0.1 chưa triển khai UC này.

## 2. Thuật ngữ tồn kho

### On-hand

Lượng hàng vật lý đang có tại kho/node.

Ví dụ:

```text
On-hand = 110 tấn
```

### Incoming / In-transit

Lượng hàng đang trên đường về hoặc đã được xác nhận sẽ về.

Trong prototype, Incoming **không tự động được cộng vào Available**.

### Allocated

Lượng hàng hiện tại đã được giữ/chỉ định cho nhu cầu khác.

### Committed

Khái niệm lượng hàng đã cam kết cho order/requirement.

Bộ UC gốc yêu cầu Inventory Position xét allocated/committed. Prototype Dealer hiện chỉ có trường `allocated`.

### Available

Trong Dealer prototype hiện tại:

```text
Available = On-hand - Allocated
```

Ví dụ:

```text
On-hand = 110
Allocated = 65

Available = 110 - 65 = 45
```

Incoming được hiển thị riêng.

Đây là quy ước prototype hiện tại, không phải toàn bộ công thức Inventory Position của hệ thống cuối.

### Inventory Position

Khái niệm vị thế tồn kho tổng hợp.

Bộ UC gốc yêu cầu theo dõi tối thiểu:

- on-hand,
- on-order / in-transit,
- allocated / committed.

Tài liệu UC không khóa một công thức duy nhất cho prototype.

### Coverage Days

Số ngày ước tính mà tồn kho hiện tại có thể đáp ứng nhu cầu.

Prototype hiện lưu Coverage Days dưới dạng mock value.

Chưa có công thức production chính thức, vì vậy tài liệu này **không tự giả định cách tính**.

## 3. Forecast

### System Forecast

Forecast do hệ thống / model tạo.

### Dealer Adjusted Forecast

Forecast do Dealer điều chỉnh thủ công.

### Final Planning Value

Giá trị dùng cho kế hoạch tiếp theo.

Prototype:

```text
Nếu dealerAdjusted = null:
    Final Planning = System Forecast

Nếu dealerAdjusted có giá trị:
    Final Planning = Dealer Adjusted
```

System Forecast không bị overwrite.

### Forecast Variance

Trong UI dùng để biểu diễn mức biến động forecast so với baseline / kỳ tham chiếu.

Chi tiết baseline phụ thuộc dữ liệu mock hiện tại.

### MAPE

**Mean Absolute Percentage Error**

Công thức khái niệm:

```text
MAPE = mean(|Actual - Forecast| / |Actual|) × 100%
```

Prototype hiện có một số giá trị error mock để minh họa; chưa có pipeline tính MAPE production.

## 4. Dealer Manual Request

### Requested Qty

Số lượng Dealer yêu cầu ban đầu.

Không được overwrite bởi phân bổ sau đó.

### Allocated Qty

Số lượng đã được cấp.

### Remaining Qty

Prototype:

```text
Remaining Qty = Requested Qty - Allocated Qty
```

Ví dụ:

```text
Requested = 80
Allocated = 30
Remaining = 50
```

### Request State

Prototype hiện có:

- Sent
- Acknowledged

### Fulfillment State

Tách riêng khỏi Request State:

- Pending
- Partial
- Fulfilled
- Unable

Điều này giúp phân biệt:

- yêu cầu đã được tiếp nhận hay chưa,
- yêu cầu đã được cấp hàng đến mức nào.

## 5. Regional Requirement / SCM

### Dealer Effective Demand

Nhu cầu hiệu lực tổng hợp từ Dealer trong một vùng.

Ở prototype SCM, đây là dữ liệu đầu vào đã được RM tổng hợp/mô phỏng.

### RM Requested

Số lượng RM xác định cần gửi lên SCM sau xử lý cấp vùng.

Giữ immutable trong flow SCM.

### SCM Override

Số lượng SCM điều chỉnh so với RM Requested.

Nếu khác RM Requested thì prototype yêu cầu nhập lý do.

### Effective Remaining Need

Nếu không có SCM Override:

```text
Effective Requirement = RM Requested
```

Nếu có SCM Override:

```text
Effective Requirement = SCM Override
```

Sau đó:

```text
Remaining Need =
max(0, Effective Requirement - Regional Available)
```

Ví dụ:

```text
RM Requested = 160
SCM Override = 140
Regional Available = 60

Remaining Need = 140 - 60 = 80
```

## 6. Cross-region Rebalancing

### Source Surplus

Nguồn dư có thể cấp từ vùng nguồn.

### Destination Need

Nhu cầu chưa được đáp ứng tại vùng đích.

### Proposed Qty

Số lượng SCM đề xuất điều chuyển.

### Confirmed Qty

Số lượng được xác nhận sau khi RM nguồn và RM đích đồng ý.

Prototype status:

```text
Draft
→ Waiting Source RM
→ Waiting Destination RM
→ Ready
→ Completed
```

Có thể đi qua:

```text
Revision Requested
```

## 7. Central Allocation

### Remaining After Rebalancing

```text
Remaining After Rebalancing =
Remaining Need - Confirmed/Planned Rebalancing Allocation
```

### Central Available

Lượng hàng Kho Trung tâm có thể dùng cho phân bổ.

### Suggested Allocation

Số lượng hệ thống đề xuất cấp từ Kho Trung tâm.

### SCM Final Allocation

Số lượng SCM quyết định cấp cuối cùng.

### Remaining After Central

```text
Remaining After Central =
Remaining After Rebalancing - SCM Final Allocation
```

Ví dụ:

```text
Remaining Need = 80
Cross-region = 50

Remaining After Rebalancing = 30

Central Allocation = 20

Remaining After Central = 10
```

## 8. External Procurement

Purchase Recommendation chỉ nên được sinh ra cho phần thiếu sau:

```text
Regional processing
+ Cross-region Rebalancing
+ Central Allocation
```

### Remaining Shortage

Phần thiếu thực tế cần mua ngoài.

### Recommended Qty

Số lượng đề xuất mua.

Có thể:

```text
Recommended Qty > Remaining Shortage
```

khi MOQ yêu cầu lượng đặt tối thiểu lớn hơn shortage.

## 9. Full reconciliation

Prototype SCM cố gắng bảo toàn:

```text
Unresolved Shortage =
max(
  0,
  Remaining Need
  - Rebalancing Allocated
  - Central Allocated
  - Procurement Ordered
)
```

Ví dụ:

```text
Remaining Need = 80
Rebalancing = 50
Central = 20
Procurement = 10

Unresolved = 80 - 50 - 20 - 10 = 0
```

## 10. PO calculations

### PO Line Total

```text
Line Total = Quantity × Unit Price
```

### PO Grand Total

```text
PO Grand Total = Sum(Line Total)
```

Prototype lưu:

- Created By
- Created At
- Approved By
- Approved At

để minh họa auditability.

## 11. Planned vs Secured Supply

Một điểm cần phân biệt:

### Planned Supply

Đã có phương án nhưng chưa chắc đã thực hiện xong:

- transfer đang chờ RM xác nhận,
- purchase recommendation chưa approve,
- PO draft.

### Secured Supply

Nguồn đã được xác nhận ở mức đủ tin cậy theo business rule:

- transfer đã ready/completed,
- central allocation đã final,
- PO đã approved.

Vì vậy KPI:

```text
Thiếu hụt chưa có phương án = 0
```

không nhất thiết có nghĩa toàn bộ hàng đã physically available.

## 12. Các phép tính chưa được chốt

Không tự suy công thức production cho:

- Dynamic Safety Stock
- Coverage Days
- Service Level
- Inventory Turnover
- OTIF
- Forecast Bias
- Route Cost Optimization
- Route Capacity Optimization
- Scenario Analysis

Các phần này cần nhóm chốt rule/dataset trước khi backend hóa.
