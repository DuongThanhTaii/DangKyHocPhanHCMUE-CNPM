import { Router } from "express";
import { container } from "../../../../infrastructure/di/container";
import { QuanLyHocKyController } from "../../controllers/pdtQuanLyHocKy/QuanLyHocKyController";
import { requireAuth, requireRole } from "../../../../middlewares/auth";

const router = Router();
const controller = container.get(QuanLyHocKyController);

// POST /api/pdt/quan-ly-hoc-ky/hoc-ky-hien-hanh (Set học kỳ hiện hành)
router.post(
    "/hoc-ky-hien-hanh",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.setHocKyHienHanh(req, res)
);

// POST /api/pdt/quan-ly-hoc-ky/ky-phase/bulk (Create bulk ky phase)
router.post(
    "/ky-phase/bulk",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.createBulkKyPhase(req, res)
);

// GET /api/pdt/quan-ly-hoc-ky/ky-phase/:hocKyId (Get phases by học kỳ)
router.get(
    "/ky-phase/:hocKyId",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.getPhasesByHocKy(req, res)
);

export default router;
