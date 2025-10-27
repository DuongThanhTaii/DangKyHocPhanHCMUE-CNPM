# API Đăng Ký Học Phần - Sinh Viên

## Base URL
```
http://localhost:3000/api/sv
```

## Authentication
Tất cả API yêu cầu Bearer Token trong header:
```
Authorization: Bearer <token>
```

---

## 1. Check Phase Đăng Ký Học Phần

Kiểm tra xem phase đăng ký học phần có đang mở không.

### Endpoint
```http
GET /check-phase-dang-ky?hoc_ky_id={hocKyId}
```

### Query Parameters
| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| hoc_ky_id | string (UUID) | ✅ | ID học kỳ hiện hành |

### Response Success (200)
```json
{
  "isSuccess": true,
  "message": "Phase đăng ký học phần đang mở",
  "data": null
}
```

### Response Error (400)
```json
{
  "isSuccess": false,
  "message": "Đang ở phase: ghi_danh. Chưa đến phase đăng ký học phần",
  "errorCode": "WRONG_PHASE"
}
```

```json
{
  "isSuccess": false,
  "message": "Chưa có phase nào đang mở",
  "errorCode": "NO_ACTIVE_PHASE"
}
```

---

## 2. Load Danh Sách Lớp Học Phần (Chưa Đăng Ký)

Lấy danh sách lớp học phần **chưa đăng ký**, phân cụm theo: Môn Chung, Bắt Buộc, Tự Chọn.

### Endpoint
```http
GET /lop-hoc-phan?hoc_ky_id={hocKyId}
```

### Query Parameters
| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| hoc_ky_id | string (UUID) | ✅ | ID học kỳ hiện hành |

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
            "id": "uuid-lop-1",
            "maLop": "COMP1010_1",
            "tenLop": "COMP1010_1",
            "soLuongHienTai": 45,
            "soLuongToiDa": 50,
            "tkb": [
              {
                "thu": 2,
                "tiet": "1 - 5",
                "phong": "I.202",
                "giangVien": "Nguyễn Văn A",
                "ngayBatDau": "20/10/2025",
                "ngayKetThuc": "20/12/2025",
                "formatted": "Thứ Hai, Tiết(1 - 5), I.202, Nguyễn Văn A\n(20/10/2025 -> 20/12/2025)"
              }
            ]
          },
          {
            "id": "uuid-lop-2",
            "maLop": "COMP1010_2",
            "tenLop": "COMP1010_2",
            "soLuongHienTai": 30,
            "soLuongToiDa": 50,
            "tkb": [
              {
                "thu": 3,
                "tiet": "6 - 10",
                "phong": "I.203",
                "giangVien": "Trần Thị B",
                "ngayBatDau": "20/10/2025",
                "ngayKetThuc": "20/12/2025",
                "formatted": "Thứ Ba, Tiết(6 - 10), I.203, Trần Thị B\n(20/10/2025 -> 20/12/2025)"
              }
            ]
          }
        ]
      }
    ],
    "batBuoc": [
      {
        "maMon": "COMP1325",
        "tenMon": "Cấu trúc dữ liệu",
        "soTinChi": 3,
        "danhSachLop": [...]
      }
    ],
    "tuChon": [
      {
        "maMon": "COMP2010",
        "tenMon": "Trí tuệ nhân tạo",
        "soTinChi": 3,
        "danhSachLop": [...]
      }
    ]
  }
}
```

### Response Structure
```typescript
interface DanhSachLopHocPhanDTO {
  monChung: MonHocInfoDTO[];
  batBuoc: MonHocInfoDTO[];
  tuChon: MonHocInfoDTO[];
}

interface MonHocInfoDTO {
  maMon: string;
  tenMon: string;
  soTinChi: number;
  danhSachLop: LopHocPhanItemDTO[];
}

interface LopHocPhanItemDTO {
  id: string;
  maLop: string;
  tenLop: string;
  soLuongHienTai: number;
  soLuongToiDa: number;
  tkb: TKBItemDTO[];
}

