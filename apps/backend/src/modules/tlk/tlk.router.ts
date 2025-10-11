// apps/backend/src/modules/tlk/tlk.router.ts
import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { tlkService } from "./tlk.lendanhsachhocphan";
import { createDeXuatHocPhanHandler } from "./tlk_dexuathocphan_service";

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
    console.log(req.auth)
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

r.post(
  "/de-xuat-hoc-phan/batch",
  requireAuth,
  requireRole(["tro_ly_khoa"]),
  async (req, res) => {
    const khoa_id = (req.auth as any).khoa_id as string | undefined;
    const nguoi_tao_id = req.auth!.sub;
    const { hoc_ky_id, danhSachDeXuat } = req.body;
    if (!khoa_id)
      return res.status(400).json({ error: "Không xác định khoa của TLK" });
    if (
      !hoc_ky_id ||
      !Array.isArray(danhSachDeXuat) ||
      danhSachDeXuat.length === 0
    )
      return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
    try {
      const result = await tlkService.batchDeXuatHocPhan(
        khoa_id,
        nguoi_tao_id,
        hoc_ky_id,
        danhSachDeXuat
      );
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
);

// // Thêm route mới cho lên danh sách học phần
// r.get(
//   "/tlk/len-danh-sach-hoc-phan",
//   requireAuth,
//   requireRole(["tro_ly_khoa"]),
//   async (req, res) => {
//     const khoa_id = (req.auth as any).khoa_id as string | undefined;
//     const hoc_ky_id = req.query.hoc_ky_id as string;
//     if (!khoa_id || !hoc_ky_id)
//       return res.status(400).json({ error: "Thiếu khoa_id hoặc hoc_ky_id" });
//     const data = await tlkService.lenDanhSachHocPhan(khoa_id, hoc_ky_id);
//     res.json({ data });
//   }
// );
r.post(
  "/de-xuat-hoc-phan",
  requireAuth,
  requireRole(["tro_ly_khoa"]),
  createDeXuatHocPhanHandler
);
export default r;
