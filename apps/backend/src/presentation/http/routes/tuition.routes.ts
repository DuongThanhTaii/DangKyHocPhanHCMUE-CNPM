import "reflect-metadata";
import { Router } from "express";
import { requireAuth, requireRole } from "../../../middlewares/auth";
import { TuitionCalculationController } from "../controllers/pdt/TuitionCalculation.controller";

const router = Router();
const tuitionCalculationController = new TuitionCalculationController();

// ✅ PDT: Tính học phí hàng loạt
router.post(
    "/calculate-semester",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => tuitionCalculationController.calculateForSemester(req, res)
);



export default router;
