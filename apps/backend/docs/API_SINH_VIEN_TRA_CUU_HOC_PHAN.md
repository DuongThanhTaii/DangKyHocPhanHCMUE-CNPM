# 📖 API Tra cứu Học phần - Sinh viên

## Endpoint

```http
GET /api/sv/tra-cuu-hoc-phan?hoc_ky_id=<uuid>
```

## Authentication

```
Authorization: Bearer <sinh_vien_token>
```

## Query Parameters

| Param       | Type | Required | Description           |
| ----------- | ---- | -------- | --------------------- |
| `hoc_ky_id` | UUID | ✅       | ID học kỳ cần tra cứu |

## Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Tra cứu học phần thành công",
  "data": [
    {
      "stt": 1,
      "maMon": "COMP1060",
      "tenMon": "Phân tích thiết kế hướng đối tượng",
      "soTinChi": 3,
      "loaiMon": "chuyen_nganh",
      "danhSachLop": [
        {
          "id": "uuid-lop-1",
          "maLop": "COMP1060_1",
          "giangVien": "Nguyễn Văn A",
          "soLuongToiDa": 50,
          "soLuongHienTai": 35,
          "conSlot": 15,
          "thoiKhoaBieu": "Thứ Hai, Tiết(1 - 4), B.311\nThứ Tư, Tiết(3 - 6), B.310"
        },
        {
          "id": "uuid-lop-2",
          "maLop": "COMP1060_2",
          "giangVien": "Nguyễn Văn A",
          "soLuongToiDa": 50,
          "soLuongHienTai": 48,
          "conSlot": 2,
          "thoiKhoaBieu": "Thứ Ba, Tiết(3 - 6), B.310"
        }
      ]
    },
    {
      "stt": 2,
      "maMon": "MATH1020",
      "tenMon": "Giải tích 1",
      "soTinChi": 4,
      "loaiMon": "dai_cuong",
      "danhSachLop": [
        {
          "id": "uuid-lop-3",
          "maLop": "MATH1020_1",
          "giangVien": "Trần Thị B",
          "soLuongToiDa": 60,
          "soLuongHienTai": 45,
          "conSlot": 15,
          "thoiKhoaBieu": "Thứ Hai, Tiết(7 - 10), A.201"
        }
      ]
    }
  ]
}
```

## Response Structure

### Root Level

| Field       | Type    | Description           |
| ----------- | ------- | --------------------- |
| `isSuccess` | boolean | Trạng thái thành công |
| `message`   | string  | Thông báo             |
| `data`      | array   | Danh sách môn học     |

### Môn học Object

| Field         | Type   | Description                                      |
| ------------- | ------ | ------------------------------------------------ |
| `stt`         | number | Số thứ tự                                        |
| `maMon`       | string | Mã môn học (VD: COMP1060)                        |
| `tenMon`      | string | Tên môn học                                      |
| `soTinChi`    | number | Số tín chỉ                                       |
| `loaiMon`     | string | Loại môn: `chuyen_nganh`, `dai_cuong`, `tu_chon` |
| `danhSachLop` | array  | Danh sách lớp học phần                           |

### Lớp học phần Object

| Field            | Type   | Description             |
| ---------------- | ------ | ----------------------- |
| `id`             | UUID   | ID lớp học phần         |
| `maLop`          | string | Mã lớp (VD: COMP1060_1) |
| `giangVien`      | string | Tên giảng viên          |
| `soLuongToiDa`   | number | Sĩ số tối đa            |
| `soLuongHienTai` | number | Số SV đã đăng ký        |
| `conSlot`        | number | Số chỗ còn trống        |
| `thoiKhoaBieu`   | string | TKB (multiline string)  |

### TKB Format

```
Thứ X, Tiết(Y - Z), Phòng ABC
Thứ W, Tiết(A - B), Phòng DEF
```

## Response Error (400)

```json
{
  "isSuccess": false,
  "message": "Thiếu học kỳ ID"
}
```

## Use Case

### 1. Tra cứu toàn bộ môn học trong học kỳ

- Sinh viên xem tất cả môn đang mở
- Xem thông tin TKB, GV, số chỗ còn trống
- Phục vụ cho việc lên kế hoạch đăng ký

### 2. Filter trên FE

```javascript
// Group theo loại môn
const chuyenNganh = data.filter((mon) => mon.loaiMon === "chuyen_nganh");
const daiCuong = data.filter((mon) => mon.loaiMon === "dai_cuong");

// Lọc lớp còn chỗ
const lopConCho = data.flatMap((mon) =>
  mon.danhSachLop.filter((lop) => lop.conSlot > 0)
);
```

## Notes

- ✅ **Chỉ hiển thị lớp đang mở** (`trang_thai_lop = 'dang_mo'`)
- ✅ **Group theo môn học** - Mỗi môn có nhiều lớp
- ✅ **TKB dạng text** - Dễ hiển thị trên UI
- ✅ **Tự động tính `conSlot`** - Không cần FE tính
- ✅ **Sort theo mã môn** - Dễ tra cứu

## Example Request

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/sv/tra-cuu-hoc-phan?hoc_ky_id=f416c2df-acea-4dd5-9e24-e8a36a56276b"
```

---

**Version:** 1.0  
**Last Updated:** 2025-01-26  
**Author:** Backend Team
