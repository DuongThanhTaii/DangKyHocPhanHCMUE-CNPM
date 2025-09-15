import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";

const r = Router();

r.get("/me", requireAuth, requireRole(["giang_vien"]), (req, res) => {
  res.json({ ok: true, role: req.auth!.role });
});

export default r;
