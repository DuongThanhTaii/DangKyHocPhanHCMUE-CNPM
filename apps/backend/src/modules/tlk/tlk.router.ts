// apps/backend/src/modules/tlk/tlk.router.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { tlkService } from "./tlk.lendanhsachhocphan";
import {
  createDeXuatHocPhanHandler,
  getDeXuatHocPhanForTroLyKhoaHandler
} from "./tlk_dexuathocphan_service";
import {
  getPhongHocByTLKHandler,
  xepThoiKhoaBieuHandler,
  getTKBByMaHocPhanHandler,
  getTKBByHocKyHandler,
  getTKBByMaHocPhansHandler,
} from "./tlk_lenThoiKhoaBieu_service";
import { getHocKyHienHanhHandler } from "../pdt/pdt_chuyentrangthai_service";
import { getAvailablePhongHocHandler } from "../pdt/pdt_phong_hoc_service";
import { getHocPhansForCreateLopHandler } from "../pdt/pdt_curd_lop_hoc_phan_service";

const r = Router();

console.log("TLK router loaded");

r.get("/hien-hanh", requireAuth, async (_req, res) => {
  try {
    const data = await tlkService.hienHanhHocKy();
    res.json(data);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

r.get(
  "/mon-hoc",
  requireAuth,
  requireRole(["tro_ly_khoa"]),
  async (req, res) => {
    console.log(req.auth);
    const user_id = (req.auth as any).sub as string | undefined;
    if (!user_id)
      return res.status(400).json({ error: "Không xác định tài khoản" });
    const data = await tlkService.danhMucMonHocTheoKhoa(user_id);
    res.json({ data });
  }
);

r.get(
  "/giang-vien",
  requireAuth,
  requireRole(["tro_ly_khoa"]),
  async (req, res) => {
    const user_id = (req.auth as any).sub as string | undefined;
    if (!user_id)
      return res.status(400).json({ error: "Không xác định tài khoản" });
    const data = await tlkService.giangVienTheoKhoa(user_id);
    res.json({ data });
  }
);

// Tạo đề xuất
r.get(
  "/de-xuat-hoc-phan",
  requireAuth,
  requireRole(["tro_ly_khoa"]),
  getDeXuatHocPhanForTroLyKhoaHandler
);

r.post(
  "/de-xuat-hoc-phan",
  requireAuth,
  requireRole(["tro_ly_khoa"]),
  createDeXuatHocPhanHandler
);

// Lấy danh sách phòng học của khoa
r.get(
  "/phong-hoc",
  requireAuth,
  requireRole(["tro_ly_khoa"]),
  getPhongHocByTLKHandler
);

// ✅ Xếp thời khóa biểu
r.post(
  "/thoi-khoa-bieu",
  requireAuth,
  requireRole(["tro_ly_khoa"]),
  xepThoiKhoaBieuHandler
);

// ✅ Lấy TKB theo mã học phần
r.get(
  "/thoi-khoa-bieu",
  requireAuth,
  requireRole(["tro_ly_khoa"]),
  getTKBByMaHocPhanHandler
);

// ✅ Lấy tất cả TKB của học kỳ
r.get(
  "/thoi-khoa-bieu/hoc-ky/:hocKyId",
  requireAuth,
  requireRole(["tro_ly_khoa"]),
  getTKBByHocKyHandler
);

r.post(
  "/thoi-khoa-bieu/batch",
  requireAuth,
  requireRole(["tro_ly_khoa"]),
  getTKBByMaHocPhansHandler
);

r.get("/hoc-ky-hien-hanh", getHocKyHienHanhHandler);

r.get(
  "/phong-hoc/available",
  requireAuth,
  requireRole(["tro_ly_khoa"]),
  getAvailablePhongHocHandler
);

r.get(
  "/lop-hoc-phan/get-hoc-phan/:hocKyId",
  requireAuth,
  requireRole(["tro_ly_khoa"]),
  getHocPhansForCreateLopHandler
);

export default r;
