import { Router } from "express";
import { container } from "../../../../infrastructure/di/container";
import { BaoCaoController } from "../../controllers/baoCaoThongKe/BaoCaoController";
import { requireAuth, requireRole } from "../../../../middlewares/auth";

const router = Router();
const controller = container.get(BaoCaoController);

// GET /api/bao-cao/overview
router.get(
    "/overview",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.getOverview(req, res)
);

// GET /api/bao-cao/dk-theo-khoa
router.get(
    "/dk-theo-khoa",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.getDangKyTheoKhoa(req, res)
);

// GET /api/bao-cao/dk-theo-nganh
router.get(
    "/dk-theo-nganh",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.getDangKyTheoNganh(req, res)
);

// GET /api/bao-cao/tai-giang-vien
router.get(
    "/tai-giang-vien",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.getTaiGiangVien(req, res)
);

// GET /api/bao-cao/export/excel
router.get(
    "/export/excel",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.exportExcel(req, res)
);

// POST /api/bao-cao/export/pdf
router.post(
    "/export/pdf",
    requireAuth,
    requireRole(["phong_dao_tao"]),
    (req, res) => controller.exportPDF(req, res)
);

export default router;
