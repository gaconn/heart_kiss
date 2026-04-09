# Plain Specification Index

File này là điểm vào chính cho bước sinh code.

## 1. Mục tiêu mới

Giảm độ phức tạp của một file đặc tả lớn bằng cách chia logic thành 4 thực thể độc lập:

- Trái tim.
- Nam.
- Nữ.
- Cặp nam và nữ.

Mỗi thực thể có một file spec riêng. Bước code về sau phải đọc file này trước, sau đó đọc tiếp 4 file con để triển khai.

## 2. Danh sách file con bắt buộc

- [plain-heart.md](plain-heart.md): đặc tả riêng cho trái tim.
- [plain-male.md](plain-male.md): đặc tả riêng cho nhân vật nam.
- [plain-female.md](plain-female.md): đặc tả riêng cho nhân vật nữ.
- [plain-couple.md](plain-couple.md): đặc tả riêng cho cảnh phối hợp giữa nam và nữ.

## 3. Quy tắc đọc spec

- Không dùng lại logic cũ trong plain.md như một file mô tả toàn cảnh chi tiết.
- Dùng plain.md như file index và file điều phối.
- Khi có mâu thuẫn, ưu tiên theo thứ tự: plain.md, sau đó plain-couple.md, sau đó các file thực thể đơn.

## 4. Cấu trúc cảnh tổng quát

- Background ban đầu tối.
- Trái tim hình thành bằng hiệu ứng mưa rơi.
- Nam đi từ trái vào giữa.
- Nữ đi từ phải vào giữa.
- Khi nam và nữ chạm nhau thì trái tim hoàn thành 100%.
- Sau mốc chạm nhau: background chuyển sang hồng nhạt và trái tim chuyển sang hồng đậm.

## 5. Quy ước icon và sprite

- Trái tim chính dùng asset [icons/heart.svg](icons/heart.svg).
- Các chấm quanh trái tim bên trong file SVG là dữ liệu dùng cho animation mưa rơi và hiệu ứng tỏa ra sau hoàn thành.
- File nhân vật nam dùng asset [icons/man_single.png](icons/man_single.png).
- File nhân vật nữ dùng asset [icons/girl_single.png](icons/girl_single.png).
- Các asset còn lại có thể tiếp tục dùng placeholder cho đến khi được bổ sung sau.
- Code phải chuẩn bị sẵn cấu trúc để thay hình placeholder bằng icon thật.
- Riêng trái tim phải hỗ trợ đọc dữ liệu từ SVG để lấy shape chính và các chấm phụ quanh tim.
- Với nam và nữ, chuyển động đi hoặc chạy sẽ dùng sprite animation 20 hình.
- Quy ước phát khung hình: đổi 1 frame sau mỗi 2 bước hoặc mỗi 2 tick chuyển động.
- Logic animation phải cho phép thay đổi tổng số frame và step interval bằng cấu hình.

## 6. Quy ước hậu hiệu ứng trái tim

- Sau khi trái tim hoàn thành, các chấm quanh trái tim phải tỏa ra như một hiệu ứng phụ.
- Chính các chấm này là những điểm hoặc particle được lấy từ asset SVG.
- Các chấm tỏa ra từ vùng trái tim theo nhiều hướng.
- Trong lúc bay ra, các chấm thu nhỏ dần.
- Cuối vòng đời, các chấm biến mất hoàn toàn.
- Hiệu ứng này chỉ được bắt đầu sau mốc nam và nữ chạm nhau.

## 7. Tiêu chí nghiệm thu rút gọn

- Có đúng 4 file spec con theo danh sách trên.
- Trái tim dùng hiệu ứng mưa rơi để hình thành.
- Trái tim chính dùng [icons/heart.svg](icons/heart.svg).
- Các chấm quanh trái tim trong SVG được dùng để tạo animation mưa rơi.
- Sau khi hoàn thành, các chấm đó tiếp tục tỏa ra, thu nhỏ và biến mất.
- Nam và nữ có đặc tả animation sprite 20 hình, đổi frame mỗi 2 bước.
- Thời điểm nam và nữ chạm nhau trùng thời điểm trái tim hoàn chỉnh.
- Sau mốc đó nền chuyển hồng nhạt và tim chuyển hồng đậm.