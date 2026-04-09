# Plain Male Specification

## 1. Vai trò

Nam là nhân vật chính đi từ trái vào trung tâm để gặp nữ.

## 2. Vị trí và hướng di chuyển

- Điểm bắt đầu: ngoài khung hình bên trái.
- Hướng di chuyển: từ trái sang phải.
- Điểm kết thúc: vùng trung tâm, vị trí ghép cặp với nữ.
- Nhân vật phải nằm ở một dải riêng bên dưới trái tim, không chồng vào vùng tim.
- Mép trên của nhân vật nên cách đáy trái tim một khoảng nhỏ ổn định để nhìn rõ là đang chạy bên dưới tim.

## 3. Dạng hiển thị

- Asset di chuyển chính là [icons/boy_walk.png](icons/boy_walk.png).
- Đây là sprite sheet dùng để cắt các frame chuyển động đi hoặc chạy.
- Không dùng [icons/man_single.png](icons/man_single.png) cho pha di chuyển chính nữa, chỉ giữ làm asset dự phòng nếu cần.
- Nhìn tổng thể phải dễ phân biệt là nhân vật nam.
- Kích thước hiển thị cuối cùng của nhân vật phải được thu nhỏ còn khoảng `1/3` kích thước trái tim.

## 4. Cắt sprite từ boy_walk.png

- Code phải cắt frame trực tiếp từ [icons/boy_walk.png](icons/boy_walk.png).
- Ưu tiên giả định sprite sheet xếp ngang nếu file chỉ có một hàng frame.
- Nếu sprite sheet là dạng lưới, logic phải cho phép cấu hình thêm `rows` và `columns`.
- Mỗi frame phải có cùng kích thước.
- Cấu hình tối thiểu cần có:
  - `frameCount`
  - `frameWidth`
  - `frameHeight`
  - `frameStepInterval`
  - `moveSpeed`
- Nếu sprite sheet là 1 hàng, công thức cắt chuẩn là:
  - `frameWidth = image.width / frameCount`
  - `frameHeight = image.height`
  - `sourceX = currentFrame * frameWidth`
  - `sourceY = 0`

## 5. Animation chuyển động

- Chuyển động chính là đi hoặc chạy vào giữa.
- Dùng sprite animation cắt từ `boy_walk.png`.
- Tốc độ phát khung hình chuẩn: đổi 1 frame sau mỗi 2 bước hoặc 2 tick chuyển động.
- Phải có cấu hình cho:
  - `frameCount`
  - `frameStepInterval = 2`
  - `moveSpeed`
  - `scale = heartVisualSize / 3`
- Trong lúc nam chạy, frame phải thay đổi liên tục để thể hiện đang di chuyển thật, không được kéo nguyên sprite tĩnh.

## 6. Nhịp chuyển động

- Giai đoạn đầu tăng tốc nhẹ.
- Giai đoạn gần chạm trung tâm thì giảm tốc nhẹ.
- Không được trượt ngang như một ảnh tĩnh.
- Chuyển động phải thể hiện cảm giác đang di chuyển thật.
- Phải quay mặt vào trung tâm, tức là hướng nhìn về phía nữ.

## 7. Đồng bộ với các thực thể khác

- Nam bắt đầu đi sau khi cảnh khởi động ổn định.
- Trong lúc nam di chuyển, trái tim tiếp tục hình thành bằng mưa rơi.
- Nam chỉ dừng hẳn đúng tại điểm gặp nữ.
- Điểm gặp nhau nằm bên dưới tâm trái tim.
- Khi dừng, nam phải nằm trong vùng cặp đôi ở dưới tim, không lấn vào vùng fill của tim.

## 8. Dữ liệu icon

- File di chuyển chính: [icons/boy_walk.png](icons/boy_walk.png).
- File dự phòng: [icons/man_single.png](icons/man_single.png).
- Logic timeline phải ưu tiên `boy_walk.png` để cắt frame chuyển động.
- Nếu `boy_walk.png` thiếu metadata, code phải cho phép cấu hình số frame bằng tay thay vì sửa toàn bộ logic animation.