# 📄 API Đăng ký học phần cho Sinh viên

## Base URL

```
http://localhost:3000/api/sv
```

## Authentication

Tất cả API yêu cầu Bearer Token và role `sinh_vien`:

```
Authorization: Bearer <token>
```

---

## 1. API Đăng ký học phần

### Endpoint

```http
POST /dang-ky-hoc-phan
```

### Mô tả

Sinh viên đăng ký một lớp học phần trong học kỳ.

### Request Body

```json
{
  "lop_hoc_phan_id": "uuid-lop",
  "hoc_ky_id": "uuid-hoc-ky"
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

### Response Error Examples

#### Phase chưa mở (400)

```json
{
  "isSuccess": false,
  "message": "Chưa đến giai đoạn đăng ký học phần hoặc phase đã đóng",
  "errorCode": "PHASE_NOT_OPEN"
}
```

#### Chưa ghi danh (400)

```json
{
  "isSuccess": false,
  "message": "Bạn phải ghi danh học phần này trước khi đăng ký lớp",
  "errorCode": "NOT_GHI_DANH"
}
```

#### Đã đăng ký môn này rồi (400)

```json
{
  "isSuccess": false,
  "message": "Bạn đã đăng ký một lớp khác của cùng môn trong học kỳ này",
  "errorCode": "ALREADY_REGISTERED_MON_HOC"
}
```

#### Lớp đã đầy (400)

```json
{
  "isSuccess": false,
  "message": "Lớp học phần đã đầy",
  "errorCode": "LHP_FULL"
}
```

#### Xung đột lịch học (400)

```json
{
  "isSuccess": false,
  "message": "Xung đột lịch học với môn COMP1010 - Lớp COMP1010_2",
  "errorCode": "TKB_CONFLICT"
}
```

### Validation Rules

1. ✅ **Phase đang mở**: Check `ky_phase` với `phase = 'dang_ky_hoc_phan'` và `is_enabled = true`
2. ✅ **Đã ghi danh**: Check record trong `ghi_danh_hoc_phan` với `trang_thai = 'da_ghi_danh'`
3. ✅ **Không trùng môn**: Không đăng ký 2 lớp của cùng 1 môn trong học kỳ
4. ✅ **Lớp còn chỗ**: `so_luong_hien_tai < so_luong_toi_da`
5. ✅ **Không xung đột TKB**: Check thứ + tiết với các lớp đã đăng ký

### Transaction ACID

```sql
BEGIN;
  -- 1. Tạo record dang_ky_hoc_phan
  INSERT INTO dang_ky_hoc_phan (sinh_vien_id, lop_hoc_phan_id, trang_thai, co_xung_dot);

  -- 2. Tạo/update lich_su_dang_ky
  INSERT INTO lich_su_dang_ky (sinh_vien_id, hoc_ky_id) ON CONFLICT DO NOTHING;

  -- 3. Tạo chi_tiet_lich_su_dang_ky (hanh_dong = 'dang_ky')
  INSERT INTO chi_tiet_lich_su_dang_ky (lich_su_dang_ky_id, dang_ky_hoc_phan_id, hanh_dong);

  -- 4. Tạo dang_ky_tkb
  INSERT INTO dang_ky_tkb (dang_ky_id, sinh_vien_id, lop_hoc_phan_id);

  -- 5. Tăng so_luong_hien_tai +1
  UPDATE lop_hoc_phan SET so_luong_hien_tai = so_luong_hien_tai + 1 WHERE id = ?;
