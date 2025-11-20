# 📅 API Lấy TKB Theo Tuần - Sinh viên

## 🔑 Authentication

```
Authorization: Bearer <sinh_vien_token>
```

---

## API Endpoint

```http
GET /api/sv/tkb-weekly
```

### Query Parameters

| Param        | Type | Required | Description                | Example                                |
| ------------ | ---- | -------- | -------------------------- | -------------------------------------- |
| `hoc_ky_id`  | UUID | ✅       | ID học kỳ                  | `f416c2df-acea-4dd5-9e24-e8a36a56276b` |
| `date_start` | Date | ✅       | Ngày bắt đầu (YYYY-MM-DD)  | `2025-10-13`                           |
| `date_end`   | Date | ✅       | Ngày kết thúc (YYYY-MM-DD) | `2025-10-19`                           |

---

## ✅ Success Response (200)

```json
{
  "isSuccess": true,
  "message": "Lấy TKB theo tuần thành công",
  "data": [
    {
      "thu": 2,
      "tiet_bat_dau": 1,
      "tiet_ket_thuc": 5,
      "phong": {
        "id": "uuid-phong",
        "ma_phong": "A101"
      },
      "lop_hoc_phan": {
        "id": "uuid-lop",
        "ma_lop": "COMP1010_1"
      },
      "mon_hoc": {
        "ma_mon": "COMP1010",
        "ten_mon": "Lập trình cơ bản"
      },
      "giang_vien": "Nguyễn Văn A",
      "ngay_hoc": "2025-10-13T00:00:00.000Z"
    },
    {
      "thu": 2,
      "tiet_bat_dau": 6,
      "tiet_ket_thuc": 9,
      "phong": {
        "id": "uuid-phong-2",
        "ma_phong": "B203"
      },
      "lop_hoc_phan": {
        "id": "uuid-lop-2",
        "ma_lop": "MATH1020_2"
      },
      "mon_hoc": {
        "ma_mon": "MATH1020",
        "ten_mon": "Giải tích 1"
      },
      "giang_vien": "Trần Thị B",
      "ngay_hoc": "2025-10-13T00:00:00.000Z"
    },
    {
      "thu": 3,
      "tiet_bat_dau": 1,
      "tiet_ket_thuc": 5,
      "phong": {
        "id": "uuid-phong-3",
        "ma_phong": "C304"
      },
      "lop_hoc_phan": {
        "id": "uuid-lop-3",
        "ma_lop": "ENG1001_5"
      },
      "mon_hoc": {
        "ma_mon": "ENG1001",
        "ten_mon": "English 1"
      },
      "giang_vien": "Lê Văn C",
      "ngay_hoc": "2025-10-14T00:00:00.000Z"
    }
  ]
}
```

---

## ❌ Error Responses

### Missing Parameters (400)

```json
{
  "isSuccess": false,
  "message": "Thiếu học kỳ ID, ngày bắt đầu hoặc ngày kết thúc"
}
```

### Invalid Date Format (400)

```json
{
  "isSuccess": false,
  "message": "Ngày không hợp lệ"
}
```

### No Classes Registered (200)

```json
{
  "isSuccess": true,
  "message": "Chưa đăng ký lớp nào",
  "data": []
}
```

---

## 📝 Response Data Structure

| Field                 | Type           | Description                            |
| --------------------- | -------------- | -------------------------------------- |
| `thu`                 | number         | Thứ trong tuần (1=CN, 2=T2, ..., 7=T7) |
| `tiet_bat_dau`        | number         | Tiết bắt đầu                           |
| `tiet_ket_thuc`       | number         | Tiết kết thúc                          |
| `phong.id`            | UUID           | ID phòng học                           |
| `phong.ma_phong`      | string         | Mã phòng (A101, B203, ...)             |
| `lop_hoc_phan.id`     | UUID           | ID lớp học phần                        |
| `lop_hoc_phan.ma_lop` | string         | Mã lớp (COMP1010_1)                    |
| `mon_hoc.ma_mon`      | string         | Mã môn học                             |
| `mon_hoc.ten_mon`     | string         | Tên môn học                            |
| `giang_vien`          | string \| null | Tên giảng viên                         |
| `ngay_hoc`            | Date           | Ngày học cụ thể                        |

---

## 🧪 Testing với cURL

```bash
curl -X GET \
  'http://localhost:3000/api/sv/tkb-weekly?hoc_ky_id=f416c2df-acea-4dd5-9e24-e8a36a56276b&date_start=2025-10-13&date_end=2025-10-19' \
  -H 'Authorization: Bearer <sinh_vien_token>'
```

---

## 📊 Use Cases

### 1. Lấy TKB tuần này

```javascript
const today = new Date();
const monday = new Date(today);
monday.setDate(today.getDate() - today.getDay() + 1);

const sunday = new Date(monday);
sunday.setDate(monday.getDate() + 6);

const response = await fetch(
  `/api/sv/tkb-weekly?hoc_ky_id=${hocKyId}&date_start=${
    monday.toISOString().split("T")[0]
  }&date_end=${sunday.toISOString().split("T")[0]}`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);
```

### 2. Lấy TKB tháng này

```javascript
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

const response = await fetch(
  `/api/sv/tkb-weekly?hoc_ky_id=${hocKyId}&date_start=${
    firstDay.toISOString().split("T")[0]
  }&date_end=${lastDay.toISOString().split("T")[0]}`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);
```

---

## 🔄 So sánh với API TKB Giảng viên

| Feature         | Sinh viên                | Giảng viên                   |
| --------------- | ------------------------ | ---------------------------- |
| **Endpoint**    | `GET /api/sv/tkb-weekly` | `GET /api/gv/tkb-weekly`     |
| **Data source** | `dang_ky_tkb`            | `lop_hoc_phan.giang_vien_id` |
| **Filter**      | Lớp đã đăng ký           | Lớp đang giảng dạy           |
| **Extra field** | `giang_vien`             | ❌ Không có                  |
| **Logic**       | ✅ Giống hệt GV          | ✅                           |

---

## 📌 Notes

1. **Chỉ lấy lớp đã đăng ký** (`trang_thai = 'da_dang_ky'`)
2. **Sắp xếp theo ngày + tiết** (tự động)
3. **Date format**: `YYYY-MM-DD` (ISO 8601)
4. **`thu` mapping**:
   - 1 = Chủ Nhật
   - 2 = Thứ Hai
   - 3 = Thứ Ba
   - ...
   - 7 = Thứ Bảy

---

**Version:** 1.0  
**Last Updated:** 2025-01-26  
**Author:** Backend Team
