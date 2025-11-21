import { Router } from "express";
import { container } from "../../../../infrastructure/di/container";
import { TYPES } from "../../../../infrastructure/di/types";
import { SinhVienController } from "../../controllers/qlSinhVienPDT/SinhVienController";
import { requireAuth, requireRole } from "../../../../middlewares/auth";

const router = Router();

// ✅ Get controller from DI container (use TYPES.QlSinhVienPDT.*)
const controller = container.get<SinhVienController>(TYPES.QlSinhVienPDT.SinhVienController);

// ✅ Routes (giữ nguyên endpoints để FE không sửa)
router.get(
    "/",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.list(req, res)
);

router.get(
    "/:id",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.getDetail(req, res)
);

router.post(
    "/",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.create(req, res)
);

router.put(
    "/:id",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.update(req, res)
);

router.delete(
    "/:id",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.delete(req, res)
);

export default router;
