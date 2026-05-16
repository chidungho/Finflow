# Nhật ký thay đổi (Changelog)

Các bước tiến hóa của **VietFuelAPI** hướng tới trải nghiệm API documentation tốt nhất.

---

## [Unreleased]

### ⏰ Adaptive Cron Schedule (NĐ 80/2023/NĐ-CP)
- Thay thế lịch cào cố định mỗi 1 giờ bằng chế độ linh hoạt 3 mode theo cơ sở pháp lý:
  - **Checking** (T2–T4): 4 tiếng/lần — giá ổn định, tiết kiệm tài nguyên server.
  - **Hunting** (T5, 14:30–16:00): 15 phút/lần — khung giờ vàng Nhà nước công bố giá mới.
  - **Maintenance** (T6–CN): 6 tiếng/lần — giá đã chính thức, giảm tần suất để tiết kiệm băng thông.
- Bổ sung ghi chú pháp lý trong code: NĐ 80/2023, NĐ 95/2021, NĐ 83/2014.
- Thêm field `mode` vào log để monitor biết đang chạy chu kỳ nào.
- Công thức cron đầy đủ (được test): `30,45 14 * * 4` và `0,15,30,45 15 * * 4`.

### 📡 Endpoint mới: `GET /api/sources`
- Trả về danh sách toàn bộ 11 nguồn dữ liệu kèm trạng thái cache hiện tại.
- Field trả về: `id`, `label`, `url`, `populated`, `scrapedAt`, `ttlRemainingSeconds`, `isStale`.
- Phục vụ đồi chiếu và kiểm tra tính minh bạch cho cộng đồng developer.

### 🔧 Tối ưu hóa Stealth toàn hệ thống
- Chuyển `USER_AGENTS` pool và hàm `pickRandomUA()`, `humanDelay()` vào `utils.js` — tất cả scraper gọi `createBrowser()` đều hưởng lợi tự động.
- Pool 5 UA phổ biến (thêm Linux/Chrome UA mới).
- Xoá code trùng lập trong `pvoil.js`.

### ⛽ Nâng cấp PVOIL — Chiến lược 3 Tầng Dự Phòng
- **Tầng 1 — Stealth Direct**: Cào trực tiếp `pvoil.com.vn` với kỹ thuật giả lập trình duyệt thực tế:
  - Luân phiên User-Agent từ pool 4 UA phổ biến (Chrome/Firefox/Safari).
  - Chờ ngẫu nhiên `humanDelay` (800ms–2500ms) sau khi tải trang.
  - Di chuyển chuột và cuộn trang giả lập đọc nội dung.
- **Tầng 2 — GXHN Fallback** (giữ nguyên từ phiên bản trước): Cào văn bản qua `giaxanghomnay.com` — một nguồn tổng hợp công khai.
- **Tầng 3 — Light HTTP Fetch** (mới): Gọi HTTPS thuần không cần Playwright (Node.js `https.get`) tới các trang tổng hợp HTML tĩnh (`petrotimes.vn`, `giaxang.vn`). Phương pháp này hoàn toàn hợp pháp cho dự án phi lợi nhuận.
- Bổ sung field `_tier` vào kết quả trả về (1/2/3) cho phép monitor biết chính xác tầng nào đang phục vụ.
- Cải thiện log rõ ràng hơn: mọi thất bại ghi `[Tầng N] Thất bại:`, mọi thành công ghi `[Tầng N] Thành công từ ...`.

### 📁 Cập nhật cấu trúc tài liệu
- Cập nhật cây thư mục dự án trong README (VI/EN) phản ánh chính xác cấu trúc thực tế: bổ sung `workers/`, `tests/`, `utils/websocket.js`, `utils/fuel-helpers.js`, toàn bộ 10 scraper.
- Thêm thư mục `docs/assets/` chứa ảnh preview giao diện cho README.
- Thêm mockup preview ảnh (`docs/assets/preview.png`) vào README (VI/EN) — hiển thị trên GitHub.

### 📘 Chuẩn hóa tài liệu GitHub & Cộng đồng
- Bổ sung bộ file cộng đồng/pháp lý: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, `DISCLAIMER.md`.
- Bổ sung tài liệu quy ước comment: `docs/comment-style.md`.
- Cập nhật README (VI/EN) theo repository mới `TranQui004/vietfuel-api`, đồng bộ phạm vi pháp lý dự án cộng đồng và checklist tài nguyên nên push.

### 🧹 Dọn cấu trúc file debug
- Di chuyển script kiểm tra PVOIL vào `backend/tools/debug/inspect_pvoil.js`.
- Loại bỏ file dump tạm và cập nhật `.gitignore` để chặn debug artifacts runtime.

