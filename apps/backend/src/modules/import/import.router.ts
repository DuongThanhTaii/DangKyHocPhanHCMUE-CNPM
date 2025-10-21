import { Router } from "express";
import { uploadExcel } from "./upload";
import {
  importSinhVienHandler,
  importGiangVienHandler,
  importMonHocHandler,
} from "./import.service";
import { requireAuth, requireRole } from "../../middlewares/auth";

const r = Router();

r.post(
  "/sinh-vien",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  uploadExcel.single("file"),
  importSinhVienHandler
);

r.post(
  "/giang-vien",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  uploadExcel.single("file"),
  importGiangVienHandler
);

r.post(
  "/mon-hoc",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  uploadExcel.single("file"),
  importMonHocHandler
);

export default r;