interface TKBItemDTO {
  thu: number; // 2=Thứ Hai, 3=Thứ Ba,...
  tiet: string; // "1 - 5"
  phong: string; // "I.202"
  giangVien: string;
  ngayBatDau: string; // "20/10/2025"
  ngayKetThuc: string; // "20/12/2025"
  formatted: string; // String đã format sẵn để hiển thị
}
```

---

## 3. Load Danh Sách Lớp Đã Đăng Ký

Lấy danh sách lớp học phần **đã đăng ký** của sinh viên.

### Endpoint
```http
GET /lop-da-dang-ky?hoc_ky_id={hocKyId}
```

### Query Parameters
| Tên | Kiểu | Bắt buộc | Mô tả |
|-----|------|----------|-------|
| hoc_ky_id | string (UUID) | ✅ | ID học kỳ hiện hành |

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
          "id": "uuid-lop-1",
          "maLop": "COMP1010_1",
          "tenLop": "COMP1010_1",
          "soLuongHienTai": 46,
          "soLuongToiDa": 50,
          "tkb": [
            {
              "thu": 2,
              "tiet": "1 - 5",
              "phong": "I.202",
              "giangVien": "Nguyễn Văn A",
              "ngayBatDau": "20/10/2025",
              "ngayKetThuc": "20/12/2025",
              "formatted": "Thứ Hai, Tiết(1 - 5), I.202, Nguyễn Văn A\n(20/10/2025 -> 20/12/2025)"
            }
          ]
        }
      ]
    }
  ]
}
```

### Response Structure
```typescript
// Array of MonHocInfoDTO (không phân cụm)
type DanhSachLopDaDangKyDTO = MonHocInfoDTO[];
```

---

## 4. Đăng Ký Học Phần

Đăng ký một lớp học phần cho sinh viên.

### Endpoint
```http
POST /dang-ky-hoc-phan
```

### Request Body
```json
{
  "lop_hoc_phan_id": "uuid-lop-1",
  "hoc_ky_id": "uuid-hoc-ky"
}
```

### Request Body Schema
```typescript
interface DangKyHocPhanRequest {
  lop_hoc_phan_id: string; // UUID của lớp học phần
  hoc_ky_id: string;       // UUID của học kỳ hiện hành
}
```

### Response Success (201)
```json
{
  "isSuccess": true,
  "message": "Đăng ký học phần thành công",
  "data": null
}
```

### Response Error (400)

#### 1. Phase không mở
```json
{
  "isSuccess": false,
  "message": "Chưa đến giai đoạn đăng ký học phần hoặc phase đã đóng",
  "errorCode": "PHASE_NOT_OPEN"
}
```

#### 2. Lớp không tồn tại
```json
{
  "isSuccess": false,
  "message": "Lớp học phần không tồn tại",
  "errorCode": "LHP_NOT_FOUND"
}
```

#### 3. Lớp đã đầy
```json
{
  "isSuccess": false,
  "message": "Lớp học phần đã đầy",
  "errorCode": "LHP_FULL"
}
```

#### 4. Đã đăng ký lớp này rồi
```json
{
  "isSuccess": false,
  "message": "Bạn đã đăng ký lớp học phần này rồi",
  "errorCode": "ALREADY_REGISTERED"
}
```

#### 5. Xung đột thời khóa biểu
```json
{
  "isSuccess": false,
  "message": "Xung đột lịch học với môn COMP1325 - Lớp COMP1325_1",
  "errorCode": "TKB_CONFLICT"
}
```

---

## Error Codes Summary

| Error Code | Ý nghĩa | HTTP Status |
|-----------|---------|-------------|
| `PHASE_NOT_OPEN` | Phase đăng ký chưa mở hoặc đã đóng | 400 |
| `WRONG_PHASE` | Đang ở phase khác (không phải đăng ký học phần) | 400 |
| `NO_ACTIVE_PHASE` | Chưa có phase nào được kích hoạt | 400 |
| `LHP_NOT_FOUND` | Lớp học phần không tồn tại | 400 |
| `LHP_FULL` | Lớp học phần đã đầy | 400 |
| `ALREADY_REGISTERED` | Sinh viên đã đăng ký lớp này rồi | 400 |
| `TKB_CONFLICT` | Xung đột lịch học với lớp đã đăng ký | 400 |
| `INTERNAL_ERROR` | Lỗi server | 500 |

