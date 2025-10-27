# API Quản Lý Đợt Đăng Ký (Ghi Danh & Đăng Ký Học Phần)

## Base URL

```
http://localhost:3000/api/pdt
```

## Authentication

Tất cả API yêu cầu Bearer Token và role `phong_dao_tao`:

```
Authorization: Bearer <token>
```

---

## 1. Load Đợt Ghi Danh

Lấy danh sách đợt ghi danh theo học kỳ (đã có trong DB).

### Endpoint

```http
GET /dot-dang-ky?hoc_ky_id={hocKyId}
```

### Query Parameters

| Tên       | Kiểu          | Bắt buộc | Mô tả     |
| --------- | ------------- | -------- | --------- |
| hoc_ky_id | string (UUID) | ✅       | ID học kỳ |

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Lấy danh sách đợt đăng ký thành công",
  "data": [
    {
      "id": "uuid-1",
      "hocKyId": "uuid-hoc-ky",
      "loaiDot": "ghi_danh",
      "thoiGianBatDau": "2025-10-14T00:00:00.000Z",
      "thoiGianKetThuc": "2025-10-18T23:00:00.000Z",
      "hanHuyDen": null,
      "isCheckToanTruong": true,
      "khoaId": null,
      "tenKhoa": null,
      "gioiHanTinChi": 50
    }
  ]
}
```

---

## 2. Update Đợt Ghi Danh

Cập nhật đợt ghi danh (toàn trường hoặc theo khoa).

### Endpoint

```http
POST /dot-ghi-danh/update
```

### Request Body

#### Case 1: Toàn trường

```json
{
  "hocKyId": "uuid-hoc-ky",
  "isToanTruong": true,
  "thoiGianBatDau": "2025-10-14T00:00:00.000Z",
  "thoiGianKetThuc": "2025-10-18T23:00:00.000Z",
  "dotToanTruongId": "uuid-dot-tt" // Optional: ID nếu đã tồn tại
}
```

#### Case 2: Theo khoa

```json
{
  "hocKyId": "uuid-hoc-ky",
  "isToanTruong": false,
  "dotTheoKhoa": [
    {
      "id": "uuid-dot-1", // Optional: có ID = update, không có = tạo mới
      "khoaId": "uuid-khoa-cntt",
      "thoiGianBatDau": "2025-10-14T00:00:00.000Z",
      "thoiGianKetThuc": "2025-10-16T23:00:00.000Z"
    },
    {
      "khoaId": "uuid-khoa-dien",
      "thoiGianBatDau": "2025-10-17T00:00:00.000Z",
      "thoiGianKetThuc": "2025-10-18T23:00:00.000Z"
    }
  ]
}
```

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Cập nhật thành công 2 đợt ghi danh",
  "data": [
    {
      "id": "uuid-1",
      "hocKyId": "uuid-hoc-ky",
      "loaiDot": "ghi_danh",
      "thoiGianBatDau": "2025-10-14T00:00:00.000Z",
      "thoiGianKetThuc": "2025-10-16T23:00:00.000Z",
      "hanHuyDen": null,
      "isCheckToanTruong": false,
      "khoaId": "uuid-khoa-cntt",
      "tenKhoa": "Công nghệ thông tin",
      "gioiHanTinChi": 50
    }
  ]
}
```

---

## 3. Load Đợt Đăng Ký Học Phần

Lấy danh sách đợt đăng ký học phần theo học kỳ (đã có trong DB).

### Endpoint

```http
GET /dot-dang-ky?hoc_ky_id={hocKyId}
```