### ⛽ Cải thiện PVOIL & Live UI
- Tách parser PVOIL ra module riêng `pvoil-parser.js` để giảm độ phức tạp file scraper.
- Chuẩn hóa dữ liệu PVOIL còn 5 sản phẩm cốt lõi.
- Bổ sung metadata `blockedByProtection` khi nguồn trực tiếp PVOIL bị Cloudflare chặn và hệ thống dùng fallback.
- Mở rộng card Giá xăng dầu, tối ưu hiển thị card 2 vùng để tránh khuất nội dung.
- Bỏ tag chế độ `Vùng 1/2` theo yêu cầu, giữ badge `Đơn giá` cho nguồn 1 giá.


### ⚙️ Tái Cấu Trúc Backend (Tối Ưu Mã Nguồn & Ổn Định Hệ Thống)
- **Tách dữ liệu cấu hình**: Đưa toàn bộ hằng số 63 tỉnh thành ra khỏi logic API, lưu trữ file tĩnh tại `backend/data/provinces.json`.
- **Phân tách Module Scraper**: Chuyển file gốc khổng lồ `scraper.js` thành 9 file modules con (8 files nguồn scraper + 1 file `utils.js`) vào thư mục `backend/services/scrapers/`, hỗ trợ dễ dàng mở rộng, Plug&Play cho các cập nhật nguồn API sắp tới.
- **Vượt rào Cloudflare cho PVOil**: Cập nhật module PVOil sang chiến lược Fallback trích xuất văn bản (Text extraction) thông qua trang trung gian GiaXangHomNay thay vì Playwright trực tiếp để giải quyết triệt để lỗi "Just a moment..." do Cloudflare chặn.
- **Tối ưu Load Tài Nguyên Khởi Động**: Thay thế khởi động đa trình duyệt song song (`Promise.all`) bằng thuật toán **Tuần Tự** (`Thực Thi Tuần Tự`) khi chạy server boot. Triệt tiêu hoàn toàn vấn đề quá tải bộ nhớ đệm (RAM spikes) gây treo ứng dụng của Playwright Chromium.
- **Sửa đường dẫn chuẩn**: Sử dụng xử lý bộ trỏ đích thực `path.join(__dirname)` cho ổ đĩa `cache.json` để ngăn chặn lỗi không tìm thấy backup cache lúc runtime.
- **Nén Gzip/Brotli (`compression`)**: Giảm ~70% dung lượng phản hồi API & tải trang, cải thiện tốc độ đặc biệt trên Thiết bị di động.
- **Tiêu chuẩn bảo mật (`helmet`)**: Tự động thiết lập toàn bộ HTTP Security Headers (XSS Protection, Clickjacking, MIME Sniffing...) đạt chuẩn API công khai môi trường thực tế.
- **Cấu hình PM2**: Bổ sung `ecosystem.config.js` cho phép vận hành server production chuyên nghiệp với tính năng tự khởi động lại, quản lý log tập trung.
- **Cơ chế Stale Cache Thích ứng**: Tắt tự động xóa dữ liệu hết hạn (stdTTL = 0). Nếu crawler gặp sự cố, hệ thống giữ lại dữ liệu cũ, gắn thêm cờ `isStale: true` vào JSON phản hồi để đảm bảo API không bị downtime 503.

### 🎨 Tái Thiết Kế Frontend — Giao diện & Trải nghiệm

- **Tương Thích Di Động & Hiệu Ứng Glassmorphism**: Thiết kế lại toàn bộ luồng responsive trên di động. Thêm hiệu ứng làm mờ nền (backdrop-filter) cho Thanh điều hướng giống hệt ứng dụng độc lập, tinh chỉnh khoảng cách các khối báo cáo số liệu (chỉ số thống kê), tối ưu dàn trang nút bấm trên màn hình hẹp, và bố cục lại toàn bộ phần Chân trang (Footer) về dạng Lưới 1 cột nhằm chống hiện tượng méo chữ dính lề.

