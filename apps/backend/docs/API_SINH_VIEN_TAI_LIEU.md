# 📘 API Tài liệu học tập - Sinh viên

## 🔑 Authentication

```
Authorization: Bearer <sinh_vien_token>
```

---

## 1️⃣ Lấy danh sách lớp đã đăng ký kèm tài liệu

```http
GET /api/sv/lop-da-dang-ky/tai-lieu?hoc_ky_id=<uuid>
```

### Query Parameters

- `hoc_ky_id` (required): UUID của học kỳ

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Lấy danh sách lớp đã đăng ký kèm tài liệu thành công",
  "data": [
    {
      "lopHocPhanId": "a4d14a2e-2376-45a9-a049-bfff591dc1a7",
      "maLop": "COMP1010_01",
      "maMon": "COMP1010",
      "tenMon": "Nhập môn lập trình",
      "soTinChi": 3,
      "giangVien": "TS. Nguyễn Văn A",
      "trangThaiDangKy": "da_dang_ky",
      "ngayDangKy": "2025-01-20T10:30:00.000Z",
      "taiLieu": [
        {
          "id": "uuid-tai-lieu-1",
          "tenTaiLieu": "Slide bài giảng chương 1",
          "fileType": "application/pdf",
          "fileUrl": "https://hcmue-tailieu-hoctap-20251029.s3.ap-southeast-2.amazonaws.com/hoc-phan/COMP1010/lop-01/a1b2c3d4-slide.pdf",
          "uploadedAt": "2025-01-26T10:30:00.000Z",
          "uploadedBy": "TS. Nguyễn Văn A"
        },
        {
          "id": "uuid-tai-lieu-2",
          "tenTaiLieu": "Bài tập thực hành tuần 1",
          "fileType": "application/pdf",
          "fileUrl": "https://hcmue-tailieu-hoctap-20251029.s3.ap-southeast-2.amazonaws.com/hoc-phan/COMP1010/lop-01/b2c3d4e5-baitap.pdf",
          "uploadedAt": "2025-01-27T14:20:00.000Z",
          "uploadedBy": "TS. Nguyễn Văn A"
        }
      ]
    },
    {
      "lopHocPhanId": "b5e25b3f-3487-56b0-b160-c0gg702ed2b8",
      "maLop": "COMP1020_02",
      "maMon": "COMP1020",
      "tenMon": "Cấu trúc dữ liệu và giải thuật",
      "soTinChi": 4,
      "giangVien": "PGS.TS. Trần Thị B",
      "trangThaiDangKy": "da_dang_ky",
      "ngayDangKy": "2025-01-21T15:45:00.000Z",
      "taiLieu": []
    }
  ]
}
```

### Response Error (400)

```json
{
  "isSuccess": false,
  "message": "Thiếu hoc_ky_id",
  "errorCode": "MISSING_PARAM"
}
```

### Response Success - Không có lớp nào (200)

```json
{
  "isSuccess": true,
  "message": "Không có lớp nào đã đăng ký",
  "data": []
}
```

---

## 2️⃣ Lấy tài liệu của một lớp học phần

```http
GET /api/sv/lop-hoc-phan/:id/tai-lieu
```

### URL Parameters

- `id` (required): UUID của lớp học phần

### Authorization Rules

- Sinh viên **phải đã đăng ký** lớp học phần này
- Không được lấy tài liệu của lớp chưa đăng ký
- Không được lấy tài liệu của lớp đã hủy đăng ký

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Lấy danh sách tài liệu thành công",
  "data": [
    {
      "id": "uuid-tai-lieu-1",
      "tenTaiLieu": "Slide bài giảng chương 1",
      "fileType": "application/pdf",
      "fileUrl": "https://hcmue-tailieu-hoctap-20251029.s3.ap-southeast-2.amazonaws.com/hoc-phan/COMP1010/lop-01/a1b2c3d4-slide.pdf",
      "uploadedAt": "2025-01-26T10:30:00.000Z",
      "uploadedBy": "TS. Nguyễn Văn A"
    },
    {
      "id": "uuid-tai-lieu-2",
      "tenTaiLieu": "Bài tập thực hành tuần 1",
      "fileType": "application/pdf",
      "fileUrl": "https://hcmue-tailieu-hoctap-20251029.s3.ap-southeast-2.amazonaws.com/hoc-phan/COMP1010/lop-01/b2c3d4e5-baitap.pdf",
      "uploadedAt": "2025-01-27T14:20:00.000Z",
      "uploadedBy": "TS. Nguyễn Văn A"
    },
    {
      "id": "uuid-tai-lieu-3",
      "tenTaiLieu": "Video bài giảng - Giới thiệu Python",
      "fileType": "video/mp4",
      "fileUrl": "https://hcmue-tailieu-hoctap-20251029.s3.ap-southeast-2.amazonaws.com/hoc-phan/COMP1010/lop-01/c3d4e5f6-video.mp4",
      "uploadedAt": "2025-01-28T09:15:00.000Z",
      "uploadedBy": "TS. Nguyễn Văn A"
    }
  ]
}
```

