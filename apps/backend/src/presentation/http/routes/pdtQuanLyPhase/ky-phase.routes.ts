import { Router } from "express";
import { container } from "../../../../infrastructure/di/container";
import { TYPES } from "../../../../infrastructure/di/types";
import { KyPhaseController } from "../../controllers/pdtQuanLyPhase/KyPhaseController";
import { requireAuth, requireRole } from "../../../../middlewares/auth";

const router = Router();

// ✅ FIX: Use correct TYPES symbol
const controller = container.get<KyPhaseController>(TYPES.PdtQuanLyPhase.KyPhaseController);

// ✅ GET /api/pdt/ky-phase/current (NO auth required for demo)
router.get("/current", (req, res) => controller.getCurrentActivePhase(req, res));

// ✅ PATCH /api/pdt/ky-phase/toggle (requires auth)
router.patch(
    "/toggle",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.togglePhase(req, res)
);

export default router;
