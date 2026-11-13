# JobHub – Website tìm việc làm (Job Board)

FER202 Assignment – Mai Trọng Hiếu (HE194568)

## Công nghệ
ReactJS (Vite) · React Router · Context API + localStorage · Axios · React-Bootstrap · Bootstrap Icons · JSON Server

- **Đăng nhập**: thông tin người dùng (không gồm mật khẩu) lưu ở localStorage key `jobhub_user`
- **Việc làm đã lưu**: lưu ở localStorage key `jobhub_saved_jobs` dạng `{ userId: [jobId, ...] }`, không lưu trong db.json
- Các dữ liệu còn lại (users, categories, jobs, applications) lưu ở JSON Server (`db.json`)

## Cách chạy
```bash
npm install
npm start          # chạy cùng lúc JSON Server (cổng 9999) và web (cổng 3000)
```
Hoặc chạy riêng ở 2 terminal: `npm run server` và `npm run dev`.

> Chạy được với cả json-server 0.17.4 (cài sẵn trong project, dùng qua `npm run server`) và json-server 1.0 cài global.
> Nếu cổng 9999 đang bị chiếm thì tắt JSON Server cũ trước khi chạy.
>
> Muốn đổi cổng API: sửa `--port` trong `package.json` (script `server`) và `baseURL` trong `src/api/axiosClient.js`.

## Tài khoản demo (mật khẩu: `123456`)
| Vai trò | Email |
|---|---|
| Admin | admin@jobhub.vn |
| Nhà tuyển dụng | hr@fpt.vn, hr@vng.vn |
| Ứng viên | an@gmail.com, ha@gmail.com |

## Chức năng
**Khách / Ứng viên**
- Trang chủ: tìm kiếm theo từ khóa + địa điểm, ngành nghề nổi bật, việc làm mới nhất
- Danh sách việc làm: lọc theo từ khóa, ngành nghề, địa điểm, hình thức, mức lương; sắp xếp; phân trang (bộ lọc lưu trên URL)
- Chi tiết việc làm, ứng tuyển (form có validate), lưu / bỏ lưu tin
- Việc đã ứng tuyển (xem trạng thái, rút hồ sơ), việc đã lưu
- Đăng ký / đăng nhập, hồ sơ cá nhân, đổi mật khẩu

**Nhà tuyển dụng**
- CRUD tin tuyển dụng (tin mới / vừa sửa chuyển về trạng thái *Chờ duyệt*)
- Xem danh sách ứng viên của từng tin, xem hồ sơ, chấp nhận / từ chối

**Quản trị viên**
- Thống kê: số ứng viên, nhà tuyển dụng, tin theo trạng thái và theo ngành nghề, hồ sơ ứng tuyển
- Duyệt / từ chối / xóa tin tuyển dụng
- CRUD người dùng, khóa / mở khóa tài khoản
- CRUD ngành nghề (không cho xóa ngành đang có tin)

## Cấu trúc thư mục
```
src/
  api/          axiosClient + các service gọi JSON Server
  context/      AuthContext (đăng nhập), SavedJobsContext (việc đã lưu) – đều lưu localStorage
  components/   Navbar, JobCard, ProtectedRoute, StatusBadge, ConfirmModal
  layouts/      MainLayout
  pages/        trang chung + candidate/ employer/ admin/
  utils/        hàm định dạng lương, ngày, hằng số
db.json         dữ liệu mẫu
```
