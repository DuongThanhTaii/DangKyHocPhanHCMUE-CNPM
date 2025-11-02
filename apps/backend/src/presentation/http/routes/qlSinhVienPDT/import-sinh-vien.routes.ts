import { Router } from "express";
import multer from "multer";
import { container } from "../../../../infrastructure/di/container";
import { ImportSinhVienController } from "../../controllers/qlSinhVienPDT/ImportSinhVienController";
import { requireAuth, requireRole } from "../../../../middlewares/auth";

const router = Router();
const controller = container.get(ImportSinhVienController);

// Multer configuration
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST /api/pdt/sinh-vien/import/excel
router.post(
    "/excel",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    upload.single("file"),
    (req, res) => controller.importWithExcel(req, res)
);

// POST /api/pdt/sinh-vien/import/self-input
router.post(
    "/self-input",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.importWithSelfInput(req, res)
);

export default router;
