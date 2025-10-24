import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { gvLopHocPhanService as svc } from "../../services/gvLopHocPhanService";
import {
  getMyLopHocPhanHandler,
  getTKBWeeklyHandler,
  getLopHocPhanDetailHandler,
  getStudentsOfLHPHandler,
} from "./gv_service";

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

// ✅ Danh sách sinh viên đã đăng ký LHP
r.get(
  "/lop-hoc-phan/:id/sinh-vien",
  requireAuth,
  requireRole(["giang_vien"]),
  getStudentsOfLHPHandler
);

// Tài liệu
r.get(
  "/lop-hoc-phan/:id/tai-lieu",
  requireAuth,
  requireRole(["giang_vien"]),
  async (req, res) => {
    const rows = await svc.documents(req.params.id, req.auth!.sub);
    res.json({ ok: true, data: rows });
  }
);

r.post(
  "/lop-hoc-phan/:id/tai-lieu",
  requireAuth,
  requireRole(["giang_vien"]),
  async (req, res) => {
    const { ten_tai_lieu, file_path, file_type } = req.body;
    const doc = await svc.createDocument(req.params.id, req.auth!.sub, {
      ten_tai_lieu,
      file_path,
      file_type,
    });
    res.json({ ok: true, data: doc });
  }
);

r.delete(
  "/lop-hoc-phan/:id/tai-lieu/:docId",
  requireAuth,
  requireRole(["giang_vien"]),
  async (req, res) => {
    await svc.deleteDocument(req.params.id, req.params.docId, req.auth!.sub);
    res.json({ ok: true });
  }
);

// Điểm
r.get(
  "/lop-hoc-phan/:id/diem",
  requireAuth,
  requireRole(["giang_vien"]),
  async (req, res) => {
    const { rows } = await svc.getGrades(req.params.id, req.auth!.sub);
    res.json({ ok: true, data: rows });
  }
);

r.put(
  "/lop-hoc-phan/:id/diem",
  requireAuth,
  requireRole(["giang_vien"]),
  async (req, res) => {
    await svc.upsertGrades(req.params.id, req.auth!.sub, req.body.items || []);
    res.json({ ok: true });
  }
);

export default r;
