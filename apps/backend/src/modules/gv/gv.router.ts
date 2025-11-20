import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { upload } from "../../middlewares/upload";
import {
  getMyLopHocPhanHandler,
  getLopHocPhanDetailHandler,
  getStudentsOfLHPHandler,
  getDocumentsHandler,
  uploadDocumentHandler,
  updateDocumentHandler,
  deleteDocumentHandler,
  getGradesHandler,
  upsertGradesHandler,
  downloadDocumentHandler,
} from "./gv_ql_lophocphan_service";
import { getTKBWeeklyHandler } from "./gv_service";

const r = Router();

r.get("/me", requireAuth, requireRole(["giang_vien"]), (req, res) => {
  res.json({ ok: true, role: req.auth!.role });
});

// ✅ Lấy TKB theo tuần
r.get(
  "/tkb-weekly",
  requireAuth,
  requireRole(["giang_vien"]),
  getTKBWeeklyHandler
);

// ✅ Lấy các LHP mà GV phụ trách
r.get(
  "/lop-hoc-phan",
  requireAuth,
  requireRole(["giang_vien"]),
  getMyLopHocPhanHandler
);

// ✅ Chi tiết 1 LHP
r.get(
  "/lop-hoc-phan/:id",
  requireAuth,
  requireRole(["giang_vien"]),
  getLopHocPhanDetailHandler
);

// ✅ Danh sách sinh viên đăng ký LHP
r.get(
  "/lop-hoc-phan/:id/sinh-vien",
  requireAuth,
  requireRole(["giang_vien"]),
  getStudentsOfLHPHandler
);

// ✅ Tài liệu
r.get(
  "/lop-hoc-phan/:id/tai-lieu",
  requireAuth,
  requireRole(["giang_vien"]),
  getDocumentsHandler
);

// ✅ Upload tài liệu (multipart/form-data)
r.post(
  "/lop-hoc-phan/:id/tai-lieu/upload",
  requireAuth,
  requireRole(["giang_vien"]),
  upload.single("file"),
  uploadDocumentHandler
);

// ✅ Update tên tài liệu
r.put(
  "/lop-hoc-phan/:id/tai-lieu/:docId",
  requireAuth,
  requireRole(["giang_vien"]),
  updateDocumentHandler
);

r.delete(
  "/lop-hoc-phan/:id/tai-lieu/:docId",
  requireAuth,
  requireRole(["giang_vien"]),
  deleteDocumentHandler
);

// ✅ Download tài liệu (stream file từ S3)
r.get(
  "/lop-hoc-phan/:id/tai-lieu/:docId/download",
  requireAuth,
  requireRole(["giang_vien"]),
  downloadDocumentHandler
);

// ✅ Điểm
r.get(
  "/lop-hoc-phan/:id/diem",
  requireAuth,
  requireRole(["giang_vien"]),
  getGradesHandler
);

r.put(
  "/lop-hoc-phan/:id/diem",
  requireAuth,
  requireRole(["giang_vien"]),
  upsertGradesHandler
);

export default r;
