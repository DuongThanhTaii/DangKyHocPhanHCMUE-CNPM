import { Router } from "express";
import { container } from "../../../../infrastructure/di/container";
import { HocKyPublicController } from "../../controllers/hocKyPublic/HocKyPublicController";
import { requireAuth } from "../../../../middlewares/auth";

const router = Router();
const controller = container.get(HocKyPublicController);

// GET /api/hoc-ky-nien-khoa (✅ Require Auth)
router.get(
    "/hoc-ky-nien-khoa",
    requireAuth,
    (req, res) => controller.getHocKyNienKhoa(req, res)
);

// GET /api/hoc-ky-hien-hanh (✅ Require Auth)
router.get(
    "/hoc-ky-hien-hanh",
    requireAuth,
    (req, res) => controller.getHocKyHienHanh(req, res)
);

export default router;
