import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth";

const r = Router();

r.get("/me", requireAuth, requireRole(["tro_ly_khoa"]), (req, res) => {
  res.json({ ok: true, role: req.auth!.role });
});

export default r;
