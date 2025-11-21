# 📘 API Quản lý Tài liệu - Giảng viên

## 🔑 Authentication

```
Authorization: Bearer <giang_vien_token>
```

---

## 1️⃣ Lấy danh sách tài liệu của lớp

```http
GET /api/gv/lop-hoc-phan/:id/tai-lieu
```

### URL Parameters

- `id` (required): UUID lớp học phần

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Lấy danh sách tài liệu thành công",
  "data": [
    {
      "id": "uuid-tai-lieu",
      "lop_hoc_phan_id": "uuid-lop",
      "ten_tai_lieu": "Slide bài giảng 1.pdf",
      "file_path": "hoc-phan/COMP1010/lop-01/a1b2c3d4-slide.pdf",
      "file_type": "application/pdf",
      "uploaded_by": "uuid-giang-vien",
      "created_at": "2025-01-26T10:30:00.000Z"
    }
  ]
}
```

### Response Error (400)

```json
{
  "isSuccess": false,
  "message": "Lớp học phần không tồn tại",
  "errorCode": "LHP_NOT_FOUND"
}
```

```json
{
  "isSuccess": false,
  "message": "Không có quyền truy cập",
  "errorCode": "FORBIDDEN"
}
```

---

## 2️⃣ Upload tài liệu lên S3

```http
POST /api/gv/lop-hoc-phan/:id/tai-lieu/upload
Content-Type: multipart/form-data
```

### URL Parameters

- `id` (required): UUID lớp học phần

### Request Body (multipart/form-data)

```
file: <binary file>                  (required, max 100MB)
ten_tai_lieu: "Slide bài giảng 1"    (optional)
```

### File Types cho phép

- **Documents:** PDF, DOCX, PPTX, TXT
- **Videos:** MP4
- **Images:** JPG, PNG
- **Archives:** ZIP

### Response Success (201)

```json
{
  "isSuccess": true,
  "message": "Upload tài liệu thành công",
  "data": {
    "id": "uuid-tai-lieu",
    "tenTaiLieu": "Slide bài giảng 1",
    "fileType": "application/pdf",
    "fileUrl": "https://hcmue-tailieu-hoctap-20251029.s3.ap-southeast-2.amazonaws.com/hoc-phan/COMP1010/lop-01/a1b2c3d4-slide.pdf"
  }
}
```

### Response Error Examples

#### Không có file (400)

```json
{
  "isSuccess": false,
  "message": "Không có file được upload",
  "errorCode": "FILE_REQUIRED"
}
```

#### File quá lớn (400)

```json
{
  "isSuccess": false,
  "message": "File vượt quá giới hạn 100MB",
  "errorCode": "FILE_TOO_LARGE"
}
```

#### Không có quyền (403)

```json
{
  "isSuccess": false,
  "message": "Không có quyền truy cập",
  "errorCode": "FORBIDDEN"
}
```

#### File type không hợp lệ (400)

```json
{
  "isSuccess": false,
  "message": "File type not allowed: application/x-executable"
}
```

### cURL Example

```bash
curl -X POST \
  'http://localhost:3000/api/gv/lop-hoc-phan/uuid-lop/tai-lieu/upload' \
  -H 'Authorization: Bearer <token>' \
  -F 'file=@/path/to/slide.pdf' \
  -F 'ten_tai_lieu=Slide bài giảng 1'
```

### Postman

- Method: `POST`
- URL: `http://localhost:3000/api/gv/lop-hoc-phan/:id/tai-lieu/upload`
- Headers:
  - `Authorization: Bearer <token>`
- Body (form-data):
  - `file`: [Select File]
  - `ten_tai_lieu`: "Slide bài giảng 1" (optional)

---

## 3️⃣ Update tên tài liệu

```http
PUT /api/gv/lop-hoc-phan/:id/tai-lieu/:docId
```

### URL Parameters

- `id` (required): UUID lớp học phần
- `docId` (required): UUID tài liệu

### Request Body

```json
{
  "ten_tai_lieu": "Slide bài giảng 1 (Updated)"
}
```

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Cập nhật tên tài liệu thành công",
  "data": {
    "id": "uuid-tai-lieu",
    "tenTaiLieu": "Slide bài giảng 1 (Updated)",
    "filePath": "hoc-phan/COMP1010/lop-01/a1b2c3d4-slide.pdf"
  }
}
```

### Response Error (400)

```json
{
  "isSuccess": false,
  "message": "Tài liệu không tồn tại",
  "errorCode": "DOCUMENT_NOT_FOUND"
}
```

```json
{
  "isSuccess": false,
  "message": "Tên tài liệu không được rỗng",
  "errorCode": "INVALID_NAME"
}
```

### Notes

- ⚠️ **Chỉ update `ten_tai_lieu`** trong database
- ⚠️ **File trên S3 giữ nguyên** (không rename file)
- ✅ Validate quyền GV trước khi update

### cURL Example

```bash
curl -X PUT \
  "http://localhost:3000/api/gv/lop-hoc-phan/uuid-lop/tai-lieu/uuid-doc" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ten_tai_lieu": "Slide bài giảng 1 (Updated)"}'
