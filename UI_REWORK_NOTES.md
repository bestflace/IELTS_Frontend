# IELTSBF UI Rework Notes

Bản này đã chỉnh lại flow theo yêu cầu mới:

## Layout theo role

- Guest/Public: header ngang, không sidebar.
- Learner/USER: header ngang kiểu Study4, không sidebar.
- Teacher: dashboard có sidebar.
- Admin: dashboard có sidebar.

## Admin sidebar

Sidebar admin đã được gom còn các mục chính:

- Bảng điều khiển
- Quản lý tag
- Quản lý đề thi
- Ngân hàng đề
- Quản lý blog
- Quản lý lớp học
- Báo cáo
- Quản lý người dùng
- Cài đặt tham số
- Cài đặt

Đã bỏ Health khỏi sidebar chính. Các câu mô tả kiểu debug/backend comment cũng đã thay bằng nút Đăng xuất.

## Teacher sidebar

Sidebar giáo viên gồm:

- Bảng điều khiển
- Chấm bài
- Quản lý lớp học
- Báo cáo
- Thông báo
- Cài đặt

Topbar giáo viên/admin không còn icon thông báo, chỉ còn nút Đăng xuất.

## Learner header

Header học viên gồm:

- Trang chủ
- Đề thi
- Flashcard
- Lớp học
- Tiến độ
- Icon thông báo
- Avatar menu

Avatar menu gồm:

- Lịch học của tôi
- Trang cá nhân
- Lịch sử làm bài
- Đăng xuất

## Các màn hình đã polish lại

- Admin dashboard
- Admin quản lý đề thi với tab All/L/R/S/W
- Admin ngân hàng đề với tab Listening/Reading/Speaking/Writing
- Admin quản lý tag
- Admin quản lý người dùng
- Admin cài đặt tham số
- Admin báo cáo
- Teacher dashboard
- Teacher hàng đợi chấm bài
- Teacher báo cáo
- Learner trang chủ
- Learner thư viện đề thi với tab All/L/R/S/W
- Learner lịch học dạng thời khóa biểu
- Learner trang cá nhân + lịch sử làm bài
- Learner flashcard/lớp học coming soon

## Lưu ý backend

- Những module đã có backend vẫn gọi đúng API hiện có trong `src/lib/api`.
- Lớp học, flashcard, lịch học hiện chưa có backend đầy đủ nên UI hiển thị định hướng và coming soon/local timetable.
- File `package-lock.json` không được đóng gói để tránh lock registry nội bộ. Khi chạy ở máy local, dùng `npm install --registry=https://registry.npmjs.org/ --no-audit --no-fund --legacy-peer-deps` để npm tự tạo lock mới.
