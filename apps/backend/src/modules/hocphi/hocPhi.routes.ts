import { Router } from "express";
import { computeTuitionForStudent } from "../../services/hocPhiServices";
import { HocPhiRepository } from "../../repositories/hocPhiRepository";
import { ok, fail } from "../../types/serviceResult"; // nếu bạn đang dùng helper tương tự

const router = Router();

// POST /api/hoc-phi/:sinh_vien_id/tinh-toan?hoc_ky_id=...
router.post("/:sinh_vien_id/tinh-toan", async (req, res) => {
  try {
    const { sinh_vien_id } = req.params;
    const hoc_ky_id = String(req.query.hoc_ky_id || "");
    if (!hoc_ky_id) return res.status(400).json(fail("Missing hoc_ky_id"));

    const result = await computeTuitionForStudent(sinh_vien_id, hoc_ky_id);
    res.json(ok(result));
  } catch (e: any) {
    res.status(400).json(fail(e.message));
  }
});

// GET /api/hoc-phi/:sinh_vien_id?hoc_ky_id=...
router.get("/:sinh_vien_id", async (req, res) => {
  try {
    const { sinh_vien_id } = req.params;
    const hoc_ky_id = req.query.hoc_ky_id as string | undefined;

    const data = hoc_ky_id
      ? await HocPhiRepository.getOneOfStudent(sinh_vien_id, hoc_ky_id)
      : await HocPhiRepository.listOfStudent(sinh_vien_id);

    res.json(ok(data));
  } catch (e: any) {
    res.status(400).json(fail(e.message));
  }
});

export default router;
