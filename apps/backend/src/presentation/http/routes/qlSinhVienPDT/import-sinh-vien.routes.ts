import { Router } from "express";
import { container } from "../../../../infrastructure/di/container";
import { TYPES } from "../../../../infrastructure/di/types";
import { ImportSinhVienController } from "../../controllers/qlSinhVienPDT/ImportSinhVienController";
import { requireAuth, requireRole } from "../../../../middlewares/auth";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// ✅ Get controller from DI container
const controller = container.get<ImportSinhVienController>(TYPES.QlSinhVienPDT.ImportSinhVienController);

// ✅ POST /api/pdt/sinh-vien/import/excel (FE endpoint)
router.post(
  "/excel",
  requireAuth,
  requireRole(["phong_dao_tao"]),
  // accept single file field named 'file' (optional)
  upload.single("file"),
  (req, res) => controller.import(req, res)
);

export default router;
