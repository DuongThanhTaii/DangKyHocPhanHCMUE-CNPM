import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { container } from "../../infrastructure/di/container";
import { TuitionController } from "../controllers/tuition/TuitionController";

const router = Router();
const tuitionController = container.get(TuitionController);

// ✅ SV: Get tuition details
router.get(
    "/chi-tiet",
    requireAuth,
    requireRole(["sinh_vien"]),
    (req, res) => tuitionController.getTuitionDetails(req, res)
);

// ✅ PDT: Compute tuition for semester
router.post(
    "/compute",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => tuitionController.computeTuition(req, res)
);

export default router;
