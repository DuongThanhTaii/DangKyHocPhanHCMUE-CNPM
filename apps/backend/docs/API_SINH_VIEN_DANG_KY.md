# 📘 API Đăng ký học phần - Sinh viên

## 🔑 Authentication

```
Authorization: Bearer <sinh_vien_token>
```

---

## 1️⃣ Đăng ký học phần

```http
POST /api/sv/dang-ky-hoc-phan
```

### Request Body

```json
{
  "lop_hoc_phan_id": "a4d14a2e-2376-45a9-a049-bfff591dc1a7",
  "hoc_ky_id": "f416c2df-acea-4dd5-9e24-e8a36a56276b"
}
```

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Đăng ký học phần thành công",
  "data": null
}
```

### Response Error (400)

```json
{
  "isSuccess": false,
  "message": "Lớp học phần đã đầy",
  "errorCode": "LHP_FULL"
}
```

### Error Codes

- `PHASE_NOT_OPEN` - Chưa đến phase đăng ký
- `NOT_GHI_DANH` - Chưa ghi danh học phần
- `ALREADY_REGISTERED_MON_HOC` - Đã đăng ký môn này rồi
- `LHP_FULL` - Lớp đã đầy
- `TKB_CONFLICT` - Xung đột lịch học
- `ALREADY_REGISTERED` - Đã đăng ký lớp này rồi

---

## 2️⃣ Hủy đăng ký học phần

```http
POST /api/sv/huy-dang-ky-hoc-phan
```

### Request Body

```json
{
  "lop_hoc_phan_id": "a4d14a2e-2376-45a9-a049-bfff591dc1a7"
}
```

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Hủy đăng ký học phần thành công",
  "data": null
}
```

### Response Error (400)

```json
{
  "isSuccess": false,
  "message": "Đã quá hạn hủy đăng ký học phần",
  "errorCode": "PAST_CANCEL_DEADLINE"
}
```

### Error Codes

- `DANG_KY_NOT_FOUND` - Không tìm thấy đăng ký
- `ALREADY_CANCELLED` - Đã hủy rồi
- `PAST_CANCEL_DEADLINE` - Quá hạn hủy

---

## 3️⃣ Chuyển lớp học phần

```http
POST /api/sv/chuyen-lop-hoc-phan
```

### Request Body

```json
{
  "lop_hoc_phan_id_cu": "a4d14a2e-2376-45a9-a049-bfff591dc1a7",
  "lop_hoc_phan_id_moi": "b5e25b3f-3487-56ba-b15a-cg00602ed2b8"
}
```

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Chuyển lớp học phần thành công",
  "data": null
}
```

### Response Error (400)

```json
{
  "isSuccess": false,
  "message": "Lớp mới không cùng môn học với lớp cũ",
  "errorCode": "DIFFERENT_SUBJECT"
}
```

### Error Codes

- `OLD_CLASS_NOT_FOUND` - Không tìm thấy lớp cũ
- `OLD_CLASS_CANCELLED` - Lớp cũ đã bị hủy
- `NEW_CLASS_NOT_FOUND` - Không tìm thấy lớp mới
- `DIFFERENT_SUBJECT` - Lớp mới khác môn
- `NEW_CLASS_FULL` - Lớp mới đã đầy
- `TKB_CONFLICT` - Xung đột lịch học

---

## 4️⃣ Load danh sách lớp học phần

```http
GET /api/sv/lop-hoc-phan?hoc_ky_id=f416c2df-acea-4dd5-9e24-e8a36a56276b
```

### Query Params

- `hoc_ky_id` (required): UUID học kỳ

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Lấy danh sách lớp học phần thành công",
  "data": {
    "monChung": [
      {
        "maMon": "COMP1010",
        "tenMon": "Lập trình cơ bản",
        "soTinChi": 3,
        "danhSachLop": [
          {
            "id": "uuid",
            "maLop": "COMP1010_1",
            "tenLop": "COMP1010_1",
            "soLuongHienTai": 45,
            "soLuongToiDa": 50,
            "tkb": [
              {
                "thu": 2,
                "tiet": "1 - 5",
                "phong": "A101",
                "giangVien": "Nguyễn Văn A",
                "ngayBatDau": "15/10/2025",
                "ngayKetThuc": "20/12/2025",
                "formatted": "Thứ Hai, Tiết(1 - 5), A101, Nguyễn Văn A\n(15/10/2025 -> 20/12/2025)"
              }
            ]
          }
        ]
      }
    ],
    "batBuoc": [],
    "tuChon": []
  }
}
```

---

## 5️⃣ Load danh sách lớp đã đăng ký

```http
GET /api/sv/lop-da-dang-ky?hoc_ky_id=f416c2df-acea-4dd5-9e24-e8a36a56276b
```

### Query Params

- `hoc_ky_id` (required): UUID học kỳ

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Lấy danh sách lớp đã đăng ký thành công",
  "data": [
    {
      "maMon": "COMP1010",
      "tenMon": "Lập trình cơ bản",
      "soTinChi": 3,
      "danhSachLop": [
        {
          "id": "uuid",
          "maLop": "COMP1010_1",
          "tenLop": "COMP1010_1",
          "soLuongHienTai": 45,
          "soLuongToiDa": 50,
          "tkb": [...]
        }
      ]
    }
  ]
}
```

---

## 6️⃣ Load lớp chưa đăng ký theo môn

```http
GET /api/sv/lop-hoc-phan/mon-hoc?mon_hoc_id=uuid&hoc_ky_id=uuid
```

### Query Params

- `mon_hoc_id` (required): UUID môn học
- `hoc_ky_id` (required): UUID học kỳ

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Lấy danh sách lớp chưa đăng ký thành công",
  "data": [
    {
      "id": "uuid",
      "maLop": "COMP1010_2",
      "tenLop": "COMP1010_2",
      "soLuongHienTai": 30,
      "soLuongToiDa": 50,
      "giangVien": "Trần Thị B",
      "tkb": [...]
    }
  ]
}
```

---

## 7️⃣ Check phase đăng ký

```http
GET /api/sv/check-phase-dang-ky?hoc_ky_id=uuid
```

### Query Params

- `hoc_ky_id` (required): UUID học kỳ

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Phase đăng ký đang mở",
  "data": {
    "isOpen": true,
    "phase": "dang_ky_hoc_phan",
    "startAt": "2025-11-12T00:00:00.000Z",
    "endAt": "2025-11-15T00:00:00.000Z"
  }
}
```

### Response Error (400)

```json
{
  "isSuccess": false,
  "message": "Phase đăng ký chưa mở",
  "errorCode": "PHASE_NOT_OPEN"
}
```

---

## 📌 Notes

### Response Format chung

```typescript
interface ServiceResult<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
  errorCode?: string;
}
```

### Handle Error

```javascript
if (!result.isSuccess) {
  // Show error message
  alert(result.message);

  // Handle specific error
  switch (result.errorCode) {
    case "LHP_FULL":
      // Lớp đầy
      break;
    case "TKB_CONFLICT":
      // Xung đột lịch
      break;
  }
}
```

### TKB Format

- `thu`: 1-7 (1 = Chủ Nhật, 2 = Thứ Hai, ...)
- `tiet`: "1 - 5" (tiết học)
- `formatted`: String đầy đủ để hiển thị UI

---

## 🔗 Postman Collection

Import collection để test:

```
{{base_url}} = http://localhost:3000
{{sv_token}} = Bearer eyJhbGc...
```

---

**Version:** 1.0  
**Last Updated:** 2025-01-26
