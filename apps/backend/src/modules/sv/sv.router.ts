import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import {
  checkPhaseDangKyHandler,
  getDanhSachLopHocPhanHandler,
  getDanhSachLopDaDangKyHandler,
  getDanhSachLopChuaDangKyByMonHocHandler,
} from "./sv_lopHocPhan_service";
import {
  dangKyHocPhanHandler,
  huyDangKyHocPhanHandler,
  chuyenLopHocPhanHandler,
} from "./sv_dangKyHocPhan_service";
import {
  checkTrangThaiGhiDanhHandler,

} from "./sinhvien_ghiDanh_service";
import { ghiDanhMonHocHandler, getMonHocGhiDanhHandler, getDanhSachDaGhiDanhHandler } from "./sv_monhoc_service";
const r = Router();

r.get("/me", requireAuth, requireRole(["sinh_vien"]), (req, res) => {
  res.json({ ok: true, role: req.auth!.role });
});

// ============ GHI DANH ============

// ✅ Check phase ghi danh
r.get(
  "/check-ghi-danh",
  requireAuth,
  requireRole(["sinh_vien"]),
  checkTrangThaiGhiDanhHandler
);

r.get(
  "/mon-hoc-ghi-danh",
  requireAuth,
  requireRole(["sinh_vien"]),
  getMonHocGhiDanhHandler
);

// ✅ Ghi danh môn học
r.post(
  "/ghi-danh",
  requireAuth,
  requireRole(["sinh_vien"]),
  ghiDanhMonHocHandler
);

// ✅ Load danh sách ghi danh của tôi
r.get(
  "/ghi-danh/my",
  requireAuth,
  requireRole(["sinh_vien"]),
  getDanhSachDaGhiDanhHandler
);

// ============ ĐĂNG KÝ HỌC PHẦN ============

// ✅ Check phase đăng ký học phần
r.get(
  "/check-phase-dang-ky",
  requireAuth,
  requireRole(["sinh_vien"]),
  checkPhaseDangKyHandler
);

// ✅ Load danh sách lớp học phần (phân cụm, filter đã đăng ký)
r.get(
  "/lop-hoc-phan",
  requireAuth,
  requireRole(["sinh_vien"]),
  getDanhSachLopHocPhanHandler
);

// ✅ Load danh sách lớp chưa đăng ký của 1 môn
r.get(
  "/lop-hoc-phan/mon-hoc",
  requireAuth,
  requireRole(["sinh_vien"]),
  getDanhSachLopChuaDangKyByMonHocHandler
);

// ✅ Load danh sách lớp đã đăng ký
r.get(
  "/lop-da-dang-ky",
  requireAuth,
  requireRole(["sinh_vien"]),
  getDanhSachLopDaDangKyHandler
);

// ✅ Đăng ký học phần
r.post(
  "/dang-ky-hoc-phan",
  requireAuth,
  requireRole(["sinh_vien"]),
  dangKyHocPhanHandler
);

// ✅ Hủy đăng ký học phần
r.post(
  "/huy-dang-ky-hoc-phan",
  requireAuth,
  requireRole(["sinh_vien"]),
  huyDangKyHocPhanHandler
);

// ✅ Chuyển lớp học phần
r.post(
  "/chuyen-lop-hoc-phan",
  requireAuth,
  requireRole(["sinh_vien"]),
  chuyenLopHocPhanHandler
);

export default r;