COMMIT;
```

---

## 2. API Hủy đăng ký học phần

### Endpoint

```http
POST /huy-dang-ky-hoc-phan
```

### Mô tả

Sinh viên hủy đăng ký một lớp học phần đã đăng ký.

### Request Body

```json
{
  "lop_hoc_phan_id": "uuid-lop"
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

### Response Error Examples

#### Không tìm thấy record (400)

```json
{
  "isSuccess": false,
  "message": "Không tìm thấy record đăng ký học phần",
  "errorCode": "DANG_KY_NOT_FOUND"
}
```

#### Đã hủy trước đó (400)

```json
{
  "isSuccess": false,
  "message": "Đăng ký học phần đã được hủy trước đó",
  "errorCode": "ALREADY_CANCELLED"
}
```

#### Quá hạn hủy (400)

```json
{
  "isSuccess": false,
  "message": "Đã quá hạn hủy đăng ký học phần",
  "errorCode": "PAST_CANCEL_DEADLINE"
}
```

### Validation Rules

1. ✅ **Record tồn tại**: Check `dang_ky_hoc_phan` với `sinh_vien_id` và `lop_hoc_phan_id`
2. ✅ **Chưa bị hủy**: `trang_thai != 'da_huy'`
3. ✅ **Trong đợt đăng ký**: Check `dot_dang_ky` với `loai_dot = 'dang_ky'` đang active
4. ✅ **Chưa quá hạn hủy**: `NOW() <= han_huy_den` (nếu có)

### Transaction ACID

```sql
BEGIN;
  -- 1. Update trang_thai = 'da_huy'
  UPDATE dang_ky_hoc_phan SET trang_thai = 'da_huy' WHERE id = ?;

  -- 2. Xóa dang_ky_tkb
  DELETE FROM dang_ky_tkb WHERE dang_ky_id = ?;

  -- 3. Tạo chi_tiet_lich_su_dang_ky (hanh_dong = 'huy')
  INSERT INTO chi_tiet_lich_su_dang_ky (lich_su_dang_ky_id, dang_ky_hoc_phan_id, hanh_dong);

  -- 4. Giảm so_luong_hien_tai -1
  UPDATE lop_hoc_phan SET so_luong_hien_tai = so_luong_hien_tai - 1 WHERE id = ?;
COMMIT;
```

---

## 3. API Chuyển lớp học phần

### Endpoint

```http
POST /chuyen-lop-hoc-phan
```

### Mô tả

Sinh viên chuyển từ lớp A sang lớp B của cùng 1 môn học.

### Request Body

```json
{
  "lop_hoc_phan_id_cu": "uuid-lop-cu",
  "lop_hoc_phan_id_moi": "uuid-lop-moi"
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

### Response Error Examples

#### Không tìm thấy lớp cũ (400)

```json
{
  "isSuccess": false,
  "message": "Không tìm thấy record đăng ký lớp cũ",
  "errorCode": "OLD_CLASS_NOT_FOUND"
}
```

#### Lớp cũ đã bị hủy (400)

```json
{
  "isSuccess": false,
  "message": "Lớp cũ đã bị hủy, không thể chuyển",
  "errorCode": "OLD_CLASS_CANCELLED"
}
```

#### Khác môn học (400)

```json
{
  "isSuccess": false,
  "message": "Lớp mới không cùng môn học với lớp cũ",
  "errorCode": "DIFFERENT_SUBJECT"
}
```

#### Lớp mới đã đầy (400)

```json
{
  "isSuccess": false,
  "message": "Lớp mới đã đầy",
  "errorCode": "NEW_CLASS_FULL"
}
```

#### Xung đột TKB (400)

```json
{
  "isSuccess": false,
  "message": "Xung đột lịch học với môn MATH1020 - Lớp MATH1020_1",
  "errorCode": "TKB_CONFLICT"
}
```

### Validation Rules

1. ✅ **Record lớp cũ tồn tại**: Check `dang_ky_hoc_phan` với `trang_thai = 'da_dang_ky'`
2. ✅ **Lớp mới tồn tại**: Check `lop_hoc_phan` với `lop_hoc_phan_id_moi`
3. ✅ **Cùng môn học**: `hoc_phan.mon_hoc_id` của 2 lớp phải giống nhau
4. ✅ **Lớp mới còn chỗ**: `so_luong_hien_tai < so_luong_toi_da`
5. ✅ **Không xung đột TKB**: Check với các lớp đã đăng ký **khác** (bỏ qua lớp cũ)

### Transaction ACID

```sql
BEGIN;
  -- 1. Update lop_hoc_phan_id
  UPDATE dang_ky_hoc_phan SET lop_hoc_phan_id = ? WHERE id = ?;

  -- 2. Update dang_ky_tkb
  UPDATE dang_ky_tkb SET lop_hoc_phan_id = ? WHERE dang_ky_id = ?;

  -- 3. Tạo chi_tiet_lich_su_dang_ky (hanh_dong = 'chuyen_lop')
  INSERT INTO chi_tiet_lich_su_dang_ky (lich_su_dang_ky_id, dang_ky_hoc_phan_id, hanh_dong);

  -- 4. Giảm so_luong_hien_tai lớp cũ -1
  UPDATE lop_hoc_phan SET so_luong_hien_tai = so_luong_hien_tai - 1 WHERE id = ?;

  -- 5. Tăng so_luong_hien_tai lớp mới +1
  UPDATE lop_hoc_phan SET so_luong_hien_tai = so_luong_hien_tai + 1 WHERE id = ?;
COMMIT;
```

---

## So sánh 3 APIs

| Thuộc tính              | Đăng ký                             | Hủy đăng ký                    | Chuyển lớp                         |
| ----------------------- | ----------------------------------- | ------------------------------ | ---------------------------------- |
| **Endpoint**            | `POST /dang-ky-hoc-phan`            | `POST /huy-dang-ky-hoc-phan`   | `POST /chuyen-lop-hoc-phan`        |
| **Action**              | INSERT record mới                   | UPDATE `trang_thai = 'da_huy'` | UPDATE `lop_hoc_phan_id`           |
| **`so_luong_hien_tai`** | +1 lớp mới                          | -1 lớp cũ                      | -1 lớp cũ, +1 lớp mới              |
| **Check ghi danh**      | ✅ Bắt buộc                         | ❌ Không                       | ❌ Không                           |
| **Check xung đột TKB**  | ✅ Với tất cả lớp đã đăng ký        | ❌ Không                       | ✅ Với lớp đã đăng ký (trừ lớp cũ) |
| **Check trùng môn**     | ✅ Không cho đăng ký 2 lớp cùng môn | ❌ Không                       | ✅ Chỉ cho chuyển cùng môn         |
| **Log history**         | `hanh_dong = 'dang_ky'`             | `hanh_dong = 'huy'`            | `hanh_dong = 'chuyen_lop'`         |

---

## Testing với Postman

### 1. Đăng ký học phần

```http
POST {{base_url}}/sv/dang-ky-hoc-phan
Authorization: Bearer {{sv_token}}
Content-Type: application/json

{
  "lop_hoc_phan_id": "{{lop_id}}",
  "hoc_ky_id": "{{hoc_ky_id}}"
}
```

### 2. Hủy đăng ký học phần

```http
POST {{base_url}}/sv/huy-dang-ky-hoc-phan
Authorization: Bearer {{sv_token}}
Content-Type: application/json

{
  "lop_hoc_phan_id": "{{lop_id}}"
}
```

### 3. Chuyển lớp học phần

```http
POST {{base_url}}/sv/chuyen-lop-hoc-phan
Authorization: Bearer {{sv_token}}
Content-Type: application/json

{
  "lop_hoc_phan_id_cu": "{{lop_cu_id}}",
  "lop_hoc_phan_id_moi": "{{lop_moi_id}}"
}
```

---

## Error Codes Summary

| Error Code                   | Ý nghĩa                            | HTTP Status |
| ---------------------------- | ---------------------------------- | ----------- |
| `PHASE_NOT_OPEN`             | Phase đăng ký chưa mở hoặc đã đóng | 400         |
| `NOT_GHI_DANH`               | Chưa ghi danh học phần             | 400         |
| `ALREADY_REGISTERED_MON_HOC` | Đã đăng ký môn này rồi (lớp khác)  | 400         |
| `LHP_FULL`                   | Lớp đã đầy                         | 400         |
| `TKB_CONFLICT`               | Xung đột lịch học                  | 400         |
| `DANG_KY_NOT_FOUND`          | Không tìm thấy record đăng ký      | 400         |
| `ALREADY_CANCELLED`          | Đã hủy trước đó                    | 400         |
| `PAST_CANCEL_DEADLINE`       | Quá hạn hủy                        | 400         |
| `OLD_CLASS_NOT_FOUND`        | Không tìm thấy lớp cũ              | 400         |
| `OLD_CLASS_CANCELLED`        | Lớp cũ đã bị hủy                   | 400         |
| `NEW_CLASS_NOT_FOUND`        | Không tìm thấy lớp mới             | 400         |
| `DIFFERENT_SUBJECT`          | Lớp mới khác môn với lớp cũ        | 400         |
| `NEW_CLASS_FULL`             | Lớp mới đã đầy                     | 400         |
| `INTERNAL_ERROR`             | Lỗi server                         | 500         |

---

## Database Tables Involved

### Tables được thay đổi:

1. **`dang_ky_hoc_phan`** - Record đăng ký chính
2. **`dang_ky_tkb`** - Tracking lịch học sinh viên
3. **`lich_su_dang_ky`** - Lịch sử đăng ký theo học kỳ
4. **`chi_tiet_lich_su_dang_ky`** - Chi tiết từng thao tác
5. **`lop_hoc_phan`** - Cập nhật `so_luong_hien_tai`

### Tables được đọc:

- `ky_phase` - Check phase
- `dot_dang_ky` - Check đợt đăng ký & hạn hủy
- `ghi_danh_hoc_phan` - Check đã ghi danh
- `hoc_phan`, `mon_hoc` - Thông tin môn học
- MongoDB `thoi_khoa_bieu` - Check xung đột TKB

---

## Notes

### 1. Phase đăng ký

- Phase `dang_ky_hoc_phan` phải được **enable** trong `ky_phase`
- PDT có thể bật/tắt phase theo thời gian thực

### 2. Hạn hủy đăng ký

- `han_huy_den` trong `dot_dang_ky` là **optional**
- Nếu không có → Sinh viên có thể hủy bất cứ lúc nào (trong đợt đăng ký)

### 3. Xung đột TKB

- Check với MongoDB collection `thoi_khoa_bieu`
- So sánh `thuTrongTuan` (thứ) + `tietBatDau`, `tietKetThuc`
- Overlap formula: `start1 <= end2 AND start2 <= end1`

### 4. Chuyển lớp vs Hủy + Đăng ký mới

**Chuyển lớp:**

- ✅ 1 transaction duy nhất
- ✅ Giữ nguyên history record
- ✅ Không mất log `chi_tiet_lich_su_dang_ky`

**Hủy + Đăng ký mới:**

- ❌ 2 transactions riêng biệt
- ❌ Mất record cũ (nếu trigger xóa)
- ❌ Có thể bị race condition (lớp mới đầy giữa chừng)

### 5. Database Triggers (Đã bị disable)

Các triggers sau **đã bị disable** để logic được xử lý hoàn toàn ở Backend:

- `dkhp_before_ins` - Validation trước khi insert
- `dkhp_before_upd` - Validation trước khi update
- `dkhp_after_insert` - Auto-update sau khi insert
- `dkhp_after_delete` - Auto-update sau khi delete

**Lý do disable:**

- Table `lich_hoc_dinh_ky` (PostgreSQL) đã RỖNG
- TKB đã refactor sang MongoDB (`thoi_khoa_bieu`)
- Trigger không thể check MongoDB → Lỗi!

---

## Contact & Support

- Backend Developer: [Your Team]
- Last Updated: 2025-01-26
- Version: 1.0.0