### Response Error (400)

```json
{
  "isSuccess": false,
  "message": "Thiếu lop_hoc_phan_id",
  "errorCode": "MISSING_PARAM"
}
```

### Response Error - Chưa đăng ký lớp (400)

```json
{
  "isSuccess": false,
  "message": "Bạn chưa đăng ký lớp học phần này hoặc đã hủy đăng ký",
  "errorCode": "NOT_REGISTERED"
}
```

### Response Success - Không có tài liệu (200)

```json
{
  "isSuccess": true,
  "message": "Lấy danh sách tài liệu thành công",
  "data": []
}
```

---

## 📝 Notes

### Clean Architecture Implementation

API này được thiết kế theo **Clean Architecture** với các layer:

```
┌─────────────────────────────────────────────────┐
│  Interface Layer (Controllers + Routes)         │
│  - SinhVienTaiLieuController                    │
│  - sv.router.ts                                 │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Application Layer (Use Cases + DTOs)           │
│  - GetLopDaDangKyWithTaiLieuUseCase             │
│  - GetTaiLieuByLopHocPhanUseCase                │
│  - TaiLieuDTO, LopDaDangKyWithTaiLieuDTO        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Domain Layer (Business Logic)                  │
│  - Ports (ITaiLieuRepository)                   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Infrastructure Layer (Implementations)         │
│  - PrismaTaiLieuRepository                      │
│  - Dependency Injection Container               │
└─────────────────────────────────────────────────┘
```

### File Types hỗ trợ

- **Documents:** PDF, DOCX, PPTX, TXT
- **Videos:** MP4
- **Images:** JPG, PNG
- **Archives:** ZIP

### Business Rules

1. **Quyền truy cập:**

   - Sinh viên chỉ xem được tài liệu của lớp đã đăng ký
   - Không xem được tài liệu của lớp đã hủy (trang_thai = "da_huy")
   - Không xem được tài liệu của lớp chưa đăng ký

2. **File URL:**

   - URL được tạo từ `AWS_S3_BASE_URL` + `file_path`
   - URL có thể download trực tiếp hoặc xem trực tuyến

3. **Thông tin upload:**
   - `uploadedBy`: Tên giảng viên hoặc "Giảng viên" nếu không có thông tin
   - `uploadedAt`: Thời gian upload tài liệu

### Use Cases

**Use Case 1: Xem tổng quan tài liệu**

```
GET /api/sv/lop-da-dang-ky/tai-lieu?hoc_ky_id=f416c2df-acea-4dd5-9e24-e8a36a56276b
→ Lấy tất cả lớp đã đăng ký kèm số lượng tài liệu
→ Hiển thị danh sách môn học với badge số tài liệu
```

**Use Case 2: Xem chi tiết tài liệu một lớp**

```
GET /api/sv/lop-hoc-phan/a4d14a2e-2376-45a9-a049-bfff591dc1a7/tai-lieu
→ Lấy danh sách đầy đủ tài liệu của lớp
→ Hiển thị danh sách file để download/preview
```

### Frontend Integration Example

```javascript
// Lấy danh sách lớp kèm tài liệu
const response = await fetch("/api/sv/lop-da-dang-ky/tai-lieu?hoc_ky_id=xxx", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const { data } = await response.json();

// Hiển thị badge số tài liệu
data.forEach((lop) => {
  console.log(`${lop.tenMon}: ${lop.taiLieu.length} tài liệu`);
});

// Download file
const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  a.click();
};
```

---

## 🔄 Related APIs

- **Giảng viên upload tài liệu:** `POST /api/gv/lop-hoc-phan/:id/tai-lieu/upload`
- **Giảng viên lấy danh sách:** `GET /api/gv/lop-hoc-phan/:id/tai-lieu`
- **Sinh viên xem lớp đã đăng ký:** `GET /api/sv/lop-da-dang-ky?hoc_ky_id=xxx`
