import { Router } from "express";
import { container } from "../../../../infrastructure/di/container";
import { SinhVienController } from "../../controllers/qlSinhVienPDT/SinhVienController";
import { requireAuth, requireRole } from "../../../../middlewares/auth";

const router = Router();
const controller = container.get(SinhVienController);

// GET /api/pdt/sinh-vien?page=1&pageSize=20&search=abc
router.get(
    "/",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.list(req, res)
);

// GET /api/pdt/sinh-vien/:id
router.get(
    "/:id",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.getDetail(req, res)
);

// POST /api/pdt/sinh-vien
router.post(
    "/",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.create(req, res)
);

// PUT /api/pdt/sinh-vien/:id
router.put(
    "/:id",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.update(req, res)
);

// DELETE /api/pdt/sinh-vien/:id
router.delete(
    "/:id",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.delete(req, res)
);

export default router;
