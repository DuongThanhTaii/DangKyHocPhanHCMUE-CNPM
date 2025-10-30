import { Router } from "express";
import { z } from "zod";
import { MienGiamHocPhiServices } from "../../services/mienGiamHocPhiServices";
import { ok, fail } from "../../types/serviceResult";
// import { requireAuth } from "../../middlewares/auth";

const router = Router();

const setSchema = z.object({
  sinh_vien_id: z.string().uuid(),
  hoc_ky_id: z.string().uuid(),
  loai: z.string().min(1), // ví dụ: 'nghi_dinh_mien_hoc_phi'
  mien_phi: z.boolean().optional(),
  ti_le_giam: z.number().min(0).max(100).optional(),
  ghi_chu: z.string().optional(),
});

/** POST /api/mien-giam  (upsert) */
router.post(
  "/",
  /* requireAuth, */ async (req, res) => {
    try {
      const data = setSchema.parse(req.body);
      const mg = await MienGiamHocPhiServices.upsert(data);
      res.json(ok(mg));
    } catch (e: any) {
      res.status(400).json(fail(e.message));
    }
  }
);

/** GET /api/mien-giam/by-semester/:hoc_ky_id  (liệt kê theo kỳ) */
router.get(
  "/by-semester/:hoc_ky_id",
  /* requireAuth, */ async (req, res) => {
    try {
      const { hoc_ky_id } = req.params;
      const list = await MienGiamHocPhiServices.listBySemester(hoc_ky_id);
      res.json(ok(list));
    } catch (e: any) {
      res.status(400).json(fail(e.message));
    }
  }
);

export default router;
