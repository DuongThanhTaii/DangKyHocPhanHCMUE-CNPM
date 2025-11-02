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
import {
  getDanhSachKhoaHandler,
  getPhasesByHocKyHandler,
  updateDotGhiDanhHandler,
} from "./pdt_kyPhase_service";
import {
  getAllDotDangKyByHocKyHandler,
  getDotDangKyByHocKyHandler,
  updateDotDangKyHandler,
} from "./pdt_dotDangKy_service";

import {
  getAllGiangVienHandler,
  getGiangVienByIdHandler,
  createGiangVienHandler,
  updateGiangVienHandler,
  deleteGiangVienHandler,
} from "./pdt_crud_gv_service";

import {
  listMonHocHandler,
  detailMonHocHandler,
  createMonHocHandler,
  updateMonHocHandler,
  deleteMonHocHandler,
} from "./pdt_crud_monhoc_service";

import { getHocPhansForCreateLopHandler } from "./pdt_curd_lop_hoc_phan_service";

import {
  getAvailablePhongHocHandler,
  getAllPhongHocByKhoaIdHandler,
  assignPhongHocByKhoaIdHandler,
  unassignPhongHocByKhoaIdHandler,
} from "./pdt_phong_hoc_service";
import {
  getAllChinhSachTinChiHandler,
  createChinhSachTinChiHandler,
  updateChinhSachTinChiHandler,
} from "./pdt_chinhSachTinChi_service";

const r = Router();

r.get("/me", requireAuth, requireRole(["phong_dao_tao"]), (req, res) => {
  res.json({ ok: true, role: req.auth!.role });
});

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

// CRUD Môn học
r.get(
  "/mon-hoc",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  listMonHocHandler
);
r.get(
  "/mon-hoc/:id",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  detailMonHocHandler
);
r.post(
  "/mon-hoc",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  createMonHocHandler
);
r.put(
  "/mon-hoc/:id",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  updateMonHocHandler
);
r.delete(
  "/mon-hoc/:id",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  deleteMonHocHandler
);

//

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

// ✅ Đợt đăng ký học phần
r.get(
  "/dot-dang-ky",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  getDotDangKyByHocKyHandler
);

r.put(
  "/dot-dang-ky",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  updateDotDangKyHandler
);

// Đợt đăng ký toàn bộ (deprecated route - giữ để backward compatible)
r.get(
  "/dot-dang-ky/:hocKyId",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  getAllDotDangKyByHocKyHandler
);

// ✅ Phòng học
r.get(
  "/phong-hoc/available",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  getAvailablePhongHocHandler
);

r.get(
  "/phong-hoc/khoa/:khoaId",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  getAllPhongHocByKhoaIdHandler
);

// ✅ Fix: Gán phòng học (PATCH không có :khoaId trong path)
r.patch(
  "/phong-hoc/assign",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  assignPhongHocByKhoaIdHandler
);

// ✅ Fix: Xóa gán phòng học (PATCH không có :khoaId trong path)
r.patch(
  "/phong-hoc/unassign",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  unassignPhongHocByKhoaIdHandler
);

// ============ CHÍNH SÁCH TÍN CHỈ ============

// ✅ Lấy danh sách chính sách tín chỉ
r.get(
  "/chinh-sach-tin-chi",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  getAllChinhSachTinChiHandler
);

// ✅ Tạo chính sách tín chỉ
r.post(
  "/chinh-sach-tin-chi",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  createChinhSachTinChiHandler
);

// ✅ Cập nhật phí tín chỉ
r.put(
  "/chinh-sach-tin-chi/:id",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  updateChinhSachTinChiHandler
);

export default r;
