import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { container } from "../../infrastructure/di/container";
import { TuitionController } from "../controllers/tuition/TuitionController";

const router = Router();
const tuitionController = container.get(TuitionController);

// ✅ Lấy chi tiết học phí
router.get(
    "/chi-tiet",
    requireAuth,
    requireRole(["sinh_vien"]),
    (req, res) => tuitionController.getTuitionDetails(req, res)
);

// ✅ Tính lại học phí
router.post(
    "/compute",
    requireAuth,
    requireRole(["sinh_vien"]),
    (req, res) => tuitionController.computeTuition(req, res)
);

export default router;
