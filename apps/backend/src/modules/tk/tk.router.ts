import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import {
  getDeXuatHocPhanForTruongKhoaHandler,
  updateTrangThaiByTruongKhoaHandler,
  tuChoiDeXuatHocPhanHandler // Import thêm
} from "./tk_dexuathocphan_service";

const r = Router();

r.get("/me", requireAuth, requireRole(["truong_khoa"]), (req, res) => {
  res.json({ ok: true, role: req.auth!.role });
});

// Lấy danh sách đề xuất
r.get(
  "/de-xuat-hoc-phan",
  requireAuth,
  requireRole(["truong_khoa"]),
  getDeXuatHocPhanForTruongKhoaHandler
);

// Duyệt đề xuất
r.patch(
  "/de-xuat-hoc-phan/duyet",
  requireAuth,
  requireRole(["truong_khoa"]),
  updateTrangThaiByTruongKhoaHandler
);

// Từ chối đề xuất
r.patch(
  "/de-xuat-hoc-phan/tu-choi",
  requireAuth,
  requireRole(["truong_khoa"]),
  tuChoiDeXuatHocPhanHandler
);

export default r;