_(Endpoint giống Load Đợt Ghi Danh, backend filter theo `loai_dot`)_

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Lấy danh sách đợt đăng ký thành công",
  "data": [
    {
      "id": "uuid-2",
      "hocKyId": "uuid-hoc-ky",
      "loaiDot": "dang_ky",
      "thoiGianBatDau": "2025-11-12T00:00:00.000Z",
      "thoiGianKetThuc": "2025-11-15T00:00:00.000Z",
      "hanHuyDen": "2025-11-17T00:00:00.000Z",
      "isCheckToanTruong": true,
      "khoaId": null,
      "tenKhoa": null,
      "gioiHanTinChi": 9999
    }
  ]
}
```

---

## 4. Update Đợt Đăng Ký Học Phần

Cập nhật đợt đăng ký học phần (toàn trường hoặc theo khoa).

### Endpoint

```http
PUT /dot-dang-ky
```

### Request Body

#### Case 1: Toàn trường

```json
{
  "hocKyId": "uuid-hoc-ky",
  "isToanTruong": true,
  "thoiGianBatDau": "2025-11-12T00:00:00.000Z",
  "thoiGianKetThuc": "2025-11-15T00:00:00.000Z",
  "hanHuyDen": "2025-11-17T00:00:00.000Z", // Optional: Hạn hủy đăng ký
  "gioiHanTinChi": 24, // Optional: Default 9999
  "dotToanTruongId": "uuid-dot-tt" // Optional: ID nếu đã tồn tại
}
```

#### Case 2: Theo khoa

```json
{
  "hocKyId": "uuid-hoc-ky",
  "isToanTruong": false,
  "dotTheoKhoa": [
    {
      "id": "uuid-dot-1", // Optional: có ID = update, không có = tạo mới
      "khoaId": "uuid-khoa-cntt",
      "thoiGianBatDau": "2025-11-12T00:00:00.000Z",
      "thoiGianKetThuc": "2025-11-14T23:00:00.000Z",
      "hanHuyDen": "2025-11-16T00:00:00.000Z",
      "gioiHanTinChi": 20
    },
    {
      "khoaId": "uuid-khoa-dien",
      "thoiGianBatDau": "2025-11-13T00:00:00.000Z",
      "thoiGianKetThuc": "2025-11-15T00:00:00.000Z",
      "hanHuyDen": "2025-11-17T00:00:00.000Z",
      "gioiHanTinChi": 24
    }
  ]
}
```

### Response Success (201)

```json
{
  "isSuccess": true,
  "message": "Cập nhật thành công 2 đợt đăng ký",
  "data": [
    {
      "id": "uuid-1",
      "hocKyId": "uuid-hoc-ky",
      "loaiDot": "dang_ky",
      "thoiGianBatDau": "2025-11-12T00:00:00.000Z",
      "thoiGianKetThuc": "2025-11-14T23:00:00.000Z",
      "hanHuyDen": "2025-11-16T00:00:00.000Z",
      "isCheckToanTruong": false,
      "khoaId": "uuid-khoa-cntt",
      "tenKhoa": "Công nghệ thông tin",
      "gioiHanTinChi": 20
    }
  ]
}
```

---

## So Sánh 2 Loại Đợt

| Thuộc tính                  | Ghi Danh                         | Đăng Ký Học Phần                 |
| --------------------------- | -------------------------------- | -------------------------------- |
| **Endpoint Load**           | `GET /dot-dang-ky?hoc_ky_id=xxx` | `GET /dot-dang-ky?hoc_ky_id=xxx` |
| **Endpoint Update**         | `POST /dot-ghi-danh/update`      | `PUT /dot-dang-ky`               |
| **Field `loaiDot`**         | `"ghi_danh"`                     | `"dang_ky"`                      |
| **Field `hanHuyDen`**       | ❌ Không có                      | ✅ Có (hạn hủy đăng ký)          |
| **Default `gioiHanTinChi`** | `50`                             | `9999`                           |

---

## Logic Xử Lý (Chung cho cả 2 loại)

### Toàn trường (`isToanTruong = true`)

1. **Xóa** tất cả đợt theo khoa (`is_check_toan_truong = false`)
2. **Update** đợt toàn trường nếu có `dotToanTruongId`
3. **Tạo mới** đợt toàn trường nếu không có `dotToanTruongId`

### Theo khoa (`isToanTruong = false`)

1. **Xóa** đợt toàn trường (`is_check_toan_truong = true`)
2. **Xóa** các đợt theo khoa không có trong `dotTheoKhoa[]`
3. **Update** các đợt có `id`
4. **Tạo mới** các đợt không có `id`

---

## Error Codes

| Error Code           | Ý nghĩa                                 | HTTP Status |
| -------------------- | --------------------------------------- | ----------- |
| `INVALID_INPUT`      | Thiếu thông tin bắt buộc                | 400         |
| `HOC_KY_NOT_FOUND`   | Không tìm thấy học kỳ                   | 400         |
| `INVALID_TIME_RANGE` | Thời gian bắt đầu >= thời gian kết thúc | 400         |
| `INVALID_KHOA_LIST`  | Danh sách khoa rỗng                     | 400         |
| `INVALID_KHOA_DOT`   | Thông tin đợt theo khoa không đầy đủ    | 400         |
| `KHOA_NOT_FOUND`     | Không tìm thấy khoa                     | 400         |
| `INTERNAL_ERROR`     | Lỗi server                              | 500         |

---

## Notes

### 1. Data có sẵn trong DB

Khi tạo phases, backend tự động tạo 2 đợt:

- **Ghi danh**: `loai_dot = "ghi_danh"`, `is_check_toan_truong = true`
- **Đăng ký**: `loai_dot = "dang_ky"`, `is_check_toan_truong = true`

FE **chỉ cần UPDATE**, không cần tạo mới từ đầu.

### 2. Upsert Logic

- **Có `id`** trong request → **UPDATE**
- **Không có `id`** → **TẠO MỚI**
- **Không có trong request** → **XÓA**

### 3. Giới hạn tín chỉ

- **Ghi danh**: Default `50` tín chỉ
- **Đăng ký**: Default `9999` tín chỉ (không giới hạn)
- FE có thể override bằng field `gioiHanTinChi`

### 4. Hạn hủy đăng ký

- **Chỉ có ở đăng ký học phần** (`loai_dot = "dang_ky"`)
- Field `hanHuyDen` (optional): Hạn cuối cùng SV được hủy đăng ký

---

## Testing với Postman

### 1. Load đợt ghi danh

```http
GET {{base_url}}/pdt/dot-dang-ky?hoc_ky_id={{hoc_ky_id}}
Authorization: Bearer {{pdt_token}}
```

### 2. Update đợt ghi danh (toàn trường)

```http
POST {{base_url}}/pdt/dot-ghi-danh/update
Authorization: Bearer {{pdt_token}}
Content-Type: application/json

