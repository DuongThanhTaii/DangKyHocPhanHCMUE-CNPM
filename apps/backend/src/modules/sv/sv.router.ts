import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import {
  getMonHocGhiDanhHandler,
  ghiDanhMonHocHandler,
  getDanhSachDaGhiDanhHandler,
} from "./sv_monhoc_service";
import { checkTrangThaiGhiDanhHandler, huyGhiDanhMonHocHandler } from "./sinhvien_ghiDanh_service";

const r = Router();

r.get("/me", requireAuth, requireRole(["sinh_vien"]), (req, res) => {
  res.json({ ok: true, role: req.auth!.role });
});

// Lấy danh sách môn học ghi danh (chưa đăng ký)
r.get(
  "/mon-hoc-ghi-danh",
  requireAuth,
  requireRole(["sinh_vien"]),
  getMonHocGhiDanhHandler
);

// Ghi danh môn học
r.post(
  "/ghi-danh",
  requireAuth,
  requireRole(["sinh_vien"]),
  ghiDanhMonHocHandler
);

// Lấy danh sách đã ghi danh
r.get(
  "/ghi-danh/my",
  requireAuth,
  requireRole(["sinh_vien"]),
  getDanhSachDaGhiDanhHandler
);

r.get(
  "/check-ghi-danh",
  requireAuth,
  requireRole(["sinh_vien"]),
  checkTrangThaiGhiDanhHandler
);

r.delete(
  "/ghi-danh",
  requireAuth,
  requireRole(["sinh_vien"]),
  huyGhiDanhMonHocHandler
);
export default r;
