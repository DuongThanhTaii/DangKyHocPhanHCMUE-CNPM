import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { ChinhSachTinChiRepository } from "../../repositories/chinhSachTinChiRepository";
import { ok, fail } from "../../types/serviceResult";
import { prisma } from "../../db/prisma";
// import { requireAuth } from "../../middlewares/auth";

const router = Router();

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  hoc_ky_id: z.string().uuid().nullable().optional(),
  khoa_id: z.string().uuid().nullable().optional(),
  nganh_id: z.string().uuid().nullable().optional(),
  phi_moi_tin_chi: z.number().nonnegative(),
  ngay_hieu_luc: z.string().datetime().optional(),
  ngay_het_hieu_luc: z.string().datetime().nullable().optional(),
});

/** POST /api/chinh-sach-tin-chi  (create/update đơn giản theo phạm vi) */
router.post(
  "/",
  /* requireAuth, */ async (req, res) => {
    try {
      const body = upsertSchema.parse(req.body);

      const saved = await prisma.chinh_sach_tin_chi.create({ // ✅ Dùng Prisma trực tiếp
        data: {
          ...body,
          phi_moi_tin_chi: new Prisma.Decimal(body.phi_moi_tin_chi),
          ngay_hieu_luc: body.ngay_hieu_luc
            ? new Date(body.ngay_hieu_luc)
            : new Date(),
          ngay_het_hieu_luc: body.ngay_het_hieu_luc
            ? new Date(body.ngay_het_hieu_luc)
            : null,
        }
      });

      res.json(ok(saved));
    } catch (e: any) {
      res.status(400).json(fail(e.message));
    }
  }
);

router.get("/", async (_req, res) => {
  try {
    const data = await prisma.chinh_sach_tin_chi.findMany({
      orderBy: [{ ngay_hieu_luc: "desc" }],
      include: {
        hoc_ky: { select: { ten_hoc_ky: true, ma_hoc_ky: true } },
        khoa: { select: { ten_khoa: true } },
        nganh_hoc: { select: { ten_nganh: true } },
      },
    });
    res.json(ok(data));
  } catch (e: any) {
    res.status(500).json(fail(e.message));
  }
});

export default router;