{
  "hocKyId": "{{hoc_ky_id}}",
  "isToanTruong": true,
  "thoiGianBatDau": "2025-10-14T00:00:00.000Z",
  "thoiGianKetThuc": "2025-10-18T23:00:00.000Z",
  "dotToanTruongId": "{{existing_id}}"
}
```

### 3. Load đợt đăng ký

```http
GET {{base_url}}/pdt/dot-dang-ky?hoc_ky_id={{hoc_ky_id}}
Authorization: Bearer {{pdt_token}}
```

### 4. Update đợt đăng ký (theo khoa)

```http
PUT {{base_url}}/pdt/dot-dang-ky
Authorization: Bearer {{pdt_token}}
Content-Type: application/json

{
  "hocKyId": "{{hoc_ky_id}}",
  "isToanTruong": false,
  "dotTheoKhoa": [
    {
      "id": "{{existing_id}}",
      "khoaId": "{{khoa_cntt_id}}",
      "thoiGianBatDau": "2025-11-12T00:00:00.000Z",
      "thoiGianKetThuc": "2025-11-14T23:00:00.000Z",
      "hanHuyDen": "2025-11-16T00:00:00.000Z",
      "gioiHanTinChi": 20
    }
  ]
}
```

---

## Contact & Support

- Backend Developer: [Your Name]
- Last Updated: 2025-01-25
- Version: 1.0.0
