import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import {
  createBulkKyPhaseHandler,
  getHocKyHienHanhHandler,
  getHocKyNienKhoaHandler,
  setHocKyHienThanhHandler,
  getDeXuatHocPhanForPDTHandler,
  updateTrangThaiByPDTHandler,
  tuChoiDeXuatHocPhanHandler, // Import thêm
} from "./pdt_chuyentrangthai_service";
import sinhVienRouter from "./pdt_crud_sv_service";
import {
  getDanhSachKhoaHandler,
  getPhasesByHocKyHandler,
  updateDotGhiDanhHandler,
} from "./pdt_kyPhase_service";
import { getAllDotDangKyByHocKyHandler } from "./pdt_dotDangKy_service";

import {
  getAllGiangVienHandler,
  getGiangVienByIdHandler,
  createGiangVienHandler,
  updateGiangVienHandler,
  deleteGiangVienHandler,
} from "./pdt_crud_gv_service";

const r = Router();

r.get("/me", requireAuth, requireRole(["phong_dao_tao"]), (req, res) => {
  res.json({ ok: true, role: req.auth!.role });
});

r.get("/hoc-ky-nien-khoa", getHocKyNienKhoaHandler);

r.post(
  "/ky-phase/bulk",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  createBulkKyPhaseHandler
);

r.get("/hoc-ky-hien-hanh", getHocKyHienHanhHandler);

r.post(
  "/hoc-ky-hien-hanh",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  setHocKyHienThanhHandler
);

// Lấy danh sách đề xuất
r.get(
  "/de-xuat-hoc-phan",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  getDeXuatHocPhanForPDTHandler
);

// Duyệt đề xuất
r.patch(
  "/de-xuat-hoc-phan/duyet",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  updateTrangThaiByPDTHandler
);

// Từ chối đề xuất
r.patch(
  "/de-xuat-hoc-phan/tu-choi",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  tuChoiDeXuatHocPhanHandler
);

// CRUD sinh viên
r.use(
  "/sinh-vien",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  sinhVienRouter
);

// CRUD giảng viên
r.get(
  "/giang-vien",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  getAllGiangVienHandler
);

r.get(
  "/giang-vien/:id",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  getGiangVienByIdHandler
);

r.post(
  "/giang-vien",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  createGiangVienHandler
);

r.put(
  "/giang-vien/:id",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  updateGiangVienHandler
);

r.delete(
  "/giang-vien/:id",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  deleteGiangVienHandler
);

r.get(
  "/ky-phase/:hocKyId",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  getPhasesByHocKyHandler
);

r.get(
  "/khoa",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  getDanhSachKhoaHandler
);

r.post(
  "/dot-ghi-danh/update",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  updateDotGhiDanhHandler
);

r.get(
  "/dot-dang-ky/:hocKyId",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  getAllDotDangKyByHocKyHandler
);

export default r;