---

## Flow Đăng Ký Học Phần (Recommended)

### Bước 1: Check Phase
```typescript
const checkPhase = async (hocKyId: string) => {
  const res = await fetch(`/api/sv/check-phase-dang-ky?hoc_ky_id=${hocKyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  
  if (!data.isSuccess) {
    // Hiển thị thông báo phase chưa mở
    alert(data.message);
    return false;
  }
  return true;
};
```

### Bước 2: Load Danh Sách Lớp
```typescript
const loadDanhSachLop = async (hocKyId: string) => {
  const res = await fetch(`/api/sv/lop-hoc-phan?hoc_ky_id=${hocKyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  
  return data.data; // { monChung, batBuoc, tuChon }
};
```

### Bước 3: Đăng Ký
```typescript
const dangKyLop = async (lopId: string, hocKyId: string) => {
  const res = await fetch('/api/sv/dang-ky-hoc-phan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      lop_hoc_phan_id: lopId,
      hoc_ky_id: hocKyId
    })
  });
  
  const data = await res.json();
  
  if (data.isSuccess) {
    alert('Đăng ký thành công!');
    // Reload lại danh sách
    await loadDanhSachLop(hocKyId);
  } else {
    alert(`Lỗi: ${data.message}`);
  }
};
```

### Bước 4: Load Lớp Đã Đăng Ký
```typescript
const loadLopDaDangKy = async (hocKyId: string) => {
  const res = await fetch(`/api/sv/lop-da-dang-ky?hoc_ky_id=${hocKyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  
  return data.data; // Array of MonHocInfoDTO
};
```

---

## Notes

### 1. Validation Tự Động
Backend sẽ tự động check:
- ✅ Phase đăng ký có đang mở không
- ✅ Lớp còn chỗ không
- ✅ Sinh viên đã đăng ký lớp này chưa
- ✅ Xung đột thời khóa biểu

### 2. Transaction ACID
API đăng ký sử dụng transaction để đảm bảo:
- Tạo record `dang_ky_hoc_phan`
- Tạo record `lich_su_dang_ky` (hoặc reuse nếu đã có)
- Tạo record `chi_tiet_lich_su_dang_ky`
- Tạo record `dang_ky_tkb`
- Update `so_luong_hien_tai` +1

### 3. Filter Lớp Đã Đăng Ký
API `/lop-hoc-phan` tự động **filter** ra các lớp mà sinh viên đã đăng ký rồi.

### 4. Format TKB
Field `formatted` trong `TKBItemDTO` đã được backend format sẵn để FE có thể hiển thị trực tiếp:
```
Thứ Hai, Tiết(1 - 5), I.202, Nguyễn Văn A
(20/10/2025 -> 20/12/2025)
```

### 5. Phân Cụm Logic
- **Môn Chung**: `la_mon_chung = true`
- **Bắt Buộc**: `la_mon_chung = false` + `loai_mon = 'chuyen_nganh'`
- **Tự Chọn**: `la_mon_chung = false` + `loai_mon = 'tu_chon'`

---

## Testing với Postman/Thunder Client

### 1. Set Environment Variables
```
base_url = http://localhost:3000
token = <your_jwt_token>
hoc_ky_id = <uuid_hoc_ky>
```

### 2. Test Sequence
1. **Check Phase**: `GET {{base_url}}/api/sv/check-phase-dang-ky?hoc_ky_id={{hoc_ky_id}}`
2. **Load Lớp**: `GET {{base_url}}/api/sv/lop-hoc-phan?hoc_ky_id={{hoc_ky_id}}`
3. **Đăng Ký**: `POST {{base_url}}/api/sv/dang-ky-hoc-phan` với body JSON
4. **Check Đã Đăng Ký**: `GET {{base_url}}/api/sv/lop-da-dang-ky?hoc_ky_id={{hoc_ky_id}}`

---

## Contact & Support
- Backend Developer: [Your Name]
- Last Updated: 2025-01-24
- Version: 1.0.0
