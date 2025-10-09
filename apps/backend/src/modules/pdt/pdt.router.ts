import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import {
  getHocKyNienKhoaHandler,
  createBulkKyPhaseHandler,
  setHocKyHienThanhHandler,
  getHocKyHienHanhHandler,
} from "./pdt_chuyentrangthai_service";

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
export default r;