// apps/backend/src/modules/tlk/tlk.router.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { tlkService } from "./tlk.lendanhsachhocphan";
import {
  createDeXuatHocPhanHandler,
  getDeXuatHocPhanForTroLyKhoaHandler // Import thêm
} from "./tlk_dexuathocphan_service";

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

// Lấy tất cả đề xuất của khoa


export default r;