- **Đổi màu nhấn (accent)**: Chuyển từ màu vàng amber (`#f59e0b`) sang cam cam đặc trưng (`#ff6300`) trên toàn bộ site.
- **Xóa trang Changelog riêng**: `changelog.html` chuyển thành chuyển hướng tự động sang GitHub docs — nội dung lịch sử được quản lý tập trung trên repository.
- **Tích hợp Mô phỏng Terminal vào API Reference**: Phần mô phỏng terminal animation (6 endpoint thực tế) được chuyển vào `endpoints.html#demo` — `/playground` tự redirect về đây.
- **Sơ Đồ Kiến Trúc SVG Động**: Thay thế 6 thẻ tính năng trên trang chủ bằng sơ đồ SVG động mô tả luồng dữ liệu từ 11 nguồn scraping → Engine → Default Endpoint/API Layer → Client.
- **Mục Khởi Đầu Nhanh**: Bổ sung section Quickstart với 3 tab (cURL / JavaScript / Python) cho lần tích hợp đầu tiên.
- **Mục Nhà Tài Trợ**: Thêm phần Nhà Tài Trợ với vùng hiển thị logo (hiện trống) + form đăng ký tài trợ cho cả tổ chức & cá nhân.
- **Thẻ Endpoint Có Thể Thu Gọn**: Các endpoint trong API Reference section 04 có thể mở/đóng — giảm chiều cao trang và cải thiện UX scanning.

### 🛠 Cập nhật đồng bộ tài liệu & giao diện
- **Kiến trúc UI EJS**: Chuyển đổi toàn bộ cấu trúc Frontend từ tĩnh (`.html`) sang view engine `EJS` (`views/`, `views/partials/`) để dễ dàng tái sử dụng components (Header, Footer, Icon).
- **Hoàn thiện bộ Kiểm Thử Hệ Thống Backend**: Bổ sung bộ kiểm thử độc lập còn thiếu cho toàn bộ hệ thống Scraper (`petrolimex`, `pvoil`, `mipec`, `webgia`, `giaxanghomnay`). Khởi chạy qua lệnh `npm run test`.
- **Chạy một cổng duy nhất**: Backend Express serve trực tiếp toàn bộ frontend (`/`, `/live`, `/endpoints`) trên `localhost:3000`.
- **Sửa scripts backend**: Cập nhật `start/dev/scrape` trong `backend/package.json` theo entrypoint thực tế `index.js`; thêm cấu hình `nodemon --ignore cache.json --ignore logs/**` để tránh restart vòng lặp.
- **Sửa binding JavaScript theo từng trang**: Tách đúng script cho Live/Endpoints/Changelog; loại bỏ include sai gây lỗi runtime và khôi phục tương tác UI.
- **Sửa mục Pháp lý**: Loại bỏ script không phù hợp gây vỡ nội dung danh sách pháp lý.
- **Cải thiện Live Data**: Đồng bộ nguồn mặc định theo tab Default Endpoint để hạn chế trạng thái trống khi một nguồn riêng lẻ chưa sẵn sàng.
- **Giảm 503 khi khởi động**: Bỏ hành vi xóa disk cache lúc boot để giữ dữ liệu fallback.
- **Cập nhật Markdown Toàn diện**: Đồng bộ README, changelog, và tài liệu kiến trúc (cả Anh/Việt) để phản ánh cấu trúc EJS mới và hệ thống CI Test.

## [1.0.0] — 2026-04-02

### ✨ Phát hành chính thức (Phiên Bản Đầu Tiên)
- **API Giá Xăng Dầu Đầy Đủ**: Cung cấp dữ liệu giá xăng dầu bán lẻ tại Việt Nam theo thời gian thực (cập nhật mỗi giờ).
- **Default Endpoint (`/api/fuel-prices`)**: Endpoint mặc định tổng hợp dữ liệu chuẩn xác nhất từ 11 nguồn. Lấy Petrolimex làm gốc, tự động bù ngày niêm yết từ nguồn khác, và bổ sung dữ liệu nguồn liên kết/mirror khi cần. Trả về metadata rõ ràng (`meta.primarySource`, `meta.dataSources`).
- **11 Nguồn Dữ Liệu Hỗ Trợ**: Petrolimex + 3 mirror Petrolimex, PVOil, Mipec, COMECO, Saigon Petro, Petro Times, WebGia, GiaXangHomNay. Người dùng có thể lấy dữ liệu từng nguồn qua `/api/fuel-prices/:source`.
- **63 Tỉnh Thành**: Hỗ trợ tra cứu giá on-demand theo từng tỉnh thành (`/api/fuel-prices/province/:slug`). Phân định chuẩn xác Vùng 1, Vùng 2 và 4 Tỉnh Bán phần.
- **Tài liệu API Toàn Diện**: Giao diện API Reference, Playground tương tác trực tiếp, và Live Data Dashboard.
- **Bảo Mật & Tối Ưu**: Tích hợp giới hạn Request (Rate Limiting 60/20 req/phút), cùng hệ thống In-memory Cache & Disk Fallback siêu tốc.