```

---

## 4️⃣ Download tài liệu

```http
GET /api/gv/lop-hoc-phan/:id/tai-lieu/:docId/download
```

### URL Parameters

- `id` (required): UUID lớp học phần
- `docId` (required): UUID tài liệu

### Response Success (302 Redirect)

**Browser sẽ redirect đến presigned URL của S3** (có hiệu lực trong 1 giờ):

```
https://hcmue-tailieu-hoctap-20251029.s3.ap-southeast-2.amazonaws.com/hoc-phan/...
?X-Amz-Algorithm=AWS4-HMAC-SHA256
&X-Amz-Credential=...
&X-Amz-Date=20250126T103000Z
&X-Amz-Expires=3600
&X-Amz-Signature=...
```

### Response Error (400)

```json
{
  "isSuccess": false,
  "message": "Tài liệu không tồn tại",
  "errorCode": "DOCUMENT_NOT_FOUND"
}
```

### cURL Example

```bash
curl -L \
  -H 'Authorization: Bearer <token>' \
  'http://localhost:3000/api/gv/lop-hoc-phan/uuid-lop/tai-lieu/uuid-doc/download' \
  --output downloaded-file.pdf
```

**Note:** `-L` để follow redirect

---

## 5️⃣ Xóa tài liệu

```http
DELETE /api/gv/lop-hoc-phan/:id/tai-lieu/:docId
```

### URL Parameters

- `id` (required): UUID lớp học phần
- `docId` (required): UUID tài liệu

### Response Success (200)

```json
{
  "isSuccess": true,
  "message": "Xóa tài liệu thành công",
  "data": null
}
```

### Response Error (400)

```json
{
  "isSuccess": false,
  "message": "Tài liệu không tồn tại",
  "errorCode": "DOCUMENT_NOT_FOUND"
}
```

### Side Effects

- ✅ Xóa file trên S3
- ✅ Xóa record trong database

---

## 📌 S3 Folder Structure

```
hcmue-tailieu-hoctap-20251029/
├── hoc-phan/
│   ├── COMP1010/
│   │   ├── lop-01/
│   │   │   ├── a1b2c3d4-slide-bai-giang-1.pdf
│   │   │   ├── b2c3d4e5-bai-tap-1.docx
│   │   │   └── c3d4e5f6-video-demo.mp4
│   │   └── lop-02/
│   │       ├── d4e5f6a7-slide-bai-giang-1.pdf
│   │       └── e5f6a7b8-code-example.zip
│   ├── MATH1020/
│   │   └── lop-01/
│   │       └── f6a7b8c9-cong-thuc.pdf
│   └── ...
```

**Naming Convention:**

- Format: `{uuid-8-chars}-{original-filename-sanitized}`
- Special characters được replace bằng `_`

---

## 🔒 Authorization Rules

| Action            | Rule                               |
| ----------------- | ---------------------------------- |
| **Lấy danh sách** | GV phải là `giang_vien_id` của lớp |
| **Upload**        | GV phải là `giang_vien_id` của lớp |
| **Download**      | GV phải là `giang_vien_id` của lớp |
| **Delete**        | GV phải là `giang_vien_id` của lớp |

---

## 📊 Database Schema

### Table: `tai_lieu`

```sql
CREATE TABLE tai_lieu (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lop_hoc_phan_id UUID NOT NULL REFERENCES lop_hoc_phan(id) ON DELETE CASCADE,
  ten_tai_lieu    VARCHAR(255) NOT NULL,
  file_path       VARCHAR(500) NOT NULL,  -- S3 key
  file_type       VARCHAR(100),            -- MIME type
  uploaded_by     UUID REFERENCES users(id),
  created_at      TIMESTAMP DEFAULT NOW()
);
```

**Important:**

- `file_path` lưu **S3 key** (VD: `hoc-phan/COMP1010/lop-01/a1b2c3d4-slide.pdf`)
- **KHÔNG** lưu full URL để dễ migrate S3 bucket

---

## ⚙️ Environment Variables Required

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=hcmue-tailieu-hoctap-20251029
AWS_REGION=ap-southeast-2
```

---

## 🧪 Testing Flow

### 1. Upload file

```bash
# Get GV token
TOKEN="eyJhbGc..."

# Upload file
curl -X POST \
  "http://localhost:3000/api/gv/lop-hoc-phan/uuid-lop/tai-lieu/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.pdf" \
  -F "ten_tai_lieu=Test Document"
```

### 2. List files

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/gv/lop-hoc-phan/uuid-lop/tai-lieu"
```

### 3. Download file

```bash
curl -L \
  -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/gv/lop-hoc-phan/uuid-lop/tai-lieu/uuid-doc/download" \
  -o downloaded.pdf
```

### 4. Delete file

```bash
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/gv/lop-hoc-phan/uuid-lop/tai-lieu/uuid-doc"
```

---

## 🐛 Common Errors & Solutions

### Error: "The current file is a CommonJS module..."

**Solution:** Dùng `import { randomUUID } from "crypto"` thay vì `uuid` package

### Error: "Property 'prisma' is private"

**Solution:** Tạo `TaiLieuRepository` và add vào `UnitOfWork`

### Error: "File type not allowed"

**Solution:** Check `fileFilter` trong `middlewares/upload.ts`

### Error: "Access Denied" khi download

**Solution:**

- Check AWS credentials
- Check S3 bucket permissions
- Check presigned URL expiration (default 1h)

---

## 📖 Related Documentation

- [AWS SDK S3 Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)

---

**Version:** 1.0  
**Last Updated:** 2025-01-26  
**Author:** Backend Team
