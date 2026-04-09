# Plain Heart Specification

## 1. Vai trò

Trái tim là thực thể trung tâm của cảnh. Đây là đối tượng lớn nhất và là mốc cảm xúc chính của animation.

## 2. Kích thước và vị trí

- Khi hoàn chỉnh, trái tim chiếm khoảng 28% đến 36% chiều rộng màn hình.
- Chiều cao trái tim khoảng 30% đến 40% chiều cao màn hình.
- Tâm trái tim nằm gần giữa màn hình theo trục ngang và cao hơn đầu nhân vật.
- Trái tim không được bị nhân vật che kín.

## 3. Hình dáng

- Đối xứng theo trục dọc.
- Hai đỉnh trên tròn mềm.
- Phần đáy nhọn vừa phải, không kéo quá dài.
- Khi hình thành xong phải đọc rõ là hình trái tim ngay lập tức.

## 4. Màu sắc

Trước khi hoàn thành:
- Màu chủ đạo: đen than hoặc đen tím rất nhẹ.
- Tông gợi ý: #0b0a0f, #171119, #2d2430.
- Glow nếu có phải rất yếu.

Sau khi hoàn thành:
- Chuyển sang hồng đậm.
- Tông gợi ý: #e83f7a, #ff4f8b.
- Có thể thêm lõi sáng hoặc viền sáng nhẹ nhưng thân chính vẫn là hồng đậm.

## 5. Hiệu ứng hình thành

Trái tim phải được hình thành bằng hiệu ứng mưa rơi.

### 5.1. Quy chuẩn mưa rơi

- Các phần tử xuất phát từ phía trên vùng trái tim.
- Chuyển động rơi theo phương dọc từ trên xuống.
- Khi rơi đến vùng mục tiêu, từng phần tử bám vào đúng vị trí để tạo thành trái tim.
- Không dùng hiệu ứng tụ từ mọi hướng; ưu tiên cảm giác như mưa đang lấp đầy hình.

### 5.1.1. Cách triển khai đúng cho hiệu ứng này

- Không triển khai trái tim mưa rơi bằng sprite animation kiểu frame-by-frame truyền thống.
- Dùng file [icons/heart.svg](icons/heart.svg) như shape đích để lấy hình trái tim và dữ liệu các chấm quanh tim.
- Từ file SVG này, hệ thống phải lấy được hai nhóm dữ liệu:
	- shape chính của trái tim,
	- các chấm quanh trái tim.
- Các chấm quanh trái tim là nguồn particle chính cho animation.
- Mỗi hạt mưa sẽ bắt đầu từ phía trên khu vực trái tim và rơi xuống theo trục dọc.
- Khi hạt chạm tới một điểm đích hợp lệ trong shape trái tim, hạt dừng lại hoặc bám vào điểm đó.
- Nhiều chấm nối tiếp nhau sẽ dần lấp đầy hình, tạo cảm giác trái tim đang được dựng lên từ mưa rơi.
- Hướng tiếp cận này là effect-based animation bằng JavaScript hoặc canvas, không phải sprite tim nhiều frame.

### 5.1.2. Vai trò của file SVG

- File [icons/heart.svg](icons/heart.svg) không phải chuỗi frame animation.
- File này được dùng làm mẫu hình chuẩn của trái tim hoàn chỉnh và cũng là nguồn dữ liệu chấm phụ quanh tim.
- Hệ thống có thể đọc path của SVG để xác định vùng trái tim chính.
- Hệ thống cũng phải đọc được các chấm quanh tim trong SVG để dùng chúng làm particle hoặc anchor point.
- Từ dữ liệu đó, hệ thống chọn ra các điểm đích để particle bám vào trong quá trình dựng hình.
- Khi đạt đủ mật độ hoặc đủ số điểm đích đã được lấp đầy, hệ thống chuyển sang trạng thái trái tim hoàn chỉnh.

### 5.2. Tiến trình

Giai đoạn đầu:
- Mật độ hạt thấp.
- Chỉ thấy vài vệt hoặc điểm tối đang rơi.

Giai đoạn giữa:
- Mật độ tăng lên.
- Đường viền trái tim dần hiện ra trước, sau đó phần khối bên trong được lấp đầy.

