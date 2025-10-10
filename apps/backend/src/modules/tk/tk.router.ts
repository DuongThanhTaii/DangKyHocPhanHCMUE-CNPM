import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { getDeXuatHocPhanForTruongKhoaHandler, updateTrangThaiByTruongKhoaHandler } from "./tk_dexuathocphan_service";

const r = Router();

r.get("/me", requireAuth, requireRole(["truong_khoa"]), (req, res) => {
  res.json({ ok: true, role: req.auth!.role });
});

r.get(
  "/de-xuat-hoc-phan",
  requireAuth,
  requireRole(["truong_khoa"]),
  getDeXuatHocPhanForTruongKhoaHandler
);

r.patch(
  "/de-xuat-hoc-phan/duyet",
  requireAuth,
  requireRole(["truong_khoa"]),
  updateTrangThaiByTruongKhoaHandler
);

export default r;
