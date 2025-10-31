import "reflect-metadata";
import { Router } from "express";
import { requireAuth, requireRole } from "../../../middlewares/auth";
import { TuitionCalculationController } from "../controllers/pdt/TuitionCalculation.controller";

const router = Router();
const tuitionController = new TuitionCalculationController();

// ✅ Tính học phí hàng loạt (PDT only)
router.post(
    "/calculate-semester",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => tuitionController.calculateForSemester(req, res)
);

export default router;
