# Plain Couple Specification

## 1. Vai trò

File này mô tả thực thể phối hợp giữa nam và nữ. Đây là logic dùng để đồng bộ hai nhân vật chính với nhau và với trái tim.

## 2. Mục tiêu phối hợp

- Nam đi từ trái vào.
- Nữ đi từ phải vào.
- Cả hai gặp nhau ở trung tâm.
- Thời điểm chạm nhau phải trùng với thời điểm trái tim hoàn chỉnh 100%.

## 3. Quy chuẩn đồng bộ thời gian

- Tổng animation một vòng nên nằm trong khoảng 10 đến 14 giây.
- Mốc chạm nhau nên rơi vào khoảng 70% đến 78% timeline.
- Mốc hoàn thiện trái tim phải bằng đúng mốc chạm nhau.
- Sau mốc đó mới bắt đầu chuyển màu nền và màu tim.

## 4. Chuyển động của cặp đôi

- Hai nhân vật đi theo hướng đối xứng từ hai bên.
- Tốc độ đầu vừa phải.
- Giữa đường có thể tăng nhịp nhẹ.
- Khi sắp chạm nhau phải giảm tốc nhẹ để điểm tiếp xúc nhìn rõ.
- Sau khi chạm nhau, cả hai đứng lại hoặc có một nhịp nghiêng người nhẹ.

## 5. Điểm chạm

- Điểm chạm nằm gần giữa màn hình theo trục ngang.
- Tại thời điểm chạm nhau, không được có độ lệch khiến một người tới quá sớm.
- Khoảnh khắc này là trigger cho:
  - hoàn thành trái tim,
  - chuyển background sang hồng nhạt,
  - chuyển trái tim sang hồng đậm.

## 6. Background

Trước điểm chạm:
- Background tối với gradient đen, đỏ mận hoặc tím rất tối.

Sau điểm chạm:
- Background chuyển sang hồng nhạt.
- Tông gợi ý: #ffd9e6, #ffe4ee, #fff0f5.
- Chuyển màu phải mượt, không nháy gắt.

## 7. Quy chuẩn sprite cho cặp đôi

- Nam và nữ đều dùng sprite animation 20 hình.
- Mỗi 2 bước hoặc 2 tick thì đổi sang frame kế tiếp.
- Logic điều phối phải cho phép nam và nữ dùng sprite riêng, nhưng vẫn đồng bộ thời điểm chạm nhau.

## 8. Dữ liệu icon

- Người dùng sẽ cung cấp icon hoặc sprite của nam, nữ, trái tim và thực thể ghép đôi sau.
- Hệ thống code phải chuẩn bị chỗ để gắn asset thật mà không đổi đặc tả chuyển động.