Giai đoạn cuối:
- Toàn bộ hình trái tim đạt đủ mật độ để nhìn rõ.
- Mốc này phải trùng với thời điểm nam và nữ chạm nhau.

### 5.2.1. Quy tắc lấp đầy hình

- Có thể ưu tiên làm hiện đường viền ngoài trước, sau đó mới lấp phần bên trong.
- Cũng có thể lấp đầy theo thứ tự từ trên xuống dưới nếu muốn nhấn mạnh cảm giác mưa rơi.
- Dù chọn cách nào, kết quả cuối phải cho thấy trái tim được hình thành dần bằng sự tích tụ của các hạt rơi từ trên xuống.
- Không được để trái tim xuất hiện nguyên khối quá sớm khi quá trình mưa rơi còn đang diễn ra.
- Các hạt dùng để dựng hình nên ưu tiên sinh ra từ dữ liệu các chấm quanh trái tim trong SVG.
- Khi cần tăng mật độ, có thể clone hoặc nội suy thêm các chấm phụ, nhưng phải giữ ngôn ngữ hình ảnh nhất quán với các chấm gốc quanh tim.

### 5.3. Trạng thái hoàn chỉnh bằng SVG

- Khi trái tim đạt 100%, hệ thống chuyển sang trạng thái hiển thị ổn định của asset [icons/heart.svg](icons/heart.svg).
- Việc chuyển từ trái tim dựng bằng mưa rơi sang trái tim SVG hoàn chỉnh phải mượt, không bị nhảy hình thô.
- Trái tim SVG phải giữ đúng tỉ lệ và đúng vị trí trung tâm đã quy định.

### 5.3.1. Chuyển trạng thái từ particle sang SVG hoàn chỉnh

- Khi số lượng hạt bám vào shape đạt ngưỡng hoàn thiện, hệ thống bắt đầu crossfade hoặc blend sang trạng thái SVG hoàn chỉnh.
- Trong giai đoạn chuyển này, particle không nên biến mất đột ngột toàn bộ trong cùng một frame.
- Có thể giữ particle thêm một khoảng rất ngắn để tạo cảm giác SVG hoàn chỉnh đang được khóa hình từ chính các hạt đã rơi xuống.
- Sau khi tim SVG đã hiện ổn định, particle dựng hình ban đầu có thể mờ dần hoặc được dọn sạch.

### 5.4. Hiệu ứng sau hoàn thành

- Sau khi trái tim hoàn chỉnh, các chấm quanh trái tim phải được tỏa ra như hiệu ứng hậu kỳ.
- Các chấm này lấy trực tiếp từ dữ liệu chấm quanh tim trong [icons/heart.svg](icons/heart.svg).
- Các chấm là hiệu ứng phụ, không thay thế trái tim chính.
- Hướng tỏa ra có thể là nhiều hướng khác nhau, nhưng phải giữ cảm giác mềm mại và lãng mạn.
- Trong quá trình bay ra, từng chấm thu nhỏ dần theo thời gian.
- Cuối vòng đời, từng chấm mờ dần hoặc biến mất hẳn.
- Không để số lượng chấm quá dày gây rối mắt.
- Sau khi một phần chấm tỏa ra, trái tim chính vẫn phải giữ được hình dạng hoàn chỉnh và ổn định ở trung tâm.

## 6. Đồng bộ với background

- Trước khi hoàn chỉnh, background giữ tông tối.
- Ngay khi trái tim hoàn chỉnh, background bắt đầu chuyển sang hồng nhạt.
- Trong lúc background chuyển màu, trái tim cũng chuyển từ đen than sang hồng đậm.
- Hiệu ứng tỏa chấm chỉ bắt đầu sau khi quá trình hoàn chỉnh này đã được kích hoạt.

## 7. Dữ liệu icon

- File trái tim chính và dữ liệu chấm quanh tim: [icons/heart.svg](icons/heart.svg).
- Trước khi có asset thật, có thể dùng placeholder.
- Cấu trúc code phải tách riêng:
	- hiệu ứng mưa rơi để dựng tim,
	- asset SVG của trái tim chính,
	- dữ liệu chấm quanh tim để tỏa ra sau hoàn thành.
- Việc thay asset thật không được làm thay đổi timeline chính.